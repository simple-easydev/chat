require('dotenv').config()
const express = require("express");
var router = express.Router()
var io = require('socket.io-client')
var async = require('async');
var socket = io.connect(`http://${process.env.HOST}:${process.env.PORT}`, {reconnect: true});
var fs = require('fs');
var dir = process.env.HISTORY;
const LOVENSE_TOKEN = process.env.LOVENSE_TOKEN;
const axios = require("axios");

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
                image:arr[5]
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

router.post("/lovense/fallback", (req, res, next)=>{
    const reqbody = req.body;
    //regiser device
    fs.writeFile(`./lovense/users.json`, JSON.stringify(reqbody), (err) => {
        if (err) throw err;
        console.log('a device is saved!');
    });

    res.status(200).json(reqbody);
})

router.post("/lovense/qrcode", async (req, res, next)=>{

    const { uid, uname, utoken } = req.body;

    let data = JSON.stringify({
        "token": LOVENSE_TOKEN,
        "uid": uid,
        "uname": uname,
        "utoken": utoken,
        "v": 2
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.lovense-api.com/api/lan/getQrCode',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
    };

    const { data:qrRes } = await axios.request(config);
    res.status(200).json(qrRes);
})

router.post("/lovense/command", async (req, res, next)=>{

    const { uid, reactionTime, vibrationPower } = req.body;

    let data = JSON.stringify({
        "token": LOVENSE_TOKEN,
        "uid": uid,
        "command": "Function",
        "action": `Vibrate:${vibrationPower}`,
        "timeSec": reactionTime,
        "loopRunningSec": 9,
        "loopPauseSec": 4,
        "apiVer": 1
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.lovense-api.com/api/lan/v2/command',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

    const { data:qrRes } = await axios.request(config);
    res.status(200).json(qrRes);

})




module.exports = router;