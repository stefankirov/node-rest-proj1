const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

const itineraryRoutes = require('./api/routes/itineraries');
const customerRoutes = require('./api/routes/customers');
//db should be ENV pass & user & connection string
//process.env.MONGO_ATLAS_PW
//hardcoding for now
mongoose.connect(
	"mongodb+srv://noderestshop1:noderestshop1@cluster0-irxqm.mongodb.net/test?retryWrites=true",
	{
		useNewUrlParser: true	
	}
);
mongoose.Promise = global.Promise;

//utils
app.use(morgan('dev'));
app.use( '/uploads' ,express.static('uploads')); //making uploads folder available publicly
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
		return res.stattus(200).json({});
	}
	//telling the server code to continue
	next();
});

//routes which should handle requetsts
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/itineraries', itineraryRoutes);
app.use('/customers', customerRoutes);

app.use((req, respo, next) => {
	const error = new Error('Not found');
	error.status=404;
	next(error);
});

app.use((error,req,res,next) => {
	res.status(error.status || 500);
	res.json({
		error:{
			message: error.message
		}
	});
});

/* app.use((req, res, next) => {
	res.status(200).json({
		message: "It works!"
	});

}); */

module.exports = app;