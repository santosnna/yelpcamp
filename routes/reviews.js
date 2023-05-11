const express = require("express");
const router = express.Router({ mergeParams: true }); // This option is necessary because routers get separate params and the params would not reach this route otherwise
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview } = require("../middleware");

// REVIEW ROUTES
router.post(
	"/",
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash("success", "Created new review!");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	"/:reviewId",
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // This method is used to remove elements from arrays in MongoDB
		await Review.findByIdAndDelete(reviewId);
		req.flash("success", "Successfully deleted review!");
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
