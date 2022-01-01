package main

import (
	"bytes"
	"crypto/ed25519"
	"encoding/base32"
	"encoding/base64"
	"errors"
	"fmt"
	//"github.com/algorand/go-algorand-sdk/crypto"
	"github.com/algorand/go-algorand-sdk/encoding/msgpack"
	"github.com/algorand/go-algorand-sdk/types"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type transaction struct {
	Payload string `json:"transaction" binding:"required"`
	PubKey  string `json:"pubkey" binding:"required"`
}

func GetPubKey(address string) (ed25519.PublicKey, error) {
	checksumLenBytes := 4
	decoded, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(address)
	if err != nil {
		return nil, errors.New("could not decode algo address")
	}
	if len(decoded) != len(types.Address{})+checksumLenBytes {
		return nil, errors.New("decoded algo address wrong length")
	}
	addressBytes := decoded[:len(types.Address{})]
	return addressBytes, nil
}

func HomeRoutes(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "pageHome.tmpl", gin.H{})
	})

	router.POST("/transaction", func(c *gin.Context) {
		var transaction transaction
		err := c.BindJSON(&transaction)
		if err != nil {
			c.AbortWithStatus(400)
			return
		}

		decodedTransaction, err := base64.StdEncoding.DecodeString(transaction.Payload)
		if err != nil {
			c.AbortWithStatus(400)
			return
		}

		var signedTxn types.SignedTxn
		err = msgpack.Decode(decodedTransaction, &signedTxn)
		if err != nil {
			c.AbortWithStatus(400)
			return
		}

		pubkey, err := GetPubKey(transaction.PubKey)
		if err != nil {
			c.AbortWithStatus(400)
			return
		}

		fmt.Println("--- pubkey (ed25519.PublicKey) ---")
		fmt.Println(pubkey)

		fmt.Println("--- msgpack transaction ([]byte) ---")
		fmt.Println(decodedTransaction)

		fmt.Println("--- signed transaction (types.SignedTxn)")
		fmt.Println(signedTxn)

		fmt.Println("--- transaction (signedTxn.Txn) ---")
		fmt.Println(signedTxn.Txn)

		fmt.Println("--- msgpack transaction + domain separator ([]byte) ---")
		domainSeparator := []byte("TX")
		var buf bytes.Buffer
		buf.Write(domainSeparator)
		buf.Write(decodedTransaction)
		fmt.Println(buf.Bytes())

		fmt.Println("--- sig ---")
		fmt.Println(signedTxn.Sig[:])

		ret := ed25519.Verify(pubkey, signedTxn, signedTxn.Sig[:])
		if ret {
			fmt.Println("signature validated")
			c.JSON(200, `{"status": "validated"}`)
			return
		}
		fmt.Println("signature not validated")
		c.JSON(400, `{"status": "not validated"}`)
	})
}

func main() {
	router := gin.Default()
	router.Use(gin.Recovery())
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.LoadHTMLGlob("src/templates/*.tmpl")
	router.Use(static.Serve("/", static.LocalFile("src/www", false)))
	HomeRoutes(router)
	err := router.Run("0.0.0.0:9090")
	if err != nil {
		log.Panicln("could not start HTTP server")
	}
}
