import { Link } from "react-router-dom";
import "./sidebar.css";
import { Home, Book, Layout, ShoppingBag, Star } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Admin Dashboard</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/books" className="nav-link">
              <Book size={20} />
              <span>Books List</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/hero" className="nav-link">
              <Layout size={20} />
              <span>Hero Section</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-link">
              <ShoppingBag size={20} />
              <span>Orders</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/new-arrivals" className="nav-link">
              <Star size={20} />
              <span>New Arrivals</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;