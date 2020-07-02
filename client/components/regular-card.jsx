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
        return fetch(`/api/musicals/${this.props.musical.musicalId}/like`)
          .then(res => res.json())
          .then(likeInfo => {
            data.like = likeInfo.like;
            return fetch(`/api/musicals/${this.props.musical.musicalId}/related`)
              .then(res => res.json())
              .then(related => {
                this.props.setView('details', data, related);
              });
          });
      });
  }

  render() {
    return (
      <div className="unboxed" onClick={this.getDetails}>
        <div className="card-box">
          <img className="card-image unboxed" src={this.props.musical.imageUrl} alt="" />
        </div>
        <h4>{this.props.musical.title}</h4>
      </div>
    );
  }
}
