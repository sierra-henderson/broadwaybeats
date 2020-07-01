import React from 'react';

export default class CollectionItem extends React.Component {
  constructor(props) {
    super(props);
    this.getDetails = this.getDetails.bind(this);
  }

  getDetails() {
    fetch(`/api/musicals/${this.props.item.musicalId}`)
      .then(res => res.json())
      .then(data => {
        return fetch(`/api/musicals/${this.props.item.musicalId}/related`)
          .then(res => res.json())
          .then(related => {
            this.props.setView('details', data, related);
          });
      });
  }

  render() {
    const musicAndLyrics = this.props.item.lyricsBy === this.props.item.musicBy || this.props.item.lyricsBy.includes(this.props.item.musicBy)
      ? this.props.item.lyricsBy
      : this.props.item.musicBy.includes(this.props.item.lyricsBy)
        ? this.props.item.musicBy
        : this.props.item.musicBy + ', ' + this.props.item.lyricsBy;
    return (
      <div className="collection-card-container">
        <img src={this.props.item.imageUrl} alt="" className="rounded-image collection-item-image" onClick={this.getDetails}/>
        <div className="collection-card-text">
          <h4>{this.props.item.title}</h4>
          <p className="collection-item-paragraph">{musicAndLyrics}</p>
          <i className="fas fa-trash fa-lg" onClick={() => this.props.deleteMusicalFromCollection(this.props.item.musicalId)}></i>
        </div>
      </div>
    );
  }
}
