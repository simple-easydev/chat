require('dotenv').config()
const express = require("express");
var router = express.Router()
var io = require('socket.io-client')
var async = require('async');
var socket = io.connect(`http://${process.env.HOST}:${process.env.PORT}`, {reconnect: true});
var fs = require('fs');
var dir = process.env.HISTORY;

router.post("/notification", (req, res, next) => {
    const message = req.body.message;
    const groupid = req.body.groupid;
    const image_link = req.body.image_link;
    console.log(message, image_link);
    socket.emit('notification', message, groupid, image_link);
    res.status(200).json({result:true})
})

router.get("/getChatHistory", (req, res, next) => {

    const roomid = req.query.groupid;
    const path = `${dir}\/${roomid}`;

    console.log(path);

    const listFiles = (callback)=>{

        if(roomid == ""){
            callback("wrong path");
            return;
        }

        if (!fs.existsSync(path)){
            // fs.mkdirSync(path);
            callback("history folder is not existing");
            return;
        }

        fs.readdir(path, function(err, items) {
            if(items.length > 0){
                const lastFile = items[items.length - 1];
                callback (err, lastFile);
            }else{
                callback("history items is not existing");
            }
        });
    }

    const readFile = (filename, callback)=>{

        var dataset = [];
        
        function readLines(input, func) {
            var remaining = '';
            
            input.on('data', function(data) {
                remaining += data;
                var index = remaining.indexOf('\n');
                var last  = 0;
                while (index > -1) {
                    var line = remaining.substring(last, index);
                    last = index + 1;
                    func(line);
                    index = remaining.indexOf('\n', last);
                }

                remaining = remaining.substring(last);
            });

            input.on('end', function() {
                if (remaining.length > 0) {
                    func(remaining);
                }else{
                    callback (null, dataset);
                }
            });
        }

        function func(data) {
            dataset.push(data)
        }

        var input = fs.createReadStream(`${path}/${filename}`);
        readLines(input, func);

    }

    const spliteData = (data)=>{
        var result = [];
        data.forEach(line => {
            arr = line.split("<=>");
            var jsonObj = {
                time:arr[0] || "",
                usertype:arr[1] || "",
                name:arr[2] || "",
                room:arr[3] || "",
                message:arr[4] || "",
            }

            jsonObj.time = jsonObj.time.replace(",", "");

            result.push(jsonObj);
        });
        return result;
    }

    async.waterfall([
        listFiles,
        readFile,
    ], function (error, data) {
        if (error) { 
            res.status(400).send(error);
        }else{
            res.status(200).json({result:spliteData(data)});
        }
    });
    
})


module.exports = router;