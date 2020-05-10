const mongoose = require("mongoose")

const chatSchema = mongoose.Schema({
    text: {
        type: String,
        trim: true,
        required: true
    },
    createAt: {
        type: String
    },
    room: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Room"
    },
    user: {
        id: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "User"
        },
        name: String  
    }
})

module.exports = mongoose.model("Chat", chatSchema)

