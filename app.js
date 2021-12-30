const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const routes = require("./routes");

if ( process.env.NODE_ENV !== "production" ) {
    require("dotenv").config()
}

mongoose.connect("mongodb://localhost:27017/societyApp")
    .then(() => {console.log("Mongoose Connection Open...")})
    .catch((err) => {console.log("Mongoose Connection Error...", err)})


app.set("views", path.join(__dirname, "/views"))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, '/public')));
app.use(session({secret: "secretCode", resave: false, saveUninitialized: false}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(express.urlencoded({ extended: true}))

app.use("/", routes);

app.get("/home", (req, res) => {
    res.render("Main_HomePage")
})

app.listen(3000, () => {
    console.log("Serving on port 3000...")
});
