const mongoose = require("mongoose");
const User = require("./user");

const complaintSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ["Resolved", "Pending"],
        default: "Pending"
    },
    complainant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

const Complaint = mongoose.model("Complaint", complaintSchema)

module.exports = Complaint;