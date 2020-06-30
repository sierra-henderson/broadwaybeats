import React from 'react';

export default class CollectionCard extends React.Component {
  render() {
    const collectionName = this.props.collection.name.length > 45
      ? this.props.collection.name.substring(0, 44) + '...'
      : this.props.collection.name;
    const numAlbums = this.props.collection.numMusicals === 1
      ? `${this.props.collection.numMusicals} album`
      : `${this.props.collection.numMusicals} albums`;
    return (
      <div className="collection-card-container" onClick={() => this.props.callback(this.props.collection)}>
        <img className="rounded-image collection-image" src={this.props.collection.imageUrl} alt=""/>
        <div className="collection-card-text">
          <h3>{collectionName}</h3>
          <p className="faded-text">{numAlbums}</p>
        </div>
      </div>
    );
  }
}
