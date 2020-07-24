import React from 'react';
import { Link } from 'react-router-dom';

export default class BottomNav extends React.Component {
  render() {
    return (
      <div className="bottom-nav">
        <Link to="/">
          <i className="fas fa-home fa-2x"></i>
        </Link>
        <Link to="/search">
          <i className="fas fa-search fa-2x"></i>
        </Link>
        <Link to="/collections">
          <i className="fas fa-list-ul fa-2x"></i>
        </Link>
        <Link to="/suggestion">
          <i className="fas fa-plus fa-2x"></i>
        </Link>
      </div>
    );
  }
}
