const express = require("express");
const router = express.Router({ mergeParams: true }); // This option is necessary because routers get separate params and the params would not reach this route otherwise
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// REVIEW ROUTES
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

module.exports = router;
