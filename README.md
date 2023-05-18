# BTC.b cross-chain bridger

Node.js script for BTC.b crosschain bridging. 




## Features

- Bridges BTC.b using [Bitcoin Bridge](https://bitcoinbridge.network/)
- Supports multiple private addresses
- Bridges only from Arbitrum
- Bridges only to Avalanche, BNB, Optimism
- Creates ```Logs.txt``` file in your current directory with the results of the code execution




## Installation

### You will need 
- Node.js 
- Npm / yarn

### After you install Node.js and npm/yarn: 
```bash
git clone https://github.com/Hovooo/BTC.bridger
cd BTC.bridger
npm i
```


### Settings 

- Import all of your private keys to the ```keys.txt``` file and save changes
- Change the delay between each account in the ```index.ts``` file if needed 
- For better performance change public RPCs to your own production level RPCs in ```btcb_swap.ts``` and ```index.ts``` files.

### Run

- ```npm start <destination chain name>```
- This script supports only three destination chains. They are named avax, opt and bnb. You can type them in any case you prefer. Even aVAx will work 😃


    
## Usage/Examples

If you want to bridge your BTC.bs from Arbitrum to Optimism, simply command

```bash
npm start opt
```


## Authors

- [@Hovooo](https://github.com/Hovooo)
