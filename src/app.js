const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express();

//Connect Database
require('../config/db');
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/user', require('./router/user'));
app.use('/product', require('./router/product'));
app.use('/checkserver', (req, res) => res.json({status: 'Server Running'}));


module.exports = app;