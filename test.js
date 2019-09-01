const express = require('express')
const app = express()
var bodyParser = require("body-parser")
const path = require("path")
require('dotenv').config()

const port = process.env.PORT

app.use(bodyParser.json({
    limit:"5mb"
}))

app.use(bodyParser.urlencoded({
    extended:true,
    limit:"5mb"
}))

app.post('/notification', (request, response, next) => {
    // The upload to s3 works fine
    console.log(request.body); // I cannot see anything in the body, I only see { meta: '' }
    response.send('notification!')
});


app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
})