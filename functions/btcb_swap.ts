import random from "lodash/random";
import { ethers} from "ethers";
import round from "lodash/round";
import assert from "assert";
import BTCb_ABI from "../abi/BTCB";
import OptSwap from "./opt";
import BnbSwap from "./bnb";
import AvaxSwap from "./avax";

/**
* Stores RPC urls for each blockchain
* BETTER INSERT YOUR OWN RPC URLS
*/
const ARB_RPC_URL = "https://endpoints.omniatech.io/v1/arbitrum/one/public"; 
const BNB_RPC_URL = "https://bsc.publicnode.com";
const OPT_RPC_URL = "https://optimism-mainnet.public.blastapi.io";
const AVAX_RPC_URL = "https://rpc.ankr.com/avalanche";

/**
* Stores BTC.b's contract addresses
*/
const BTCb_ADDRESS = "0x2297aEbD383787A160DD0d9F71508148769342E3";
const BTCb_ADDRESS_AVAX= "0x152b9d0FdC40C096757F570A51E494bd4b943E50"

/**
* Creates JsonRpcProviders for each blockchain
*/
const arb_provider = new ethers.JsonRpcProvider(ARB_RPC_URL);
const bnb_provider = new ethers.JsonRpcProvider(BNB_RPC_URL);
const opt_provider = new ethers.JsonRpcProvider(OPT_RPC_URL);
const avax_provider = new ethers.JsonRpcProvider(AVAX_RPC_URL);


export async function swapBTCb(key: string, dest: string, results, id: number) {
  /**
  * Creates wallets for each blockchain
  */
  const arb_wallet = new ethers.Wallet(key, arb_provider);
  const bnb_wallet = new ethers.Wallet(key, bnb_provider);
  const opt_wallet = new ethers.Wallet(key, opt_provider);
  const avax_wallet = new ethers.Wallet(key, avax_provider);

  /**
  * Creates BTC.b's contract instances for each blockchain
  */
  const BTCbContract_ARB = new ethers.Contract(
    BTCb_ADDRESS, 
    BTCb_ABI, 
    arb_wallet);
  
  const BTCbContract_BNB = new ethers.Contract(
    BTCb_ADDRESS, 
    BTCb_ABI, 
    bnb_wallet);

  const BTCbContract_OPT = new ethers.Contract(
    BTCb_ADDRESS, 
    BTCb_ABI, 
    opt_wallet);

  const BTCbContract_AVAX = new ethers.Contract(
    BTCb_ADDRESS_AVAX, 
    BTCb_ABI, 
    avax_wallet);
  
  /**
  * Edits wallet address for proper adapter_params creation
  */
  const wallet_edited = arb_wallet.address.slice(2);
  /**
  * Creates adapter_params for each account
  * @param {String} wallet_edited
  */
  const adapter_params = 
  `0x000200000000000000000000000000000000000000000000000000000000000` +
  `3d0900000000000000000000000000000000000000000000000000000000000000000` +
  `${wallet_edited}`;

  console.log("adapter_params", adapter_params);

  /**
  * Gets BTC.b balance for each account using BTC.b Contract
  * @param {String} arb_wallet.address
  */ 
  const balance = await BTCbContract_ARB.balanceOf(arb_wallet.address);
  
  /**
  * Stores BTC.b balance for each account in the results array in human readable format
  */ 
  results[id].btcb = `ARB ${Number(balance) / 10**8} BTC.b`;
  
  /**
  * Creates bytes32 format of wallet address
  */ 
  const _toaddress = "0x000000000000000000000000" + wallet_edited;

  /**
  * Asserts if there's no BTC.b
  */ 
  assert(balance, "NO BTC.b ON BALANCE");

  /**
  * Gets maxFeePerGas from provider for transaction
  */ 
  const { maxFeePerGas } = await arb_provider.getFeeData();

  /**
  * Decides which cross-chain swap to execute in accordance with user's choice
  */ 
  switch (dest) {
    case "opt": 
      console.log(`Wallet ${arb_wallet.address}`);
      console.log("I WILL SWAP BTCb TO OPT");
      await OptSwap(
        arb_wallet,
        arb_provider, 
        BTCbContract_ARB, 
        BTCbContract_OPT, 
        _toaddress, 
        balance, 
        adapter_params,
        maxFeePerGas,
        results,
        id);
      break;
    case "bnb": 
      console.log(`Wallet ${arb_wallet.address}`);
      console.log("I WILL SWAP BTCb TO BNB");
      await BnbSwap(
        arb_wallet,
        arb_provider, 
        BTCbContract_ARB, 
        BTCbContract_BNB, 
        _toaddress, 
        balance, 
        adapter_params,
        maxFeePerGas,
        results,
        id);
      break;
    case "avax": 
      console.log(`Wallet ${arb_wallet.address}`);
      console.log("I WILL SWAP BTCb TO AVAX");
      await AvaxSwap(
        arb_wallet,
        arb_provider, 
        BTCbContract_ARB, 
        BTCbContract_AVAX, 
        _toaddress, 
        balance, 
        adapter_params,
        maxFeePerGas,
        results,
        id);
      break;
    default: console.log("DONT KNOW THAT DESTINATION")
  }
}