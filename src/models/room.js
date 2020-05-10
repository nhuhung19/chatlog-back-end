const mongoose = require("mongoose")

const roomSchema = mongoose.Schema({
    name: {
        type: String
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        unique: true,
        ref: "User"
    }]
})

module.exports = mongoose.model("Room", roomSchema)