const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require("./models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { storage } = require("./cloudinary");
const Complaint = require("./models/complaint");
const Due = require("./models/due");
const Permission = require("./models/permission");
const Notice = require("./models/notice");
const Document = require("./models/document");
const Visitor = require("./models/visitor");
const upload = multer({ storage })

const sendMail = async (recepient, id) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: recepient,
        subject: 'Registration ID',
        text: `Your Registration ID is: ${id}.`
    };
    try {
        const response = await transporter.sendMail(mailOptions)
        return true
    }
    catch (error) {
        console.log(error)
        return false
    }
}

// USER

router.get("/registration", (req, res) => {
    res.render("Registration")
})

router.post("/registration", async (req, res) => {
    const { password, id, confirmPassword } = req.body
    if (password !== confirmPassword) {
        req.flash("error", "Passwords did not match.")
        res.redirect("/registration")
    }
    else {
        try {
            const user = await User.findById({ _id: id })
            const hash = await bcrypt.hash(password, 12)
            user.password = hash
            const savedUser = await user.save()
            console.log(savedUser)
            req.session.user_id = user._id
            req.flash("success", "Successfully registered.")
            if (user.type == "admin") {
                if (user.flat) {
                    res.redirect("/admin/homepage")
                }
                else {
                    res.redirect("/resident/homepage")
                }
            }
            else if (user.type == "security") {
                res.redirect("/security/homepage")
            }
            else {
                res.redirect(`/resident/${user._id}/homepage`)
            }
        }
        catch {
            req.flash("error", "User not found. Please check your id or get yourself registered by the admin if not.")
            res.redirect("/registration")
        }
    }
})

router.get("/login", (req, res) => {
    res.render("Login")
})

router.post("/login", async (req, res) => {
    const { email, password, type } = req.body
    const user = await User.findOne({ email, type })
    console.log(user)
    if (!user) {
        req.flash("error", "Email or password or type is incorrect.")
        res.redirect("/login")
    }
    else {
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            req.flash("error", "Email or password or type is incorrect.")
            res.redirect("/login")
        }
        else {
            req.session.user_id = user._id
            if (type == "admin") {
                if (user.flat) {
                    res.redirect("/admin/homepage")
                }
                else {
                    res.redirect(`/resident/${user._id}/homepage`)
                }
            }
            else if (user.type == "security") {
                res.redirect("/security/homepage")
            }
            else {
                res.redirect(`/resident/${user._id}/homepage`)

            }

        }
    }
})

router.get("/logout", (req, res) => {
    res.render("Main_HomePage")
})

// SECURITY

router.get("/security/homepage", async (req, res) => {
    const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
    res.render("security/SecurityHomepage", { users })
})
router.post("/security/homepage", async (req, res) => {
    const { name, phone, reason, wing, roomNumber, time } = req.body
    room = parseInt(roomNumber)
    const visitor = new Visitor({ name, phone, reason, time })
    const user = await User.findOne({ flat: { wing: wing, roomNumber: room }, type: { $in: ["resident-owner", "resident-rental"] } })
    visitor.member = user._id
    const savedVisitor = await visitor.save()
    user.visitors.push(savedVisitor)
    const savedUser = await user.save()
    console.log(savedVisitor)
    console.log(savedUser)
    res.redirect("/security/homepage")
})

router.get("/security/residents", async (req, res) => {
    const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
    res.render("security/SecurityResident", { users })
})

router.post("/security/specificUser", async (req, res) => {
    const { wing, roomNumber } = req.body
    if (wing === "all") {
        const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
        res.render("security/SecurityResident", { users })
    }
    else {
        room = parseInt(roomNumber)
        const users = await User.find({ flat: { wing: wing, roomNumber: room }, type: { $in: ["resident-owner", "resident-rental"] } })
        res.render("security/SecurityResident", { users })
    }

})


// RESIDENT

router.get("/resident/:id/homepage", async (req, res) => {
    let notices = await Notice.find({})
    console.log(notices)
    notices = notices.reverse()
    const complaints = await Complaint.find({ complainant: req.params.id })
    const permissions = await Permission.find({ seeker: req.params.id })
    const allDues = await Due.find({})
    const visitors = await Visitor.find({ member: req.params.id })
    const complaint = complaints[complaints.length - 1]
    const permission = permissions[permissions.length - 1]
    const dues = [allDues[allDues.length - 1], allDues[allDues.length - 2], allDues[allDues.length - 3]]
    const visitor = visitors[visitors.length - 1]
    res.render("resident/R_Home page", { id: req.params.id, notices, complaint, permission, visitor, dues })
})

router.get("/resident/:id/notices", async (req, res) => {
    let notices = await Notice.find({})
    console.log(notices)
    notices = notices.reverse()
    res.render("resident/notices", { id: req.params.id, notices })
})

router.get("/resident/:id/dues", async (req, res) => {
    let dues = await Due.find({})
    dues = dues.reverse()
    res.render("resident/Dues Page", { id: req.params.id, dues })
})

router.get("/resident/:id/documents", async (req, res) => {
    const documents = await Document.find({ resident: req.params.id })
    res.render("resident/Documents Page", { id: req.params.id, documents })
})

router.post("/resident/:id/documents", upload.single("image"), async (req, res) => {
    const { name, date } = req.body
    const document = new Document({ name, date, resident: req.params.id })
    if (req.file) {
        document.image.url = req.file.path
        document.image.filename = req.file.filename
    }
    const savedDocument = await document.save()
    const user = await User.findOne({ _id: req.params.id })
    user.documents.push(savedDocument)
    const savedUser = await user.save()
    console.log(savedUser)
    console.log(savedDocument)
    res.redirect(`/resident/${req.params.id}/documents`)
})

router.get("/resident/:id/complaints", async (req, res) => {
    const complaints = await Complaint.find({ complainant: req.params.id })
    res.render("resident/complaints", { id: req.params.id, complaints })
})

router.post("/resident/:id/complaints", async (req, res) => {
    const { date, subject, details } = req.body
    const complaint = new Complaint({ date, subject, details, complainant: req.params.id })
    const user = await User.findOne({ _id: req.params.id })
    const savedComplaint = await complaint.save()
    user.complaints.push(savedComplaint)
    const savedUser = await user.save()
    console.log(savedUser)

    console.log(savedComplaint)
    res.redirect(`/resident/${req.params.id}/complaints`)
})

router.get("/resident/:id/permissions", async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).populate("permissions")
    console.log(req.params.id, user)
    const permissions = user.permissions
    console.log(permissions)
    res.render("resident/Permission", { id: req.params.id, permissions })
})

router.post("/resident/:id/permissions", async (req, res) => {
    const { occasionDate, event, details, time, venue, phone } = req.body
    const permission = new Permission({ occasionDate, event, details, time, venue, phone, seeker: req.params.id })

    const user = await User.findOne({ _id: req.params.id })

    const savedPermission = await permission.save()
    user.permissions.push(savedPermission)
    const savedUser = await user.save()
    console.log(savedUser)
    console.log(savedPermission)
    res.redirect(`/resident/${req.params.id}/permissions`)
})

router.get("/resident/:id/residents", async (req, res) => {
    const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
    res.render("resident/Residents", { id: req.params.id, users })
})

router.post("/resident/:id/specificUser", async (req, res) => {
    const { wing, roomNumber } = req.body
    if (wing === "all") {
        const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
        console.log(users)
        res.render("resident/Residents", { id: req.params.id, users })
    }
    else {
        room = parseInt(roomNumber)
        const users = await User.find({ flat: { wing: wing, roomNumber: room }, type: { $in: ["resident-owner", "resident-rental"] } })
        console.log(users)
        res.render("resident/Residents", { id: req.params.id, users })
    }

})

// ADMIN

router.get("/admin/addUser", async (req, res) => {
    const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
    res.render("admin/ResidentsAdmin", { users })

})

router.post("/admin/addUser", upload.single("image"), async (req, res) => {
    const { name, type, email, phone, flat } = req.body
    const user = new User({ name, email, phone, flat, type })
    if (req.file) {
        user.image.url = req.file.path
        user.image.filename = req.file.filename
    }
    const savedUser = await user.save()
    const mailSent = await sendMail(email, savedUser._id)
    if (mailSent) {
        req.flash("success", "Successfully added. Registration ID is sent to the registered email id. Please check the email id provided if email not received.")
    }
    else {
        req.flash("error", "Error in sending email. Please get the id from admin.")
    }
    res.redirect("/admin/addUser")
})

router.post("/admin/specificUser", async (req, res) => {
    const { wing, roomNumber } = req.body
    if (wing === "all") {
        const users = await User.find({ type: { $in: ["resident-owner", "resident-rental"] } })
        console.log(users)
        res.render("admin/ResidentsAdmin", { users })
    }
    else {
        room = parseInt(roomNumber)
        const users = await User.find({ flat: { wing: wing, roomNumber: room }, type: { $in: ["resident-owner", "resident-rental"] } })
        console.log(users)
        res.render("admin/ResidentsAdmin", { users })
    }

})
router.get("/admin/homepage", async (req, res) => {
    const allComplaints = await Complaint.find({}).populate("complainant")
    const allPermissions = await Permission.find({}).populate("seeker")
    const allDues = await Due.find({})
    const complaints = [allComplaints[allComplaints.length - 1], allComplaints[allComplaints.length - 2]]
    const permissions = [allPermissions[allPermissions.length - 1], allPermissions[allPermissions.length - 2]]
    const dues = [allDues[allDues.length - 1], allDues[allDues.length - 2], allDues[allDues.length - 3]]
    res.render("admin/Admin_HomePage", { complaints, permissions, dues })
})

router.get("/admin/notices", async (req, res) => {
    let notices = await Notice.find({})
    notices = notices.reverse()
    res.render("admin/adnot", { notices })
})

router.post("/admin/notices", async (req, res) => {
    const { date, subject, details } = req.body
    const notice = new Notice({ date, subject, details })
    const savedNotice = await notice.save()
    console.log(savedNotice)
    res.redirect("/admin/notices")
})

router.get("/admin/dues", async (req, res) => {
    let dues = await Due.find({})
    dues = dues.reverse()
    res.render("admin/DuesAdmin", { dues })
})

router.post("/admin/dues", async (req, res) => {
    const { dueDate, name, details, amount } = req.body
    const due = new Due({ dueDate, name, details, amount })
    const savedDue = await due.save()
    console.log(savedDue)
    res.redirect("/admin/dues")
})

router.get("/admin/documents", async (req, res) => {
    const documents = await Document.find({}).populate("resident")
    res.render("admin/DocumentsAdmin", { documents })
})

router.get("/admin/complaints", async (req, res) => {
    const complaints = await Complaint.find({}).populate("complainant")
    console.log(complaints)
    res.render("admin/adcom", { complaints })
})

router.get("/admin/permissions", async (req, res) => {
    const permissions = await Permission.find({}).populate("seeker")
    res.render("admin/PermissionAdmin", { permissions })
})
router.post("/admin/permissions/:id/accepted", async (req, res) => {
    const { id } = req.params
    const permission = await Permission.findOne({ _id: id })
    permission.status = "Accepted"
    const savedPermission = await permission.save()
    console.log(savedPermission)
    res.redirect("/admin/permissions")
})
router.post("/admin/permissions/:id/rejected", async (req, res) => {
    const { id } = req.params
    const permission = await Permission.findOne({ _id: id })
    permission.status = "Rejected"
    const savedPermission = await permission.save()
    console.log(savedPermission)
    res.redirect("/admin/permissions")
})
router.post("/admin/complaints/:id/resolved", async (req, res) => {
    const { id } = req.params
    const complaint = await Complaint.findOne({ _id: id })
    complaint.status = "Resolved"
    const savedComplaint = await complaint.save()
    console.log(savedComplaint)
    res.redirect("/admin/complaints")
})



module.exports = router;