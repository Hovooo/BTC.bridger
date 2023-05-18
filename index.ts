import fs from "fs/promises";
import random from "lodash/random";
import { ethers, formatEther, parseEther, Interface} from "ethers";
import {swapBTCb} from "./functions/btcb_swap";
import saveData from "./save_data"


/**
 * Utility for setting a delay
 * @param {Integer} millis 
 */

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Sets date and time for document creation (see saveData function)
 */

const date = (new Date()).toLocaleDateString().split('/').join('.');;
const time = new Date().toLocaleTimeString([], {hour12: false}).split(':').join('.').slice(0, 5);

/**
 * Creates emty array to collect the results while executing the code
 */
const results = [];

/**
 * Sets objects' keys and the value for the address key for each account
 */
function setObject(id: number, address: string) {
  results[id] = {
    address: address,
    btcb: "",
    btcb_dest: "",
    error: ""
  }
}

/**
 * Parses the private keys from file named keys.txt and creates an array named keys
 * Saves the last key in the variable named lastKey
 */
const FILENAME = "keys.txt";
const file = await fs.readFile(FILENAME, { encoding: "utf8" });
const keys = file.split("\n").filter(Boolean).map((item) => item.trim());
const lastKey = [...keys].pop();

/**
 * Creates the JsonRpcProvider
 * BETTER INSERT YOUR OWN RPC URL
 */
const ARB_RPC_URL = "https://endpoints.omniatech.io/v1/arbitrum/one/public"; 
const provider = new ethers.JsonRpcProvider(ARB_RPC_URL);

/**
 * Stores the arguments passed when starting the code
 */
const args = process.argv;

for (const key of keys) {
  /**
   * Creates wallet for each key in the array of keys
   */
  const wallet = new ethers.Wallet(key, provider);

  /**
  * Stores the second argument passed when starting the code as the destination of the cross-chain swap
  */
  const dest = args[2].toLowerCase();
 
  /**
  * Stores the index of each in key in the array of keys
  */
  const id = keys.indexOf(key);

  /**
  * Sets an object in the array of results for each account
  * @param {Number} id
  * @param {String} wallet.address
  */
  setObject(id, wallet.address);

  try {
    /**
    * Executes cross-chain swap for each account
    * @param {String} key
    * @param {String} dest
    * @param {Array<Object>} results
    * @param {Number} id
    */
    await swapBTCb(key, dest, results, id);
  }
  catch (err) {
    console.log('\x1b[31m%s\x1b[0m', "Caught error", err);
    console.log('\x1b[31m%s\x1b[0m', `THERE WAS AN ERROR WITH ${wallet.address}, PASSED TO THE NEXT WALLET` );
    /**
    * Writes the results in case of error to the results array
    */
    results[id].error = err.message;
    /**
    * Saves the results to the file in the directory of the ptoject in case of error
    * @param {Array<Object>} results
    * @param {String} date
    * @param {String} time
    * @param {Number} id
    */
    saveData(results, date, time, id);
    /**
    * Passes to the next account in case of error
    */
    continue;
  }
    /**
    * Saves results to the file in the directory of the ptoject in case of error
    * @param {Array<Object>} results
    * @param {String} date
    * @param {String} time
    * @param {Number} id
    */
  saveData(results, date, time, id);
    /**
    * Sets delay after each account
    */
  if (key !== lastKey) {
    /**
    * Generates random delay time from 10  to 50 minutes between each account
    */
    const delayTimeout = random(600, 3000) * 1000;
    console.log(`SET DELAY AFTER SWAP ${delayTimeout / 1000 / 60} MINUTES AT ${new Date().toLocaleTimeString()}`);
    await delay(delayTimeout);
  }

  /**
  * Outputs the results array as a table to the console after finishing all the accounts
  */
  if (key == lastKey) {
    console.table(results);
  }
}