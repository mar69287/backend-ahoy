const contracts = require('../../utils/evm/contract');
const fs = require('fs');
const path = require('path');

function addRoutes(app, evm) {
	function getAhoyNFT(chainId) {
		return contracts.retrieve(
			'AhoyTokenizedBoats',
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
		
}

module.exports = { addRoutes };
