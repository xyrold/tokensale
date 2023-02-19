let accounts = [];
let isWallet = false;

//contract info
const _contract = new Object();
_contract.isChain = true;
// _contract.walletId = localStorage.getItem('wallet');
// _contract.account = localStorage.getItem('address');
_contract.abi;


//testNet info
_contract.chain = 97;
_contract.bscScan = "https://testnet.bscscan.com";


//controller contract address (not token address)
const _contractAddress = "0x";

//18 decimals
const oneToken = 1000000000000000000;


//load contract abi functions
async function getAbi() {
    await $.getJSON("/content/contract/presale.json", function (data) {
        _contract.abi = data;
    });
}


//init
async function initContract() {
    if (_contract.walletId == 1) {
        //metamask wallet
        _contract.provider = new ethers.providers.Web3Provider(window.ethereum);
    } else if (_contract.walletId == 2) {
        //binance wallet
        _contract.provider = new ethers.providers.Web3Provider(BinanceChain);
    }

    _contract.signer = _contract.provider.getSigner();
    _contract.main = new ethers.Contract(_contractAddress, _contract.abi, _contract.provider);
    _contract.sign = _contract.main.connect(_contract.signer);

    getChainInfo();

}

//check user if there is metamask or binance wallet on browser
if (typeof window.ethereum !== 'undefined') {

    ethereum.on('accountsChanged', (accounts) => {
        if (_contract.walletId == 1) {
            location.replace("/home/logout");
        }
    });

}

//binance
if (typeof BinanceChain !== 'undefined') {
    BinanceChain.on('accountsChanged', (accounts) => {
        if (_contract.walletId == 2) {
            location.replace("/");
        }
    });
}

//check wallet network testnet or mainnet
async function getChainInfo() {
    const _chain = await _contract.provider.getNetwork();
    if (_chain.chainId != _contract.chain) {
        swal("Invalid Wallet Network", "Please change to Binance Smart Chain TestNet", "info");
        return;
    }
}

async function getAccount() {
    if (_contract.walletId == 1) {
        //metamask wallet
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    } else if (_contract.walletId == 2) {
        //binance wallet
        accounts = await BinanceChain.request({ method: 'eth_requestAccounts' });
    }

    return accounts[0];
}

//get token balance by user wallet
async function getTokenBalance() {
    const balance = await _contract.main.getTokenbalance(accounts[0]);
    return (Number(balance) / oneToken).toString();
}

//get bnb balance by user wallet
async function getBnbBalance() {
    this.balance = await _contract.provider.getBalance(accounts[0]);
    this.finalBalance = ethers.utils.formatEther(this.balance);
    return Number(this.finalBalance).toFixed(4);
}


async function validateAddress(address) {
    //console.log(address);
    if (address.toLowerCase() === accounts[0].toLowerCase()) {
        return true;
    } else {
        return false;
    }
    
}



async function addTokenToWallet() {

    try {
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', 
                options: {
                    address: "0x", // The address that the token is at.
                    symbol: "XYROLD", // A ticker symbol or shorthand, up to 5 chars.
                    decimals: "18", // The number of decimals in the token
                    image: "", // A string url of the token logo
                },
            },
        });

        if (wasAdded) {
            console.log('Great!');
        } else {
            console.log('Fine!');
        }
    } catch (error) {
        console.log(error);
    }
}