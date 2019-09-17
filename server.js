require('dotenv').config();
var express = require('express'),
    app = express(),
    chatHistory = [],
    fileupload = require('express-fileupload'),
    users = [];

const fs = require('fs');
var lastSaveTime = Math.floor(Date.now()/1000);
var moment = require("moment");
var bodyParser = require("body-parser");
var appRouter = require("./routes");

app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.json({limit:"5mb"}));
app.use(bodyParser.urlencoded({extended:true, limit:"5mb"}));
app.use(fileupload());
appRouter.register(app);
var server = require('http').createServer(app);
server.listen(process.env.PORT || 3000);//publish to heroku

console.log("SERVER IS RUNNING ON", process.env.PORT || 3000)

io = require('socket.io').listen(server),
io.on('connection', (socket) => {
    console.log("NEW SCOKET IS CONNECTED ON", process.env.PORT || 3000)
    //new user login
    socket.on('login', (nickname, usertype, roomid) => {

        if(users[roomid] == undefined){
            users[roomid] = [];
        }

        if (users[roomid].indexOf(nickname) > -1) {
            socket.emit('nickExisted');
            socket.nickname = nickname;
            socket.roomid = roomid;
            socket.usertype = usertype;
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
    socket.on('postMsg', (msg, color, img) => {
        var roomid = socket.roomid;
        socket.broadcast.to(roomid).emit('newMsg', socket.nickname, msg, color, roomid, img);
        saveChatHistory(socket.usertype, socket.nickname, msg, roomid, img);
    });


    socket.on('notification', (msg, roomid, imagelink)=>{
        if(roomid == "global"){
            socket.broadcast.emit('notification', msg, imagelink);   
        }else{
            socket.broadcast.to(roomid).emit('notification', msg, imagelink);
        }        
    });

    function saveChatHistory(usertype, nickname, message, roomid, img){

        var curTime = Math.floor(Date.now()/1000);
        const datestr = new Date().toTimeString().substr(0, 8);

        if(curTime - lastSaveTime > 10){
            //save chat history to file

            var dir = process.env.HISTORY;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            dir += "/"+roomid;

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

        if(message.indexOf("\n")==-1){
            message += '\n';
        }
        const history = `${datestr}<=>${usertype}<=>${nickname}<=>${roomid}<=>${message}<=>${img}`;
        chatHistory.push(history);
    }

    
});
