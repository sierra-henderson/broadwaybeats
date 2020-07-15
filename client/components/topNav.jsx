import React from 'react';

export default class TopNav extends React.Component {
  render() {
    return (
      <div className="top-nav">
        <div className="top-nav-container">
          <div className="brand" onClick={this.props.getAllRecommendations}>
            <img src="/images/mask.svg" alt="" />
            <h3 className="logo nav-logo">Broadway Beats</h3>
          </div>
          <h3 className="nav-options" onClick={() => this.props.setView('search', {})}>Search</h3>
          <h3 className="nav-options" onClick={() => this.props.getAllCollections(true)}>My Collections</h3>
          <h3 className="nav-options" onClick={() => this.props.setView('suggestion', {})}>Suggest a Musical</h3>
        </div>
      </div>
    );
  }
}
