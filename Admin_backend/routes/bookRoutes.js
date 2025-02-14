const express = require("express");
const multer = require("multer");
const { getBooks, addBook, deleteBook } = require("../controllers/bookController");

const router = express.Router();

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get("/", getBooks);
router.post("/", upload.single("image"), addBook);
router.delete("/:id", deleteBook);

module.exports = router;
