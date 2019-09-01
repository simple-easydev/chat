var cors = require('cors')
var router = require("./router");

const register = (app) => {
    app.use(cors());
    app.use("/", router);
}

exports.register = register;