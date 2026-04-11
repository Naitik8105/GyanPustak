const reviewModel = require('../models/reviewModel');

async function addReview(req, res) {
  try {
    const reviewId = await reviewModel.addReview({
      student_id: req.user.id,
      book_id: req.body.book_id,
      rating: Number(req.body.rating),
      review_text: req.body.review_text,
    });
    res.status(201).json({ message: 'Review saved', reviewId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function listBookReviews(req, res) {
  try {
    const reviews = await reviewModel.listReviewsByBook(req.params.bookId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { addReview, listBookReviews };
