
const Filter = require('bad-words')
const filter = new Filter();
const Room = require("./models/room")
const Server = require("./utils/server")



module.exports = function (io){
    io.on("connection", async (socket) => { // this event will be sent from client

        socket.emit("rooms", await Room.find())
      
        socket.on("login", async (userName, cb) => {
          try {
            // console.log(userName, "======")
            // need a function check if the userName exists in our da(User model). If not create new user
            // login(userName, socket.id)
            //everytime user login socket will create unique id(socket.id)
            const user = await Server.login(userName, socket.id)
            return cb({ ok: true, data: user })
          } catch (err) {
            return cb({ ok: true, error: err.message })
          }
          // console.log(userName)
      
        })
      
        socket.on("joinRoom", async (rId) => {
          //1. Checking user and return instance
          const server = await Server.checkUser(socket.id)
          // console.log(server)
          // 2 - Update database when user join a room User.room, Room.member
          await server.joinRoom(rId)
          // 3 - Update current room to client
          socket.emit("selectedRoom", {room: server.user.room, user: server.user._id})
          // 4 - subscribe to channel
          socket.join(rId)
          // 5 - send welcome message to client
          socket.emit("messages", {
            name: "System",
            text: `Welcome ${server.user.name} to ${server.user.room.name}`
          })
          // 6 - send notification to other clients in the new room
          socket.to(rId).broadcast.emit("messages", {
            name: "System",
            text: `${server.user.name} has joined ${server.user.room.name}`
          })
          // 7 - update rooms globally to reflect changes
          io.emit("rooms", await Room.find())
        })
      
        socket.on("leaveRoom", async (_, cb) => {
          // console.log("helloooo")
          try {
            const server = await Server.checkUser(socket.id)
            //Update database when user leave a room User.room, Room.member
            await server.leaveRoom()
            //notify the other client in that room
            socket.to(server.user.rId).broadcast.emit("messages", {
              name: "System",
              text: `${server.user.name} has left the room`
            })
            //unsubcrible form the channel
            socket.leave(server.user.rId)
            io.emit("rooms", await Room.find()) 
            // update rooms globally to reflect changes
          } catch (err) {
            return cb({ ok: false, error: err.message })
          }
      
        })
      
        socket.on("chat", async (obj, cb) => {
          try {
            const server = await Server.checkUser(socket.id)
            if (filter.isProfane(obj.text)) {
              return cb({ ok: false, message: "Profanity not allow" });
              // return cb("Profanity not allow")
            }
            // console.log(obj)
            const chat = await server.chat(obj)
            // console.log(server.sendMessage(chat))
            io.to(server.user.room._id).emit("messages", server.sendMessage(chat))
      
          } catch (err) {
            return cb({ ok: false, message: err.message });
          }
      
        })
      
        socket.on("disconnect", async () => {
          try{
            const server = await Server.checkUser(socket.id)
            socket.to(server.user.room._id).broadcast.emit("messages", {
              name: "System",
              text: `${server.user.name} has left the room`
            })
            await server.userLogout()
            io.emit("rooms", await Room.find({}))
          } catch(err){
            console.log(err.message)
          }
        })
      
      })
}
