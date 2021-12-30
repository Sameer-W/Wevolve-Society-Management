const mongoose = require("mongoose");
const Complaint = require("./complaint");
const Permission = require("./permission");
const Due = require("./due");
const Document = require("./document");
const Visitor = require("../models/visitor");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["admin", "resident-owner", "resident-rental", "security"],
        default: "resident-owner"
    },
    password: String,
    email: {type: String, required: true},
    phone: {type: String, required: true},
    flat: {
        wing: String,
        roomNumber: Number
        // required: true
    },
    image: {
        url: String,
        filename: String
    },
    complaints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint"
    }],
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],
    dues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Due"
    }],
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document"
    }],
    visitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor"
    }]
});

const User = new mongoose.model("User", userSchema);

module.exports = User;