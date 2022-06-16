CREATE DATABASE IF NOT EXISTS db_client_manager;

USE db_client_manager;

CREATE TABLE IF NOT EXISTS tbl_client (
    pk_id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY ( pk_id )
);

CREATE TABLE IF NOT EXISTS tbl_address (
    address VARCHAR(100) NOT NULL UNIQUE,
    pk_id INT NOT NULL AUTO_INCREMENT,
    fk_client_id INT NOT NULL,
    FOREIGN KEY ( fk_client_id ) REFERENCES tbl_client(pk_id) ON DELETE CASCADE,
    PRIMARY KEY ( pk_id )
);

CREATE TABLE IF NOT EXISTS tbl_user(
    pk_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    PRIMARY KEY ( pk_id )
);

/* Default values for testing*/

/* If these values exist don't insert*/
INSERT IGNORE INTO tbl_client(first_name, last_name, email)
    VALUES ("Jose", "Mejia", "jose@mail.com"), ("Maria", "Lopez", "maria@mail.com");

/* Every address belongs to one user only and one user has multiple addresses */
INSERT IGNORE INTO tbl_address( address, fk_client_id )
    VALUES(
    "Av Los Beisbolistas 57, Manoguayabo, Santo Domingo", /* sub querys inside parentesis */
        (SELECT pk_id FROM tbl_client WHERE email = "jose@mail.com")
    ),
    ( "Av. Independencia No. 54 , Gascue, Santo Domingo",
        ( SELECT pk_id FROM tbl_client WHERE email = "jose@mail.com" )
    ),
    ( "Calle Máximo Grullón No. 61 , Villa Consuelo, Santo Domingo",
        ( SELECT pk_id FROM tbl_client WHERE email = "maria@mail.com")
    ),
    ( "Av. J. Pablo Duarte Esq. calle 37 Oeste 24 , Ensanche Luperón, Santo Domingo",
        ( SELECT pk_id FROM tbl_client WHERE email = "maria@mail.com" )
    );

/* User */
INSERT IGNORE INTO tbl_user(email, password)
    VALUES ("luis@mail.com", "1234");

/* tbl_address procedures */
/* delete address*/
CREATE PROCEDURE IF NOT EXISTS sp_delete_address(
    p_pk_id INT
)
DELETE FROM tbl_address WHERE pk_id = p_pk_id;

/* tbl_client procedures */
/* filter client */
CREATE PROCEDURE IF NOT EXISTS sp_get_client( p_email VARCHAR(50) )
    SELECT tbl_client.first_name, tbl_client.last_name, tbl_client.email, tbl_address.address
        FROM tbl_client JOIN tbl_address
            ON tbl_client.pk_id = tbl_address.fk_client_id
        WHERE email = p_email;

/* get all */
CREATE PROCEDURE IF NOT EXISTS sp_get_all_clients()
    SELECT tbl_client.first_name, tbl_client.last_name,
        tbl_client.email, tbl_address.pk_id as addressID,
        tbl_address.address
        FROM tbl_client JOIN tbl_address
            ON tbl_client.pk_id = tbl_address.fk_client_id;

/* confirm client*/
CREATE PROCEDURE IF NOT EXISTS sp_confirm_client(
    p_email VARCHAR(50)
) SELECT * FROM tbl_client WHERE email = p_email;

/* insert client*/
DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS sp_insert_client(
        p_first_name VARCHAR(50),
        p_last_name VARCHAR(50),
        p_email VARCHAR(50)
    )
    BEGIN
        INSERT INTO tbl_client(first_name, last_name, email)
            VALUES(p_first_name, p_last_name, p_email);
        SELECT pk_id AS generatedID FROM tbl_client WHERE email = p_email;
    END$$
DELIMITER ;

/* update client  */
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_update_client(
        p_first_name VARCHAR(50),
        p_last_name VARCHAR(50),
        p_email VARCHAR(50)
    )
    BEGIN
        UPDATE tbl_client
            set first_name = p_first_name, last_name = p_last_name
        WHERE email = p_email;
        SELECT pk_id AS generatedID FROM tbl_client WHERE email = p_email;
    END$$
DELIMITER ;

/* delete */
CREATE PROCEDURE IF NOT EXISTS sp_delete_client(
    p_email VARCHAR(50)
)
DELETE FROM tbl_client WHERE email = p_email;

/* tbl_user procedures */
/* confirm user credentials */
CREATE PROCEDURE IF NOT EXISTS sp_confirm_user(
    p_email VARCHAR(50),
    p_password VARCHAR(50)
) SELECT * FROM tbl_user WHERE email = p_email AND password = p_password;

/* insert */
CREATE PROCEDURE IF NOT EXISTS sp_insert_user(p_email VARCHAR(50), p_password VARCHAR(50))
    INSERT INTO tbl_user( email, password )
        VALUES (p_email, p_password);
