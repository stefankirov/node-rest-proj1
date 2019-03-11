//key vault//


const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
const searchRoutes = require('./api/routes/search');
const itineraryRoutes = require('./api/routes/itineraries');
const customerRoutes = require('./api/routes/customers');

mongoose.connect(
	"mongodb+srv://noderestshop1:" +
	process.env.MONGO_DB_ACCESS_KEY +
	"@cluster0-irxqm.mongodb.net/test?retryWrites=true",
	{
		useNewUrlParser: true	
	}
);

mongoose.Promise = global.Promise;
console.log("# Loading app.js");

//plugging app insights for Azure
const appInsights = require("applicationinsights");
appInsights.setup("ae24c5fe-06e7-4a85-9f3f-04ed7899db36");
appInsights.start();

//utils
app.use(morgan('dev'));
app.use( '/uploads' , express.static('uploads')); //making uploads folder available publicly
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//replace '*' to give access to specific url only
app.use((res, req, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers', 
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if(req.method === 'OPTIONS') {
		//whatever you want to support with your API
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	//telling the server code to continue
	next();
});

//routes which should handle requetsts
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/itineraries', itineraryRoutes);
app.use('/customers', customerRoutes);
app.use('/users', userRoutes);
app.use('/search', searchRoutes);
//enable public access to the folder
app.use('/uploads', express.static(__dirname  + '/uploads'));

app.use((req, res, next) => {

	if (req.path && req.path == '/'){
		return res.status(200).json({
			data: "https://documenter.getpostman.com/view/6595853/S11EvfdR",
			version: "0.1"

		});
	}else{
		const error = new Error('Not found');
		error.status=404;
		next(error);
	}
});

app.use((error,req,res,next) => {
	res.status(error.status || 500);
	res.json({
		error:{
			message: error.message
		}
	});
});


module.exports = app;
