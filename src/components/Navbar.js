import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';
import { FaShoppingCart, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaHeart, FaBoxOpen } from 'react-icons/fa';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const { items } = useCartStore();
  const { user } = useUserStore();

  const greetingName = user.name || username;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-white text-lg font-bold">ShopZone</Link>
        <div className="flex space-x-4">
          <Link to="/wishlist" className="text-white flex items-center">
            <FaHeart className="mr-1" />
          </Link>
          <Link to="/cart" className="text-white flex items-center">
            <FaShoppingCart className="mr-1" />
            {items.length > 0 && <span className="ml-1 text-sm">({items.length})</span>}
          </Link>
          {isAuthenticated() ? (
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">Hello, <span className="text-indigo-400">{greetingName}</span></span>
              <Link to="/profile" className="text-white flex items-center">
                <FaUser className="mr-1" />
              </Link>
              <Link to="/orders" className="text-white flex items-center">
                <FaBoxOpen className="mr-1" />
              </Link>
              <button onClick={handleLogout} className="text-white flex items-center">
                <FaSignOutAlt className="mr-1" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-white flex items-center">
                <FaSignInAlt className="mr-1" />
              </Link>
              <Link to="/register" className="text-white flex items-center">
                <FaUserPlus className="mr-1" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;