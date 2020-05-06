require('dotenv').config({ path: ".env" })
const http = require('http');
const socketio = require("socket.io")


const app = require('./app');

const server = http.createServer(app); // create node sẻver


const io = socketio(server) // create websocket
const Filter = require('bad-words')
const filter = new Filter();

io.on("connection", (socket) => { // this event will be sent from client
  
  socket.on("chat", (obj, cb) => {
    if(filter.isProfane(obj.text)){
      return cb("Profanity not allow")
    }
    // console.log(message)
    io.emit("messages", obj)
  })
})

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});