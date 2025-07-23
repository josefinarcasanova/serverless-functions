const express = require('express');         // ExpressJS
const morgan  = require('morgan');          // Morgan (Logger)

//const cors    = require("cors");            // CORS
//const bodyParser = require('body-parser');

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT || 8080;

        //Server paths
        this.searchPath  = "/search";
        this.indexPath  = "/";
        
        //Load middlewares & routes
        this.middlewares();
        this.routes();
    }

    middlewares() {
        //this.app.use(cors());
        //this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(express.json());
        this.app.use(morgan((':date[iso] | :method :url | :response-time ms'))); // Docs: https://github.com/expressjs/morgan
    }

    routes() {
        this.app.use(this.searchPath, require("../routes/product.routes"));
        this.app.use(this.indexPath, require("../routes/index.routes"));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Server listening on port", this.port);
        });
    }
}

module.exports = Server;