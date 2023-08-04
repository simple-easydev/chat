const colorConfig = {
    'guest':'#000000',
    'vip':'#78762E',
    'private':'blue',
    'broadcaster':'#b83dba',
    'system': 'red'
};

// bake_cookie({
//     name: "myname" + new Date().getTime(),
//     usertype: "broadcast"
// });

function bake_cookie(data) {
    var scookie = JSON.stringify(data);
    document.cookie = scookie;
    console.log(document.cookie);
}

function read_cookie() {
    // if(document.cookie != ""){
    //     return JSON.parse(document.cookie);
    // }
    return {};
}

function delete_cookie() {
    document.cookie = "";
}

var hichat;
window.onload = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var groupid = urlParams.get('groupid');
    
    var cookie = read_cookie();
    hichat = new HiChat(groupid, cookie);
    
    // hichat.init(groupid);
};

class HiChat{
    constructor(groupid, cookie){
        this.groupid = groupid;
        this.cookie = cookie;
        this.init();
    }

    init() {
        var groupid = this.groupid;
        var cookie = this.cookie;
        var urlParams = new URLSearchParams(window.location.search);
        var name = cookie["name"] || urlParams.get('name');

        var usertype = cookie["usertype"] || urlParams.get('usertype');
        this.name = name;
        
        var that = this;
        // this.socket = io.connect("https://chat1.camscartel.com")
        this.socket = io.connect();
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            if(usertype == "guest"){
                document.getElementById('nickWrapper').style.display = 'flex';    
                document.getElementById('nicknameInput').focus();
            }else{
                document.getElementById('loginWrapper').style.display = 'none';
                that.socket.emit('login', name, usertype, groupid);
            }
        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls';
        });
        this.socket.on('loginSuccess', function() {
            document.title = 'Talkshak | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('message').focus();
        });

        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                // document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        this.socket.on('system', function(nickName, userCount, type, roomid) {
            var msg = nickName + (type == 'login' ? ' joined' : ' left') + " room:" + roomid;
            that._displayNewMsg('system', msg, 'system');
            // document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
        this.socket.on('newMsg', function(user, msg, color, roomid, image) {            
            that._displayNewMsg(user, msg, color, image);
        });

        this.socket.on('notification', function(msg, imagelink) {

            //document 
            // var event = new CustomEvent('notification', { detail: msg });
            // document.dispatchEvent(event);
            
            that._displayNotification(msg, imagelink);
        });
        
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName, usertype, groupid);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);

        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName, usertype, groupid);
                };
            };
        }, false);
        document.getElementById('sendBtn').addEventListener('click', function() {
            var message = document.getElementById('message'),
                msg = message.value;
            message.value = '';
            message.focus();
            if (msg.trim().length != 0) {

                that.socket.emit('postMsg', msg, usertype, my_profile_image);
                that._displayNewMsg('me', msg, usertype, my_profile_image);
                return;
            };
        }, false);


        document.getElementById('light-dark-btn').addEventListener('click', function() {
            const body = document.getElementsByTagName("body")[0];
            const themeMode = body.getAttribute("data-layout-mode");
            body.hasAttribute("data-layout-mode") && "dark" == body.getAttribute("data-layout-mode") ? document.body.setAttribute("data-layout-mode", "light"): document.body.setAttribute("data-layout-mode", "dark")
        }, false);

        document.getElementById('message').addEventListener('keyup', function(e) {
            var message = document.getElementById('message'),
                msg = message.value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                message.value = '';                
                that.socket.emit('postMsg', msg, usertype, my_profile_image);
                that._displayNewMsg('me', msg, usertype, my_profile_image);
            };
        }, false);


        
    }

    setPrevHistory(data){
        const originname = this.name;
        data.forEach(element => {
            const name = (element.name == originname)?'me':element.name;
            const time = element.time;
            const color = colorConfig[element.usertype];
            const message = element.message;
            this._displayOldMsg(name, message, color, time);
        });
    }

    _displayOldMsg(user, msg, color, date){
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            msg = this._showEmoji(msg);
            msgToDisplay.style.color = color || '#000';
        var userhtml = user; 
        if(color == colorConfig["vip"]){
            userhtml = `<span class = "vip-user">VIP:<img src = "../../content/star.png"></img></span> - ` + user
        }
        msgToDisplay.innerHTML = userhtml + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
    
    _displayNotification(msg, imagelink){
        console.log(imagelink);
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            imgToDisplay = document.createElement('div'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
            msgToDisplay.style.color = '#000';
            msgToDisplay.style.fontStyle = "italic";
            
            
        msgToDisplay.innerHTML = '<span class="timespan">(' + date + '): </span>' + msg;
        imgToDisplay.innerHTML = imagelink;
        container.appendChild(msgToDisplay);
        container.appendChild(imgToDisplay);
        container.scrollTop = container.scrollHeight;
    }

    _displayNewMsg(user, msg, usertype, profile_image) {        
        var event = new CustomEvent('newMsg', {detail : { user: user, msg: msg, usertype: usertype, image: profile_image }});
        document.dispatchEvent(event);
            
        // var container = document.getElementById('historyMsg'),
        //     msgToDisplay = document.createElement('p'),
        //     date = new Date().toTimeString().substr(0, 8),
        //     //determine whether the msg contains emoji
        //     msg = this._showEmoji(msg);
            
        //     msgToDisplay.style.color = color || '#000';
        //     var userhtml = user; 
        //     if(color == colorConfig["vip"]){
        //         userhtml = `<span class = "vip-user">VIP:<img src = "../../content/star.png"></img></span> - ` + user
        //     }
            
        // msgToDisplay.innerHTML = userhtml + '<span class="timespan">(' + date + '): </span>' + msg;
        // container.appendChild(msgToDisplay);
        // container.scrollTop = container.scrollHeight;
    }
    _displayImage(user, imgData) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
    
    _showEmoji(msg) {
        // var match, result = msg,
        //     reg = /\[emoji:\d+\]/g,
        //     emojiIndex,
        //     totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        // while (match = reg.exec(msg)) {
        //     emojiIndex = match[0].slice(7, -1);
        //     if (emojiIndex > totalEmojiNum) {
        //         result = result.replace(match[0], '[X]');
        //     } else {
        //         result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
        //     };
        // };
        return msg;
    }

}
