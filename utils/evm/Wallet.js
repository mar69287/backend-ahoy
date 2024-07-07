require('dotenv').config()
const fs = require('fs');
const path = require('path');
const ethers = require('ethers');

let privateKey = process.env.PRIVATE_KEY;

// if (!privateKey) {
// 	console.log('Fallback: Using Hardhat Wallet Private Key');
// 	loadEnv(path.resolve(__dirname, '..', '..', '..', 'smart-contracts', '.env'));
// 	const privateKeys = process.env.WALLET_KEYS;
// 	if (privateKeys) {
// 		const keys = privateKeys.split(',');
// 		if (keys.length > 0 && keys[0]) {
// 			privateKey = keys[0].trim();
// 		}
// 	} else {
// 		console.error(
// 			'No PRIVATE_KEY found in any .env file and WALLET_KEYS is not set'
// 		);
// 		process.exit(1);
// 	}
// } else {
// 	console.log('Backend .env had PRIVATE_KEY');
// }

class Wallet {
	constructor() {
		this.key = this.getPrivateKey();
		const wallet = new ethers.Wallet(this.key);
		this.address = wallet.address;
	}

	getPrivateKey() {
		if (privateKey) {
			return privateKey;
		} else {
			console.error('No PRIVATE_KEY found and no WALLET_KEYS available');
			process.exit(1);
		}
	}
}

module.exports = Wallet;
