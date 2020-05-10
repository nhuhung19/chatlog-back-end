const User = require("../models/user")
const Room = require("../models/room")
const Chat = require("../models/chat")

class Server {
    constructor(user) {
        this.user = user
    }

    static async login(userName, socketId){

        // console.log(userName, socketId)
        let user = await User.findOne({name: userName})
        if(!user){
            user = await User.create({name: userName, token: socketId})
        }
        user.token = socketId
        await user.save()
        return user
    }

    async userLogout(){
        // console.log(this.user)
        await User.findOneAndDelete({name: this.user.name})
        const room = await Room.findById(this.user.room)
        room.members.remove(this.user._id)
        await room.save()
    }

    static async checkUser(socketId){
        const user = await User.findOne({token: socketId})
        if(!user) throw new Error("user not found")
        // console.log(user, "=====")
        return new Server(user)
    }

    async joinRoom(rId){
        const room = await Room.findById(rId)
        if(!room.members.includes(this.user._id)){
            room.members.push(this.user._id)
            await room.save()
        } 
        this.user.room = rId // just an id
        await this.user.save()
        this.user.room = room // reassign
    }

    async leaveRoom(){
        // console.log("hiii")
        let rId = this.user.room
        const room = await Room.findById(rId)
        if(!room) throw new Error("room not found")
        room.members.remove(this.user._id)
        await room.save()
        this.user.room = null
        await this.user.save()
        this.user.rId = rId
    }

    async chat(obj) {
        const chat = await Chat.create({
            text: obj.text,
            createAt: obj.createdAt,
            user: {
              id: this.user._id,
              name: this.user.name
            },
            room: this.user.room._id
          });
        return chat
    }

    sendMessage(chat){
        let chatObj = {
            text: chat.text, 
            name: chat.user.name, 
            createAt: chat.createAt
        }
        return chatObj
    }

  

}

module.exports = Server