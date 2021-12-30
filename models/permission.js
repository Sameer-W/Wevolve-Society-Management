const mongoose = require("mongoose");
const User = require("./user");

const permissionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date(),
        required: true,
    },
    occasionDate: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    phone: Number,
    venue: {
        type: String,
        enum: ["Garden", "Pool", "Club House", "Auditorium", "Home"],
        required: true
    },
    status: {
        type: String,
        enum: ["Accepted", "Pending", "Rejected"],
        default: "Pending"

    },
    seeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;