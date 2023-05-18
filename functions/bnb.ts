import { BigNumberish, Contract, Provider, Wallet } from "ethers";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default async function optSwap(
    wallet: Wallet,
    arb_provider: Provider, 
    BTCbContract_ARB: Contract, 
    BTCbContract_BNB: Contract,
    _toaddress: String, 
    balance: BigNumberish, 
    adapter_params: String,
    maxFeePerGas: BigNumberish,
    results: Array<any>,
    id: number
){
  /**
  * Gets L0 fees
  * @param {Number} destination_chain
  * @param {String} _toaddress
  * @param {BigNumberish} balance
  * @param {String} adapter_params
  */
  const fees =  await BTCbContract_ARB.estimateSendFee(
    102,
    _toaddress,
    balance, 
    true, 
    adapter_params
  );
  const [fee] = fees;

  /**
  * Creates unsigned cross-chain swap
  * @param {String} wallet.address
  * @param {Number} destination_chain
  * @param {String} adapter_params
  * @param {String} _toaddress
  * @param {BigNumberish} balance swap value
  * @param {BigNumberish} balance min swap value
  * 
  */
  const unsignedBTCbSwap = await BTCbContract_ARB.sendFrom.populateTransaction(
    wallet.address,
    102,
    _toaddress,
    balance,
    balance,
    [wallet.address, "0x0000000000000000000000000000000000000000", adapter_params]
  );

  /**
  * Sends cross-chain transaction
  * @param {BigNumberish} value
  * @param {BigNumberish} gasLimit
  * @param {BigNumberish} maxFeePerGas
  */
  const BTCbSwap = await wallet.sendTransaction({
    ...unsignedBTCbSwap,
    value: fee,
    gasLimit: unsignedBTCbSwap.gasLimit,
    maxFeePerGas
  });

  await arb_provider.waitForTransaction(BTCbSwap.hash);
  console.log(`Swapped ${Number(balance) / 10**8} BTCb from ARB to BNB`);
  console.log(`https://arbiscan.io/tx/${BTCbSwap.hash}`);

  /**
  * Sets delay between 10 and 50 minutes 
  * before it checks whether BTC.b was received on destination or not 
  */
  await delay(60 * 1000);

  /**
  * Checks whether BTC.b was received on destination or not
  */
  let i = 0;
  while (i < 10) {
    const BTCbBalanceOnDest = await BTCbContract_BNB.balanceOf(wallet.address);
    if(BTCbBalanceOnDest) {
      results[id].btcb_dest = `${Number(balance) / 10**8} BNB BTC.b`;
      console.log(`BTCb BALANCE ON BNB ${BTCbBalanceOnDest}`)
      console.log(`=============`);
      break;
    }
    console.log(`Waiting till I get BTC.b on OPT`)
    ++i;
    await delay(60 * 1000);
  }
}