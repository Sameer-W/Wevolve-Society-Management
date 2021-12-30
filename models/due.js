const mongoose = require("mongoose");
const User = require("./user");

const dueSchema = new mongoose.Schema({
    name: String,
    date: {
        type: Date,
        default: new Date(),
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    
    status: {
        type: String,
        enum: ["Resolved", "Pending"],
        default: "Pending"

    },
    amount: {
        type: Number,
        required: true
    },
    // member: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true
    // }
});

const Due = mongoose.model("Due", dueSchema);

module.exports = Due;