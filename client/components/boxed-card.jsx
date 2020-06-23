import React from 'react';

export default class BoxedCard extends React.Component {
  render() {
    return (
      <div className="card">
        <img className="card-image" src={this.props.musical.imageUrl} alt=""/>
        <h4>{this.props.musical.title}</h4>
      </div>
    );
  }
}
