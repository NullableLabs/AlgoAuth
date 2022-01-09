const __webpack_nonce__ = 'ABCD1234';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import algosdk, {signBytes} from "algosdk";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import {bytesToBase64} from "byte-base64";

const TESTNET_GENESIS_ID = 'testnet-v1.0';
const TESTNET_GENESIS_HASH = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
const connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    qrcodeModal: QRCodeModal,
});
let connectedAddress: string;

/* ----- Wallet Functions ----- */
function startConnection() {
    if (!connector.connected) {
        connector.createSession();
    }

    connector.on("connect", (error, payload) => {  // Subscribe to connection events
        if (error) {
            throw error;
        }
        connectedAddress = payload.params[0].accounts[0]; // Get provided accounts
        updateUser(connectedAddress);
        startAuth(); // debug
    });

    connector.on("session_update", (error, payload) => {
        if (error) {
            throw error;
        }
        connectedAddress = payload.params[0].accounts[0]; // Get provided accounts
        updateUser(connectedAddress);
    });

    connector.on("disconnect", (error, payload) => {
        if (error) {
            throw error;
        }
    });
}

async function startAuth() {
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: connectedAddress,
        to: "KLUCTEDQNCJJBX37RJULE5SMHQKIEAPMIJAO3UT6K3HSU6NSI2RBIVZHYU",
        amount: 0o00000,
        suggestedParams: {
            fee: 0o000,  // microalgos
            flatFee: true,
            firstRound: 10000,
            lastRound: 10200,
            genesisHash: TESTNET_GENESIS_HASH,
            genesisID: TESTNET_GENESIS_ID,
        },
    });

    const txns = [txn]
    const txnsToSign = txns.map(txn => {
        const encodedTxn = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64");
        return {
            txn: encodedTxn,
            message: 'website.URL & nonce',  // developers will need to inject their own nonce here to prevent txn re-use
        };
    });

    const requestParams = [txnsToSign];
    const request = formatJsonRpcRequest("algo_signTxn", requestParams);
    const result: Array<string | null> = await connector.sendCustomRequest(request);
    const decodedResult = result.map(element => {
        return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });
    if (decodedResult[0] == null) {
        return false;
    }

    let encoded = bytesToBase64(decodedResult[0]);
    let parameters = JSON.stringify({
        "transaction": encoded,
        "pubkey": connectedAddress
    });
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/transaction", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            console.log(xmlhttp.responseText);
        }
    }
    xmlhttp.send(parameters);
}

/* ----- UI Functions ----- */
function updateUser(username: string) {
    document.getElementById("loggedIn")!.innerText = username;
}

/* ----- Event Handlers ----- */
document.getElementById("connectWalletBtn")!.addEventListener("click", startConnection);

connector.killSession();