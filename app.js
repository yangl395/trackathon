var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

var clients = {};

var availableQueue = [];


function pairUsers(userA, userB){
  userA.targetSocket = userB.uSocket;
  userB.targetSocket = userA.uSocket;
  return true;
}

function getTargetUser(usocket){
  for (var user in clients){
    console.log(clients[user]);
    if(clients[user].targetSocket == usocket){
      return clients[user];
      break;
    }
  }
  console.log('cant find target user');
  return null;
}

function getThisUser(usocket){
  for (var user in clients){
    console.log(clients.user);
    if(clients.user.uSocket == usocket){
      console.log(123);
    }
  }
  console.log('cant find this user');
  return null;
}


io.sockets.on('connection', function (socket) {


  socket.on('add-user', function(data){
    var tempUser = {
    uSocket: socket.id,
    isAvail: true
    };
    clients[socket.id] = tempUser;
    if(availableQueue.length == 0){
      availableQueue.push(tempUser);
    }else{
      var tempUserB = availableQueue.shift();
      pairUsers(clients[socket.id], tempUserB);
    }

    console.log(tempUser);
    console.log(tempUserB);
  });

  socket.on('song-request', function(data){
    //console.log("Sending: " + data.content + " to " + data.username);
    console.log(socket.id);
    var targetSocket = clients[socket.id].targetSocket;
    //console.log(targetUser);
    console.log(data.content);
    io.sockets.connected[targetSocket].emit("song-request-post", data);

    /*
    if (clients[data.username]){
      io.sockets.connected[clients[data.username].socket].emit("add-message", data);
    } else {
      console.log("User does not exist: " + data.username);
    }
    */

  });
  socket.on('song-recommend',function(data){
    var targetUser = getTargetUser(socket.id);
    io.sockets.connected[targetUser.uSocket].emit("song-post", data);

  });

  socket.on('disconnect', function() {
    
    for(var name in clients) {
      if(clients[name].uSocket === socket.id) {
        delete clients[name];
        break;
      }
    }

  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
