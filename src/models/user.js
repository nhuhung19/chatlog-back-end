const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
        toLowerCase: true
    },
    token: String,
    room: {
        type: mongoose.Schema.ObjectId,
        ref: "Room"
    }
})

module.exports = mongoose.model("User", userSchema)