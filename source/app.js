const path = require("path");
const Server = require("./models/server");

require("dotenv").config({path: path.resolve(__dirname,".env")});   // Set env variables from .env file

async function start_app(){
    // Connect to database

    // Initialize server
    const server = new Server();
    
    // Start server
    server.listen();
}
start_app();