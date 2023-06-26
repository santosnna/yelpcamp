const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// CAMPGROUND ROUTES

// router.route() groups different requests (verbs) to the same route
router
	.route("/")
	.get(campgrounds.index)
	.post(
		isLoggedIn,
		validateCampground,
		catchAsync(campgrounds.createCampground)
	);

// The order of this shit matters.
// It needs to be before :id otherwise Express will assume it's an id.
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
	.route("/:id")
	.get(catchAsync(campgrounds.showCampground))
	.put(
		isLoggedIn,
		isAuthor,
		validateCampground,
		catchAsync(campgrounds.updateCampground)
	)
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
