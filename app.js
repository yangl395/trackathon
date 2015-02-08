var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

var clients = {};

var users = [];

io.sockets.on('connection', function (socket) {

  socket.on('add-user', function(data){
    clients[data.username] = {
      "socket": socket.id

    };
    console.log(data);
  });

  socket.on('private-message', function(data){
    console.log("Sending: " + data.content + " to " + data.username);
    if (clients[data.username]){
      io.sockets.connected[clients[data.username].socket].emit("add-message", data);
    } else {
      console.log("User does not exist: " + data.username);
    }
  });

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
    for(var name in clients) {
      if(clients[name].socket === socket.id) {
        delete clients[name];
        break;
      }
    }
  })

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
