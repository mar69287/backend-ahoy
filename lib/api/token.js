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
		// .get(async (req, res) => {
		// 	console.log('GET TOKEN');
		// 	const { tokenId } = req.params;
		// 	const { chainId } = req.query; // Extract chainId from query parameters

		// 	try {
		// 		const token = await Token.findOne({
		// 			onChainID: tokenId,
		// 			chainId: chainId,
		// 		}); // Filter by chainId
		// 		if (!token) {
		// 			return res.status(404).send('Token not found');
		// 		}
		// 		res.send(token);
		// 	} catch (error) {
		// 		res.status(500).send(error);
		// 	}
		// })
		// .put(async (req, res) => {
		// 	try {
		// 		const updates = req.body;
		// 		const options = { new: true };
		// 		const tokenId = Number(req.params.tokenId);
		// 		const token = await Token.findOneAndUpdate(
		// 			{ onChainID: tokenId },
		// 			updates,
		// 			options
		// 		);
		// 		if (!token) {
		// 			return res.status(404).send('Token not found');
		// 		}
		// 		res.send(token);
		// 	} catch (error) {
		// 		res.status(400).send(error);
		// 	}
		// });

	// app
	// 	.route('/api/tokens')
	// 	.get(async (req, res) => {
	// 		console.log('GET METADATA FOR TOKENS');
	// 		let { tokenIds, chainId } = req.query; // Extract chainId from query parameters

	// 		console.log(chainId);
	// 		if (!Array.isArray(tokenIds)) {
	// 			if (typeof tokenIds === 'string') {
	// 				tokenIds = [tokenIds];
	// 			} else {
	// 				return res.status(400).send('tokenIds should be an array');
	// 			}
	// 		}

	// 		try {
	// 			const tokens = await Token.find({
	// 				onChainID: { $in: tokenIds.map((id) => Number(id)) },
	// 				chainId: chainId,
	// 			});
	// 			res.send(tokens);
	// 		} catch (error) {
	// 			res.status(500).send(error);
	// 		}
	// 	})
	// 	.delete(async (req, res) => {
	// 		console.log('DELETE ALL TOKENS AND CLEAR UPLOADS FOLDER');
	// 		try {
	// 			// Delete all tokens from the database
    //             await Token.deleteMany({ chainId: 31337 });
    //             await ProceedsWithdrawn.deleteMany({ chainId: 31337 });
    //             await ListingClosed.deleteMany({ chainId: 31337 });

	// 			// Clear the uploads folder
	// 			const uploadDir = path.join(__dirname, '../../uploads');
	// 			fs.readdir(uploadDir, (err, files) => {
	// 				if (err) {
	// 					console.error('Failed to read uploads directory:', err);
	// 					return res.status(500).send('Server error');
	// 				}

	// 				files.forEach((file) => {
	// 					const filePath = path.join(uploadDir, file);
	// 					fs.stat(filePath, (err, stats) => {
	// 						if (err) {
	// 							console.error(`Failed to get stats of file: ${filePath}`, err);
	// 							return;
	// 						}

	// 						if (stats.isDirectory()) {
	// 							fs.rm(filePath, { recursive: true }, (err) => {
	// 								if (err) {
	// 									console.error(`Failed to delete folder: ${filePath}`, err);
	// 								} else {
	// 									console.log(`Deleted folder: ${filePath}`);
	// 								}
	// 							});
	// 						} else {
	// 							fs.unlink(filePath, (err) => {
	// 								if (err) {
	// 									console.error(`Failed to delete file: ${filePath}`, err);
	// 								} else {
	// 									console.log(`Deleted file: ${filePath}`);
	// 								}
	// 							});
	// 						}
	// 					});
	// 				});

	// 				console.log('All tokens and uploads deleted successfully.');
	// 				res.send('All tokens and uploads deleted successfully.');
	// 			});
	// 		} catch (error) {
	// 			console.error('Error deleting tokens and clearing uploads:', error);
	// 			res.status(500).send('Server error');
	// 		}
	// 	});
}

module.exports = { addRoutes };
