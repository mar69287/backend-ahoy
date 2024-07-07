function initApp() {
	const app = require('./app.js').configureApp();
	return app;
}

module.exports = { initApp };
