var io = require('socket.io-client')
var socket = io.connect('http://localhost:3000', {reconnect: true});

socket.on('connect', function(){
    var roomid = "1234";
    socket.emit("creat-room", roomid);
});

socket.on('create', function(data){
    console.log("event")
});
socket.on('disconnect', function(){
    console.log("disconnect")
});