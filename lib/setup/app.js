require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
// require('./database');

const port = process.env.PORT || 3000;

function configureApp() {
    const app = express();
    app.use(express.json());
    app.use(logger('dev'));
    app.use(cors({ origin: '*' }));
    app.listen(port, () => {
        console.log('Server Started on Port:' + port);
    });

    return app;
}

module.exports = { configureApp };
