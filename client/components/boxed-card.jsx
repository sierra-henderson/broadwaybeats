import React from 'react';

export default class BoxedCard extends React.Component {
  constructor(props) {
    super(props);
    this.getDetails = this.getDetails.bind(this);
  }

  getDetails() {
    fetch(`/api/musicals/${this.props.musical.musicalId}`)
      .then(res => res.json())
      .then(data => {
        this.props.setView('details', data);
      });
  }

  render() {
    const musicalTitle = this.props.musical.title.length > 15 ? this.props.musical.title.substring(0, 14) + '...' : this.props.musical.title;
    return (
      <div className="card" onClick={this.getDetails}>
        <img className="card-image" src={this.props.musical.imageUrl} alt=""/>
        <h4>{musicalTitle}</h4>
      </div>
    );
  }
}
