const mongoose = require("mongoose");
const User = require("./user");

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: String,
    reason: String,
    date: {
        type: Date,
        default: new Date(),
    },
    time: String,
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const Visitor = mongoose.model("visitor", visitorSchema);

module.exports = Visitor;