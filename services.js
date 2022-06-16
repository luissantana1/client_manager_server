require('dotenv').config({path: __dirname+'/config.env'});
const db = require('./db_connection');

const login = (req, res) => {
	const { email, password } = req.body;

	db.login(email, password, (result) => {
		!result ? res.status(404).end() : res.status(200).end();
	});
}

const signUp = (req, res) => {
	const { email, password } = req.body;

	db.signUp(email, password, (result) => {
		!result ? res.status(404).end() : res.status(200).end();
	});
}

const filterClient= (req, res) => {
	const email = req.body.email;

	db.filterClient( email, (result) => {
		if ( !result) {
			res.status(404).end();

		} else {
			const orderedResult = [];
			
			orderedResult.push({
				'first_name': result[0].first_name,
				'last_name' : result[0].last_name,
				'email': result[0].email,
				'address': result.map(callback => callback.address)
			});
			res.send(orderedResult).status(200).end()
		} 
	});
}

const addClient = (req, res) => {
	const {firstName, lastName, email, addressList} = req.body;

	db.addClient(firstName, lastName, email, addressList, (result) => {
		!result ? res.status(404).end() : res.status(200).end();
	} );
}

const deleteClient = (req, res) => {
	const email = req.body.email;

	db.deleteClient( email, (result) => {
		!result ? res.status(404).end() : res.status(200).end();
	});
}

const deleteAddress = (req, res) => {
	const id = req.body.id;

	db.deleteAddress( id, (result) => {
		!result ? res.status(404).end() : res.status(200).end();
	});
}

const updateClient = (req, res) => {
	const {firstName, lastName, email, addressList} = req.body;

	db.updateClient(firstName, lastName, email, addressList, (result) => {
		!result ? res.status(404).end() : res.status(200).end();
	})
}

const getAllClients = (res) => {
	db.getAllClients( (result) => {
		if ( !result) {
				res.status(404).end();
		} else {
			const orderedResult = [] 
			var email;

			result.forEach( client => {
				if ( email !== client.email) {
					email = client.email;

					const addressList = [];

					result.filter( 
						callback => email === callback.email
					).forEach( value => {
						addressList.push({
							'id': value.addressID,
							'address': value.address
						})
					} );

					orderedResult.push({
						'first_name': client.first_name,
						'last_name': client.last_name,
						'email': client.email,
						'address_list': addressList
					});
				}//if  
			});//forEach
			res.send(orderedResult).status(200).end();
		} //else 
	});//get all clients
}

module.exports = {
	login,
	signUp,
	filterClient,
	addClient,
	deleteClient,
	deleteAddress,
	updateClient,
	getAllClients
}
