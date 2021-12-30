const mongoose = require("mongoose");
const User = require("./user");

const documentSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date(),
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    image: {
        url: String,
        filename: String
    },
    resident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document; 