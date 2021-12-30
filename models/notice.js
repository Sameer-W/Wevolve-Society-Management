const mongoose = require("mongoose");
const User = require("./user");

const noticeSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date(),
        required: true,
    },
    subject: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    documents: {
        url: String,
        filename: String
    }
});

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice; 