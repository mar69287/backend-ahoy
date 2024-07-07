function addRoutes(app, evm) {
	app.route('/api/sitrep').get((req, res) => evm.report(req, res));
	require('./token.js').addRoutes(app, evm);
	require('./auth.js').addRoutes(app, evm);

	require('./devtools.js').addRoutes(app);
}

module.exports = { addRoutes };
