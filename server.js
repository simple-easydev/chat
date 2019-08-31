require('dotenv').config()
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    chatHistory = [],
    users = [];

const fs = require('fs');
var lastSaveTime = Math.floor(Date.now()/1000);
var moment = require("moment");

app.use('/', express.static(__dirname + '/www'));

//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket
console.log("SERVER IS RUNNING ON", process.env.PORT || 3000)
io.on('connection', (socket) => {
    //new user login
    socket.on('login', (nickname, usertype, roomid) => {

        console.log(nickname, usertype, roomid);

        if(users[roomid] == undefined){
            users[roomid] = [];
        }

        if (users[roomid].indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            socket.roomid = roomid;
            socket.usertype = usertype;
            socket.join(roomid)
            users[roomid].push(nickname);
            socket.emit('loginSuccess');

            socket.emit('system', socket.nickname, users[roomid].length, 'login', roomid);
            socket.broadcast.to(roomid).emit('system', socket.nickname, users[roomid].length, 'login', roomid);
        };
    });

    //user leaves
    socket.on('disconnect', () => {
        if (socket.nickname != null) {
            var roomid = socket.roomid;
            users[roomid].splice(users[roomid].indexOf(socket.nickname), 1);
            socket.broadcast.to(roomid).emit('system', socket.nickname, users[roomid].length, 'logout', roomid);
        }
    });

    //new message get
    socket.on('postMsg', (msg, color) => {
        var roomid = socket.roomid;
        socket.broadcast.to(roomid).emit('newMsg', socket.nickname, msg, color, roomid);
        saveChatHistory(socket.usertype, socket.nickname, msg, roomid);


    });


    function saveChatHistory(usertype, nickname, message, roomid){

        var curTime = Math.floor(Date.now()/1000);
        const datestr = new Date().toTimeString().substr(0, 8);

        if(curTime - lastSaveTime > 3600){
            //save chat history to file

            var dir = `./history`;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            const filename = moment().format('MMMM_Do_YYYY_h_mm_ss');;
            fs.writeFile(`${dir}/${filename}.sav`, chatHistory.join(), (err) => {
                if (err) throw err;
                console.log('chat history saved!');
            });

            lastSaveTime = curTime;
            chatHistory= [];
            return;
        }
        
        const history = `${datestr}::${usertype}::${nickname}::${roomid}::${message}`;
        chatHistory.push(history);


    }

    
});
