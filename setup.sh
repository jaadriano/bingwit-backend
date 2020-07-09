#!/bin/bash

# -- Install app dependencies -- #
echo "Installing dependencies..."
npm install
npm install -g nodemon
npm install -g sequelize-cli

# -- Check if NODE_ENV exists -- #
echo "Dropping database...Checking if NODE_ENV exists.."
if [ $NODE_ENV ];
then
    echo "NODE_ENV exists. No need to drop the database.";
else    
    # -- Enter database setup commands below -- #
    echo "Please enter mySQL password for the following"
    sudo mysql -u root -e "DROP DATABASE IF EXISTS bingwit_backend" -p
    echo "Database dropped. Create new bingwit_backend_db database"
    sudo mysql -u root -e "CREATE DATABASE bingwit_backend" -p
    echo "Database created. Create user bingwit_backend. Will prompt an error if user already exists"
    sudo mysql -u root -e "CREATE USER 'bingwit_backend'@'%' IDENTIFIED BY 'b1n9w1t'" -p
    echo "User bingwit_backend created. Grant privileges to bingwit_backend for development."
    sudo mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'bingwit_backend'@'%' WITH GRANT OPTION" -p
    echo "Privileges granted. Flush privileges"
    sudo mysql -u root -e "FLUSH PRIVILEGES" -p;
fi

echo "Creating tables for the database"
sequelize db:migrate
