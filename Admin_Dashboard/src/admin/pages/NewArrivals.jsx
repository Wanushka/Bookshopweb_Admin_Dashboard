 
import { useState, useEffect } from "react";
import { AlertCircle, Save, Trash2, Plus } from "lucide-react";
import "./NewArrivals.css";

const API_BASE_URL = "http://localhost:5000";

const NewArrivals = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all books and current new arrivals on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksResponse, arrivalsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/new-arrivals`),
        ]);

        if (!booksResponse.ok || !arrivalsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const booksData = await booksResponse.json();
        const arrivalsData = await arrivalsResponse.json();

        // Transform the image URLs to include the base URL
        const transformedBooksData = booksData.map((book) => ({
          ...book,
          coverImage: `${API_BASE_URL}${book.coverImage}`,
          otherImages: book.otherImages.map((img) => `${API_BASE_URL}${img}`),
        }));

        const transformedArrivalsData = arrivalsData.map((book) => ({
          ...book,
          coverImage: `${API_BASE_URL}${book.coverImage}`,
          otherImages: book.otherImages.map((img) => `${API_BASE_URL}${img}`),
        }));

        setAllBooks(transformedBooksData);
        setNewArrivals(transformedArrivalsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const addToNewArrivals = async (book) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/new-arrivals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book._id,
          // Add any additional fields required by your API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add book");
      }

      const addedBook = await response.json();

      // Transform the added book's image URLs
      const transformedBook = {
        ...addedBook,
        coverImage: `${API_BASE_URL}${addedBook.coverImage}`,
        otherImages: addedBook.otherImages.map(
          (img) => `${API_BASE_URL}${img}`
        ),
      };

      setNewArrivals((prev) => [...prev, transformedBook]);
      setSuccessMessage("Book added to New Arrivals");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add book to New Arrivals");
      setTimeout(() => setError(null), 3000);
      console.error("Error adding book:", err);
    }
  };

  const removeFromNewArrivals = async (bookId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/new-arrivals/${bookId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove book");
      }

      setNewArrivals((prev) => prev.filter((book) => book._id !== bookId));
      setSuccessMessage("Book removed from New Arrivals");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to remove book from New Arrivals");
      setTimeout(() => setError(null), 3000);
      console.error("Error removing book:", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="new-arrivals-container">
      <header className="page-header">
        <h2 className="page-title">New Arrivals Management</h2>
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="success-message">
            <Save size={20} />
            <span>{successMessage}</span>
          </div>
        )}
      </header>

      <div className="content-grid">
        <section className="all-books">
          <h3>Available Books</h3>
          <div className="books-grid">
            {allBooks
              .filter(
                (book) =>
                  !newArrivals.find((arrival) => arrival._id === book._id)
              )
              .map((book) => (
                <div key={book._id} className="book-card">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="book-cover"
                  />
                  <div className="book-info">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    <p>Category: {book.category}</p>
                    <p>Price: Rs. {book.price}</p>
                    {book.discountPrice && (
                      <p>Discount Price: Rs. {book.discountPrice}</p>
                    )}
                    <button
                      onClick={() => addToNewArrivals(book)}
                      className="add-button"
                    >
                      <Plus size={16} />
                      Add to New Arrivals
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="current-arrivals">
          <h3>Current New Arrivals</h3>
          <div className="books-grid">
            {newArrivals.map((book) => (
              <div key={book._id} className="book-card">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="book-cover"
                />
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <button
                    onClick={() => removeFromNewArrivals(book._id)}
                    className="remove-button"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewArrivals;
