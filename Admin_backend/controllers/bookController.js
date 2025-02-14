const Book = require("../models/bookModel");

// @desc    Get all books
// @route   GET /api/books
const getBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};

// @desc    Add a new book
// @route   POST /api/books
const addBook = async (req, res) => {
  const { title, author, price } = req.body;
  const image = req.file ? req.file.path : null;

  if (!title || !author || !price || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const book = new Book({ title, author, price, image });
  const savedBook = await book.save();
  res.status(201).json(savedBook);
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  await book.deleteOne();
  res.json({ message: "Book deleted successfully" });
};

module.exports = { getBooks, addBook, deleteBook };
