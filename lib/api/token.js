const contracts = require('../../utils/evm/contract');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const BoatNft = require('../models/nft');
const axios = require('axios');
require('dotenv').config();

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
			const { chainId, account, metadataURL, uuid, listingType, address, geoLocation, availabilityPlan, location, photos, empty } = req.body;
            console.log({ account });
            console.log({ chainId });
            console.log({ uuid });
            console.log({ metadataURL });
			console.log({ listingType });
			console.log({ address });
			console.log({ geoLocation });
			console.log({ availabilityPlan });
			console.log({ location });
			console.log({ photos });

			try {
				const ahoyNFTContract = await getAhoyNFT(chainId);
                await (await ahoyNFTContract.mintTo(account, uuid)).wait();
                const tokenId = await ahoyNFTContract.fromUuid(uuid);
                const setTokenUriTx = await ahoyNFTContract.setTokenURI(tokenId, metadataURL);
                await setTokenUriTx.wait();

                console.log(`Minted tokenId: ${tokenId.toString()}`);

				// this if for worse case scenario if mongo will be needed
                // // Create BoatNft document
                // const boatNft = new BoatNft({
                //     tokenId: tokenId.toString(),
                //     owner: account,
                //     listingType,
                //     address,
                //     availabilityPlan,
                //     location,
                //     photos
                // });

                // await boatNft.save();

                res.json({
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

	 class MidjourneyInterface {
		constructor() {
		  this.accessKey = process.env.MIDJOURNEY_ACCESS_KEY;
		  this.url = 'https://cl.imagineapi.dev/items/images';
		  this.headers = {
			Authorization: `Bearer ${this.accessKey}`,
			'Content-Type': 'application/json',
		  };
		}
	  
		async generate_image(prompt) {
		  const payload = { prompt };
		  try {
			const response = await axios.post(this.url, payload, { headers: this.headers });
			return response.data.data.id;
		  } catch (error) {
			console.error(`Error generating image: ${error.message}`);
			throw error;
		  }
		}
	  
		async get_image(image_id) {
		  try {
			const response = await axios.get(`${this.url}/${image_id}`, { headers: this.headers });
			return response.data.data;
		  } catch (error) {
			console.error(`Error retrieving image: ${error.message}`);
			throw error;
		  }
		}
	  
		async get_and_retrieve_image_url(prompt) {
		  const image_id = await this.generate_image(prompt);
		  let retrieve_json = await this.get_image(image_id);
		  while (retrieve_json.status !== 'completed') {
			console.log(JSON.stringify(retrieve_json, null, 2));
			await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
			retrieve_json = await this.get_image(image_id);
		  }
		  return retrieve_json.upscaled_urls[0];
		}
	  }
	  
	  const midjourney = new MidjourneyInterface();
	 app
    .route('/api/midjourney')
    .post(async (req, res) => {
      const { imageUrl } = req.body;
      console.log('POST MIDJOURNEY');
      console.log({ imageUrl });

      const apiPrompt = `Retro, 8-bit, Grand, Impressive, 8-bit, Closeup on boat, Natural Background, Amazing`;
    //   const apiPrompt = `Retro, 8-bit, Grand, Impressive, 8-bit, Closeup on boat, Natural Background, Amazing URL: ${imageUrl}`;

		try {
			const image_url = await midjourney.get_and_retrieve_image_url(apiPrompt);
			console.log('Midjourney image URL:', image_url);
			res.json({ midjourneyImageUrl: image_url });
		} catch (error) {
			console.error('Error interacting with Midjourney API:', error);
			res.status(500).send('Error interacting with Midjourney API');
		}
    });
		
}

module.exports = { addRoutes };
