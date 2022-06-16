const mysql = require('mysql');
require('dotenv').config({path: __dirname + './config.env'});

var pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
});

const login = (email, password, callback) => {
	try {
		pool.getConnection((error, conn) => { //open connection
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_confirm_user(?, ?)',
					[email, password], (error, result) => {
						if (error) {
							console.log(error.message);
						} else {
							result[0].length === 0 ? callback(false) : callback(true);
							conn.release();
						}
					});//query
			}//else 
		});//getConnection
	} catch (e) {
		console.log(e);
	}
}

const signUp = (email, password, callback) => {
	try {
		pool.getConnection((error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_confirm_user(?, ?)',
					[email, password], (error, result) => {
						if (error) {
							console.log(error);
						} else {
							if (result[0].length === 1) {
								callback(false); //if exists stops
								conn.release(); 
							} else { //if doesn't exist add a new one 
								conn.query('CALL sp_insert_user(?, ?)',
									[email, password], (error, result) => {
										if (error) {
											console.log(error);
										} else {
											result.affectedRows === 1 ? callback(true) : callback(false);
											conn.release();
										}
									});//add user
							}//else add user 
						}// else confirm user
					});//check if user exist
			}//connection error else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

const filterClient = (email, callback) => {
	try {
		pool.getConnection((error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_get_client(?)', email, (error, result) => {
					if (error) {
						console.log(error)
					} else {
						result[0].length === 0 ? callback(false) : callback(result[0]);
						conn.release();

					} //if else
				});//query
			} //else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

const addClient = (firstName, lastName, email, addressList, callback) => {
	try {
		pool.getConnection((error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_confirm_client(?)',
					[email], (error, result) => {
						if (error) {
							console.log(error);
						} else if (result[0].length === 1) {
								callback(false); //if exists stops
								conn.release();
							} else { //if doesn't exist add a new one 
								conn.query('CALL sp_insert_client(?, ?, ?)',
									[firstName, lastName, email], (error, insertedClientResult) => {
										if (error) {
											console.log(error);
										} else {
											//inserting addressList based of client db relation
											const stm = `
											INSERT INTO tbl_address(address, fk_client_id)
												VALUES ?`;

											const values = addressList.reduce( (acc, address) => {
												acc.push([address, Object.values(
													insertedClientResult[0]).at(0).generatedID]);
												return acc;
											},[] ); 

											conn.query(stm,	[values], (error) => {
												if (error) {
													console.log(error);
												} else {
													callback(true);
												}
											});
											conn.release();
										}
								});//add 
							}//else add 
						}// else confirm 
					);//check if exist
			}//connection error else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

const deleteClient = (email, callback) => {
	try {
		pool.getConnection((error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_confirm_client(?)',
					email, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							if (result[0].length === 1) {//client exist
								conn.query('CALL sp_delete_client(?)',
									email, (error, result) => {
										if (error) {
											console.log(error);
										} else {
											result.affectedRows === 1 ? callback(true) : callback(false);
											conn.release();
										}
									});
							}//delete user
						}// else confirm client 
					});//check if client exist
			}//connection error else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

const deleteAddress = (id, callback) => {
	try {
		pool.getConnection((error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_delete_address(?)',
					id, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							result.affectedRows !== 1 ? callback(false) : callback(true);
						}
						conn.release();
					});
			}//connection error else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

const updateClient = (firstName, lastName, email, addressList, callback) => {
	try {
		pool.getConnection( (error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_update_client(?, ?, ?)', 
					[firstName, lastName, email], (error, updatedClientResult) => {
						if (error) {
							console.log(error);
						} else {
							if (updatedClientResult.affectedRows !== 1) {
								callback(false);
							} else {
								//updating address based of their relation with clients
								const stm = '';

								for(address in addressList) {
									stm += `UPDATE tbl_address SET address = ?
										WHERE fk_client_id = ${updatedClientResult[0].at(0).generatedID};`
								};

								const values = addressList.reduce( (acc, address) => {
									acc.push([address, Object.values(
									updatedClientResult[0]).at(0).generatedID]);
									return acc;
								},[] ); 

								conn.query(query,	[values], (error) => {
									if (error) {
										console.log(error);
									} else {
										callback(true);
									}
								});
							}
							conn.release();
						}
					});
			}//connection error else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

const getAllClients = (callback) => {
	try {
		pool.getConnection((error, conn) => {
			if (error) {
				console.log(error);
			} else {
				conn.query('CALL sp_get_all_clients()', (error, result) => {
					if (error) {
						console.log(error)
					} else {
						result[0].length === 0 ? callback(false) : callback(result[0]);
						conn.release();
					} //if else
				});//query
			} //else 
		});//get connection
	} catch (e) {
		console.log(e);
	}
}

module.exports = {
	login,
	signUp,
	filterClient,
	addClient,
	deleteClient,
	deleteAddress,
	updateClient,
	getAllClients,
};
