const path = require('path');

const convertRoutes = require('./routes/convert');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use('/convert', convertRoutes);
console.log(__dirname)
app.use(bodyParser.json());

app.use('/convert', convertRoutes);

app.listen(8080);

