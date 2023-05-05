const express = require("express");
const router = express.Router({ mergeParams: true }); // This option is necessary because routers get separate params and the params would not reach this route otherwise
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas");

/**
 * This function is a Middleware that will validate a
 * review acording to the Joi schema.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

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
