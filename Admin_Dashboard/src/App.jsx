import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./admin/pages/Dashboard";
import BooksList from "./admin/pages/BooksList";
import HeroSection from "./admin/pages/HeroSection";
import Orders from "./admin/pages/Orders";
import NewArrivals from "./admin/pages/NewArrivals";
import Sidebar from "./admin/components/sidebar.jsx";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<BooksList />} />
            <Route path="/hero" element={<HeroSection />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;