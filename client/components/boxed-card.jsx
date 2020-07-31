import React from 'react';

export default class BoxedCard extends React.Component {
  render() {
    const musicalTitle = this.props.musical.title.length > 15 ? this.props.musical.title.substring(0, 14) + '...' : this.props.musical.title;
    return (
      <div className="card">
        <div className="card-image">
          <img src={this.props.musical.imageUrl} alt="" />
        </div>
        <h4>{musicalTitle}</h4>
      </div>
    );
  }
}
