import React from 'react';
import { Link } from 'react-router-dom';

export default class TopNav extends React.Component {
  render() {
    return (
      <div className="top-nav">
        <div className="top-nav-container">
          <Link to="/">
            <div className="brand">
              <img src="/images/mask.svg" alt="" />
              <h3 className="logo nav-logo">Broadway Beats</h3>
            </div>
          </Link>
          <Link to="/search">
            <h3 className="nav-options">Search</h3>
          </Link>
          <Link to="/collections">
            <h3 className="nav-options">My Collections</h3>
          </Link>
          <Link to="/suggestion">
            <h3 className="nav-options">Suggest a Musical</h3>
          </Link>
        </div>
      </div>
    );
  }
}
