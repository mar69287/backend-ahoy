require('dotenv').config();
const Evm = require('./utils/evm/index.js');
const evm = new Evm();
const app = require('./lib/setup/index.js').initApp();
require('./lib/routes.js').addRoutes(app, evm);
