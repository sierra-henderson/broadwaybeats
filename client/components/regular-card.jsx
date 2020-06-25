import React from 'react';

export default class RegularCard extends React.Component {
  constructor(props) {
    super(props);
    this.getDetails = this.getDetails.bind(this);
  }

  getDetails() {
    fetch(`/api/musicals/${this.props.musical.musicalId}`)
      .then(res => res.json())
      .then(data => {
        return fetch(`/api/musicals/${this.props.musical.musicalId}/related`)
          .then(res => res.json())
          .then(related => {
            this.props.setView('details', data, related);
          });
      });
  }

  render() {
    // const musicalTitle = this.props.musical.title.length > 15 ? this.props.musical.title.substring(0, 14) + '...' : this.props.musical.title;
    return (
      <div className="unboxed" onClick={this.getDetails}>
        <img className="card-image unboxed" src={this.props.musical.imageUrl} alt="" />
        <h4>{this.props.musical.title}</h4>
      </div>
    );
  }
}
