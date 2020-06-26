import React from 'react';

export default class Questionaire extends React.Component {
  render() {
    return (
      <div className="questionaire-container">
        <div className="percent-complete"></div>
        <div className="questionaire-initial">
          <h1>{`Welcome, ${this.props.user.username}!`}</h1>
          <p>We would like you to answer a few questions to get your taste in musicals</p>
          <button className="filter-button submit">Ready?</button>
        </div>
      </div>
    );
  }
}
