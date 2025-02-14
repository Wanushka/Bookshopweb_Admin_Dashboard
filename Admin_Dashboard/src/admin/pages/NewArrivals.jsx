/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { AlertCircle, Save, Trash2, Plus } from 'lucide-react';
import "./NewArrivals.css";

const NewArrivals = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all books and current new arrivals on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksResponse, arrivalsResponse] = await Promise.all([
          fetch('/api/books'),
          fetch('/api/new-arrivals')
        ]);
        
        const booksData = await booksResponse.json();
        const arrivalsData = await arrivalsResponse.json();
        
        setAllBooks(booksData);
        setNewArrivals(arrivalsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToNewArrivals = async (book) => {
    try {
      const response = await fetch('/api/new-arrivals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book)
      });

      if (!response.ok) throw new Error('Failed to add book');

      setNewArrivals([...newArrivals, book]);
      setSuccessMessage('Book added to New Arrivals');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to add book to New Arrivals');
      setTimeout(() => setError(null), 3000);
    }
  };

  const removeFromNewArrivals = async (bookId) => {
    try {
      const response = await fetch(`/api/new-arrivals/${bookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove book');

      setNewArrivals(newArrivals.filter(book => book._id !== bookId));
      setSuccessMessage('Book removed from New Arrivals');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove book from New Arrivals');
      setTimeout(() => setError(null), 3000);
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
              .filter(book => !newArrivals.find(arrival => arrival._id === book._id))
              .map(book => (
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
            {newArrivals.map(book => (
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