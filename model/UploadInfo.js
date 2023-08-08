const mongoose = require('mongoose');

const uploadInfoSchema = new mongoose.Schema({
    info:{
        type: String,
        required: true
    },

}, {timestamps: true})

const UploadInfo = mongoose.model("Info", uploadInfoSchema)

module.exports = UploadInfo