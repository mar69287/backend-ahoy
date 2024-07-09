const contracts = require('../../utils/evm/contract');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

function addRoutes(app, evm) {
	function getAhoyNFT(chainId) {
		return contracts.retrieve(
			'AhoyTokenizedBoats',
			chainId,
			evm.network.signer(chainId)
		);
	}
	function getAhoyRentals(chainId) {
		return contracts.retrieve(
		  'AhoyRentals',
		  chainId,
		  evm.network.signer(chainId)
		);
	  }


	// This is the first call made when creating the nft
	app
		.route('/api/token/')
		.post(async (req, res) => {
			console.log('POST TOKEN');
			const { chainId, account, metadataURL, uuid } = req.body;
			console.log({ account });
			console.log({ chainId });
			console.log({ uuid });
			console.log({ metadataURL });
			try {
				const ahoyNFTContract = await getAhoyNFT(chainId);
				await (await ahoyNFTContract.mintTo(account, uuid)).wait();
				const tokenId = await ahoyNFTContract.fromUuid(uuid);
				const setTokenUriTx = await ahoyNFTContract.setTokenURI(tokenId, metadataURL);
    			await setTokenUriTx.wait();

				console.log(`Minted tokenId: ${tokenId.toString()}`);
				res.json({
					message: `AhoyTokenizedBoats contract instance retrieved successfully for chainId: ${chainId}`,
					tokenId: tokenId.toString()
				});
			} catch (error) {
				console.error('Error retrieving AhoyTokenizedBoats contract instance:', error);
				res.status(500).send('Error retrieving AhoyTokenizedBoats contract instance');
			}
			
		})

	// This is for when a user wants to update boat details
	app
		.route('/api/token/:tokenId')
		.put(async (req, res) => {
			const { tokenId } = req.params;
			const { chainId, newTokenURI } = req.body;
			console.log(`Updating tokenId: ${tokenId} with new URI: ${newTokenURI}`);
			try {
				const ahoyNFTContract = await getAhoyNFT(chainId);
				const setTokenUriTx = await ahoyNFTContract.setTokenURI(tokenId, newTokenURI);
				await setTokenUriTx.wait();
				res.json({
					message: `Token URI updated successfully for tokenId: ${tokenId}`,
					tokenId
				});
			} catch (error) {
				console.error('Error updating token URI:', error);
				res.status(500).send('Error updating token URI');
			}
		});

	 // This is for creating a rental agreement
	 app
	 .route('/api/rental')
	 .post(async (req, res) => {
	   const { listingType, price, tokenId, securityDeposit, bookingStart, bookingEnd, uuid, clientAccount, totalPrice, chainId } = req.body;
	   console.log('POST RENTAL');
	   console.log({ listingType, price, tokenId, securityDeposit, bookingStart, bookingEnd, uuid, clientAccount, totalPrice, chainId });
 
	   try {
		const ahoyRentalsContract = await getAhoyRentals(chainId);
  
		// Debug the values before parsing
		console.log(`Received totalPrice: ${totalPrice}, securityDeposit: ${securityDeposit}`);
  
		// Ensure totalPrice and securityDeposit are valid strings
		if (!totalPrice || !securityDeposit) {
		  throw new Error('totalPrice or securityDeposit is undefined');
		}
  
		// Parse the string values to the correct format
		const parsedTotalPrice = ethers.parseUnits(totalPrice.toString(), 'ether');
		const parsedSecurityDeposit = ethers.parseUnits(securityDeposit.toString(), 'ether');
  
		// Create the rental agreement with the contract call
		const rentalTransaction = await ahoyRentalsContract.createRentalAgreement(
		  tokenId,
		  clientAccount,
		  parsedTotalPrice,
		  parsedSecurityDeposit,
		  bookingStart,
		  bookingEnd,
		  uuid
		);
		await rentalTransaction.wait();
  
		res.json({
		  message: `Rental agreement created successfully for tokenId: ${tokenId}`,
		  transactionHash: rentalTransaction.hash
		});
	  } catch (error) {
		console.error('Error creating rental agreement:', error);
		res.status(500).send('Error creating rental agreement');
	  }
	 });
		
}

module.exports = { addRoutes };
