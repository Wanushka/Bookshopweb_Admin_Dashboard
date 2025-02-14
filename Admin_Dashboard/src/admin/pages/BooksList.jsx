/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload } from "lucide-react";
import "./BooksList.css";

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [otherImagesPreview, setOtherImagesPreview] = useState([]);

  const initialFormData = {
    title: "",
    author: "",
    price: "",
    discountPrice: "",
    discount: "",
    description: "",
    count: "",
    coverImage: null,
    otherImages: []
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch books');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleOtherImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      otherImages: [...prev.otherImages, ...files]
    }));
    
    const previews = files.map(file => URL.createObjectURL(file));
    setOtherImagesPreview(prev => [...prev, ...previews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'otherImages') {
          formData[key].forEach(image => {
            formDataToSend.append('otherImages', image);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = selectedBook 
        ? `/api/books/${selectedBook._id}`
        : '/api/books';
      
      const method = selectedBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to save book');

      await fetchBooks();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      discountPrice: book.discountPrice,
      discount: book.discount,
      description: book.description,
      count: book.count,
      coverImage: book.coverImage,
      otherImages: book.otherImages
    });
    setCoverPreview(book.coverImage);
    setOtherImagesPreview(book.otherImages);
    setIsModalOpen(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete book');

        await fetchBooks();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setFormData(initialFormData);
    setCoverPreview(null);
    setOtherImagesPreview([]);
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="books-list-container">
      <div className="header">
        <h2>Books List</h2>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add New Book
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="books-grid">
        {books.map(book => (
          <div key={book._id} className="book-card">
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="book-cover"
            />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <div className="price-info">
                <span className="price">${book.price}</span>
                {book.discountPrice && (
                  <span className="discount-price">${book.discountPrice}</span>
                )}
              </div>
              <p className="stock">In stock: {book.count}</p>
              <div className="actions">
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
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button className="close-button" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Book Title</label>
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
                  <label htmlFor="author">Author</label>
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
                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
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
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="count">Stock Count</label>
                  <input
                    type="number"
                    id="count"
                    name="count"
                    value={formData.count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
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
                    Cover Image
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
                  />
                  {coverPreview && (
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="image-preview"
                    />
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
                      <img 
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="image-preview"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <Save size={16} />
                  {selectedBook ? 'Update Book' : 'Add Book'}
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