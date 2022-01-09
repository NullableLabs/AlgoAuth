# AlgoAuth

## Authenticate to a website using only your Algorand wallet

Pass trust from a front-end Algorand WalletConnect session, to a back-end web service

This allows a front-end WalletConnect application to request that a wallet sign a transaction, then send that signed transaction back to a HTTP server. The HTTP server then verifies the transaction signature, and then issues a cookie back to the front-end. The validation of that signature acts as a strong attestation that the front-end application is indeed talking to that given Algo wallet.

This turns a validated WalletConnect transaction, into an HTTP session cookie that the web application can use as a durable session token.

WalletConnect > Algo Wallet > SignedTxn > HTTP POST > Go HTTP server > SignedTxn validation > Return Cookie

The transaction never needs to be submitted to the network, so it costs users zero Algo to authenticate

### Production Readiness
This code is a proof-of-concept, and is not intended to be production ready. Some things that are left to the implementing developer:
* It currently only works in testnet, so you'll need to change to mainnet
  * https://github.com/NullableLabs/AlgoAuth/blob/main/src/typescript/wallet.ts#L56
* Add a per-session nonce to the transaction payload, to prevent signed transaction re-use
  * https://github.com/NullableLabs/AlgoAuth/blob/main/src/typescript/wallet.ts#L66
  * 
* Adding in your own address for the transaction to sign
  * https://github.com/NullableLabs/AlgoAuth/blob/main/src/typescript/wallet.ts#L49
* Implement your own application-specific cookie logic
  * https://github.com/NullableLabs/AlgoAuth/blob/main/main.go#L99
* Check for old signed Algorand transactions