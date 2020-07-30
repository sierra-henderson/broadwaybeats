import React from 'react';
import BottomNav from './bottomNav';
import TopNav from './topNav';

export default class PageNotFound extends React.Component {
  render() {
    return (
      <div>
        <TopNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
        <div className="error-message-container">
          <h3>Sorry for the unexpected intermission</h3>
          <img src="/images/404-error.svg" alt=""/>
          <p>There is no page found here.</p>
        </div>
        <BottomNav getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} setView={this.props.setView} />
      </div>

    );
  }
}
