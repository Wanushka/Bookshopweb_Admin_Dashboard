const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Schemas
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  discount: { type: Number },
  description: { type: String, required: true },
  count: { type: Number, required: true },
  category: { type: String, required: true },
  coverImage: { type: String, required: true },
  otherImages: [String],
  createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Book = mongoose.model('Book', bookSchema);
const Category = mongoose.model('Category', categorySchema);

// Routes
// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new book
app.post('/api/books', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'otherImages', maxCount: 5 }
]), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      coverImage: req.files['coverImage'] ? `/uploads/${req.files['coverImage'][0].filename}` : '',
      otherImages: req.files['otherImages'] 
        ? req.files['otherImages'].map(file => `/uploads/${file.filename}`)
        : []
    };

    const book = new Book(bookData);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update book
app.put('/api/books/:id', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'otherImages', maxCount: 5 }
]), async (req, res) => {
  try {
    const bookData = { ...req.body };
    
    if (req.files['coverImage']) {
      bookData.coverImage = `/uploads/${req.files['coverImage'][0].filename}`;
    }
    
    if (req.files['otherImages']) {
      bookData.otherImages = req.files['otherImages'].map(file => `/uploads/${file.filename}`);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      bookData,
      { new: true }
    );
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new category
app.post('/api/categories', async (req, res) => {
  try {
    const category = new Category({ name: req.body.name });
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});