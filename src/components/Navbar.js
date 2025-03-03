import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Document Portal</div>
      <ul className="nav-links">
        <li><Link to="/">Documents</Link></li>
        <li><Link to="/meetings">Meetings</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar; 