const bookModel = require('../models/bookModel');

async function listBooks(req, res) {
  try {
    const books = await bookModel.listBooks(req.query.q || '');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getBook(req, res) {
  try {
    const book = await bookModel.getBookDetails(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createBook(req, res) {
  try {
    const { authors = [], keywords = [], ...bookData } = req.body;
    const bookId = await bookModel.createBook(bookData);
    await bookModel.addAuthorsForBook(bookId, authors);
    await bookModel.addKeywordsForBook(bookId, keywords);
    res.status(201).json({ message: 'Book created', bookId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateBook(req, res) {
  try {
    await bookModel.updateBook(req.params.id, req.body);
    res.json({ message: 'Book updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteBook(req, res) {
  try {
    await bookModel.deleteBook(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addBookToCourseOffering(req, res) {
  try {
    await bookModel.addBookToCourseOffering({
      offering_id: req.body.offering_id,
      book_id: req.params.id,
      added_by_admin_id: req.user.id,
      required_or_recommended: req.body.required_or_recommended,
    });
    res.status(201).json({ message: 'Book linked to course offering' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  addBookToCourseOffering,
};
