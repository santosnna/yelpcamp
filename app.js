const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/**
 * This configures the Session with basic parameters and
 * also sets an expiration date to the cookie
 */
const sessionConfig = {
	secret: "thisshouldbeabettersecret!",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Sets the expiration to 1 week (1000ms in 1 sec; 60sec in 1 min; etc)
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**
 * This is a Middleware that detects if the flash variable
 * is set to anything during the last req/res cycle and if
 * so, it is declared to a res.locals variable. This is used
 * to send flash messages to the user.
 */
app.use((req, res, next) => {
	console.log(req.session);
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
	res.render("home");
});

/**
 * The method '.all' means 'for all kinds of request'
 * The path '*' means 'for every route'
 * It only runs if any other function above responds
 */
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh No, Something Went Wrong! :(";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on port 3000");
});
