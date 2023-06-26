const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// CAMPGROUND ROUTES
router.get("/", campgrounds.index);

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post(
	"/",
	isLoggedIn,
	validateCampground,
	catchAsync(campgrounds.createCampground)
);

// The order of this shit matters
router.get("/:id", catchAsync(campgrounds.showCampground));

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderEditForm)
);

router.put(
	"/:id",
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(campgrounds.updateCampground)
);

router.delete(
	"/:id",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
