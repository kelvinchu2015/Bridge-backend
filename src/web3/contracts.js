import ercAbi from "./abi/erc-abi.json"
import contractAbi from "./abi/contract-abi.json"
import bnbAbi from "./abi/bnb-contract-abi.json"
import TokenAddress from "./abi/token-address.json"

const Web3 = require("web3");
require('dotenv').config()

const privateKeys = []
privateKeys.push(process.env.PRIVATE_KEY)
const infuraProjectId = process.env.INFURA_PROJECT_ID

const provider = new Web3.providers.HttpProvider(`${process.env.RINKEBY_CHAIN}${infuraProjectId}`)
const web3 = new Web3(provider)

const bnbWeb3 = new Web3(process.env.TEST_SMART_CHAIN)

var finuContract = null
var tokenContract = null
var smartContract = null
var account = null
var bnbAccount = null

async function initContracts() {
  bnbAccount = await bnbWeb3.eth.accounts.privateKeyToAccount(privateKeys[0])
  account = await web3.eth.accounts.privateKeyToAccount(privateKeys[0])

  finuContract = new web3.eth.Contract(ercAbi, TokenAddress.TOKEN_ADDRESS)
  tokenContract = new web3.eth.Contract(contractAbi, TokenAddress.CONTRACT_ADDRESSS)
  smartContract = new bnbWeb3.eth.Contract(bnbAbi, TokenAddress.SMARTCHAIN_ADDRESS)
}

initContracts()

async function setAllowance(swapId, amount) {
  try {
    const tokenAmount = bnbWeb3.utils.fromWei(amount, 'kwei')
    // const response = await smartContract.methods.setAllowance(swapId, tokenAmount).send({ from: bnbAccount.address })

    const method = smartContract.methods.setAllowance(swapId, tokenAmount);
    const encodedABI = method.encodeABI();

    const methodTx = {
      from: account.address,
      to: TokenAddress.SMARTCHAIN_ADDRESS,
      // gas: 2000000,
      data: encodedABI
    };

    const responseToSign = bnbWeb3.eth.accounts.signTransaction(methodTx, privateKeys[0])

    const tran = bnbWeb3.eth.sendSignedTransaction(responseToSign.rawTransaction);

    tran.on('confirmation', (confirmationNumber, receipt) => {
      console.log('confirmation: ' + confirmationNumber);

    });

    tran.on('transactionHash', hash => {
      console.log('hash');
      console.log(hash);
    });

    tran.on('receipt', receipt => {
      console.log('reciept');
      console.log(receipt);
    });

    tran.on('error', console.error);

    return tran
  } catch (error) {
    console.log(error)
    return error
  }
}

async function setIdentifier(swapId, identifier) {
  try {
    const method = smartContract.methods.setIdentifier(swapId, identifier);
    const encodedABI = method.encodeABI();

    const methodTx = {
      from: account.address,
      to: TokenAddress.SMARTCHAIN_ADDRESS,
      gas: 2000000,
      data: encodedABI
    };

    const responseToSign = bnbWeb3.eth.accounts.signTransaction(methodTx, privateKeys[0])

    const tran = bnbWeb3.eth.sendSignedTransaction(responseToSign.rawTransaction);

    tran.on('confirmation', (confirmationNumber, receipt) => {
      console.log('confirmation: ' + confirmationNumber);

    });

    tran.on('transactionHash', hash => {
      console.log('hash');
      console.log(hash);
    });

    tran.on('receipt', receipt => {
      console.log('reciept');
      console.log(receipt);
    });

    tran.on('error', console.error);

    return tran
  } catch (error) {
    console.log(error)
    return error
  }
}

async function getBalance() {
  const tokenBalance = await finuContract.methods.balanceOf(account.address).call()
  return tokenBalance
}

async function getCurrentSwapId() {
  const currentSwapId = await tokenContract.methods.getCurrentSwapId().call({ from: account.address })
  return currentSwapId
}

module.exports = {
  getCurrentSwapId,
  setAllowance,
  setIdentifier,
};
