# AlgoAuth

## Authenticate to a website using only your Algorand wallet

Pass trust from a front-end Algorand WalletConnect session, to a back-end web service

This allows a front-end WalletConnect application to request that a wallet sign a transaction, then send that signed transaction back to a HTTP server. The HTTP server then verifies the transaction signature, and then issues a cookie back to the front-end. The validation of that signature acts as a strong attestation that the front-end application is indeed talking to that given Algo wallet.

This turns a validated WalletConnect transaction, into an HTTP session cookie that the web application can use as a durable session token.

WalletConnect > Algo Wallet > SignedTxn > HTTP POST > Go HTTP server > SignedTxn validation > Return Cookie