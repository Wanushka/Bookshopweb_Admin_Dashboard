/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload } from "lucide-react";
import "./BooksList.css";

const API_BASE_URL = "http://localhost:5000";

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [otherImagesPreview, setOtherImagesPreview] = useState([]);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialFormData = {
    title: "",
    author: "",
    price: "",
    discountPrice: "",
    discount: "",
    description: "",
    count: "",
    category: "",
    otherCategory: "",
    coverImage: null,
    otherImages: [],
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books`);
      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      setBooks(
        data.map((book) => ({
          ...book,
          coverImage: `${API_BASE_URL}${book.coverImage}`,
          otherImages: book.otherImages.map((img) => `${API_BASE_URL}${img}`),
        }))
      );
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch books");
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name === "category") {
      setShowOtherCategory(value === "other");
    }

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleOtherImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      otherImages: [...prev.otherImages, ...files],
    }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setOtherImagesPreview((prev) => [...prev, ...previews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const formDataToSend = new FormData();

      if (
        !formData.title ||
        !formData.author ||
        !formData.price ||
        !formData.count
      ) {
        throw new Error("Please fill in all required fields");
      }

      Object.keys(formData).forEach((key) => {
        if (key === "otherImages") {
          formData[key].forEach((image) => {
            formDataToSend.append("otherImages", image);
          });
        } else if (key === "category" && formData.category === "other") {
          formDataToSend.append("category", formData.otherCategory);
        } else if (key === "coverImage" && formData[key] instanceof File) {
          formDataToSend.append("coverImage", formData[key]);
        } else if (key !== "otherCategory" || formData.category === "other") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = selectedBook
        ? `${API_BASE_URL}/api/books/${selectedBook._id}`
        : `${API_BASE_URL}/api/books`;

      const method = selectedBook ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save book");
      }

      // Get the updated book data from the response
      const updatedBook = await response.json();

      // Update the books state with the new data
      setBooks((prevBooks) => {
        if (selectedBook) {
          // If editing, replace the existing book
          return prevBooks.map((book) =>
            book._id === selectedBook._id
              ? {
                  ...updatedBook,
                  coverImage: `${API_BASE_URL}${updatedBook.coverImage}`,
                  otherImages: updatedBook.otherImages.map(
                    (img) => `${API_BASE_URL}${img}`
                  ),
                }
              : book
          );
        } else {
          // If adding new book, append it to the list
          return [
            ...prevBooks,
            {
              ...updatedBook,
              coverImage: `${API_BASE_URL}${updatedBook.coverImage}`,
              otherImages: updatedBook.otherImages.map(
                (img) => `${API_BASE_URL}${img}`
              ),
            },
          ];
        }
      });

      if (formData.category === "other" && formData.otherCategory) {
        const categoryResponse = await fetch(`${API_BASE_URL}/api/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: formData.otherCategory }),
        });

        if (!categoryResponse.ok) {
          throw new Error("Failed to add new category");
        }

        await fetchCategories();
      }

      closeModal();
    } catch (err) {
      setError(err.message);
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      discountPrice: book.discountPrice || "",
      discount: book.discount || "",
      description: book.description,
      count: book.count,
      category: book.category,
      otherCategory: "",
      coverImage: null,
      otherImages: [],
    });
    setCoverPreview(book.coverImage);
    setOtherImagesPreview(book.otherImages || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete book");
        }

        await fetchBooks();
      } catch (err) {
        setError(err.message);
        console.error("Error deleting book:", err);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setFormData(initialFormData);
    setCoverPreview(null);
    setOtherImagesPreview([]);
    setShowOtherCategory(false);
    setError(null);
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="books-list-container">
      <div className="header">
        <div className="header-top">
          <h2>Books List</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Add New Book
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Discount Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id}>
                <td>
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="table-book-cover"
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>Rs. {book.price}</td>
                <td>
                  {book.discountPrice ? `Rs. ${book.discountPrice}` : "-"}
                </td>
                <td>{book.count}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(book)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(book._id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedBook ? "Edit Book" : "Add New Book"}</h3>
              <button className="close-button" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Book Title*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author">Author*</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>

                {showOtherCategory && (
                  <div className="form-group">
                    <label htmlFor="otherCategory">New Category*</label>
                    <input
                      type="text"
                      id="otherCategory"
                      name="otherCategory"
                      value={formData.otherCategory}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="price">Price*</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discountPrice">Discount Price</label>
                  <input
                    type="number"
                    id="discountPrice"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discount">Discount (%)</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="count">Stock Count*</label>
                  <input
                    type="number"
                    id="count"
                    name="count"
                    value={formData.count}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="image-upload-section">
                <div className="form-group">
                  <label htmlFor="coverImage">
                    Cover Image{!selectedBook && "*"}
                    <div className="upload-button">
                      <Upload size={20} />
                      Choose File
                    </div>
                  </label>
                  <input
                    type="file"
                    id="coverImage"
                    name="coverImage"
                    onChange={handleCoverImageChange}
                    accept="image/*"
                    className="hidden"
                    required={!selectedBook}
                  />
                  {coverPreview && (
                    <div className="preview-container">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="image-preview"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="otherImages">
                    Other Images
                    <div className="upload-button">
                      <Upload size={20} />
                      Choose Files
                    </div>
                  </label>
                  <input
                    type="file"
                    id="otherImages"
                    name="otherImages"
                    onChange={handleOtherImagesChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <div className="other-images-preview">
                    {otherImagesPreview.map((preview, index) => (
                      <div key={index} className="preview-container">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="image-preview"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <Save size={16} />
                  {selectedBook ? "Update Book" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksList;
