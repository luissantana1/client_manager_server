require('dotenv').config({path: __dirname+'/config.env'});
const express = require('express');
const bodyParser = require('body-parser');
const serv = require('./services');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
	serv.login(req, res);
});

app.post('/sign_up', (req, res) => {
	serv.signUp(req, res);
});

app.post('/filter_client', (req, res) => {
	serv.filterClient(req, res);
});

app.post('/add_client', (req, res) => {
	serv.addClient(req, res);
});

app.post('/delete_client', (req, res) => {
	serv.deleteClient(req, res);
});

app.post('/delete_address', (req, res) => {
	serv.deleteAddress(req, res);
});

app.post('/edit_client', (req, res) => {
	serv.updateClient(req, res);
})

app.get('/get_all_clients', (req, res) => {
	serv.getAllClients(res);
});

app.listen(process.env.NODE_PORT, () => {
	console.log(`Listening on port: ${process.env.NODE_PORT}`);
})
