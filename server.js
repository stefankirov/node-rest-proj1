const https = require('https');
const app =require('./app')
const port = process.env.PORT || 3000;

const server = https.createServer(app);

console.log("# Creted Server at port:  " + port);  
server.listen(port);


