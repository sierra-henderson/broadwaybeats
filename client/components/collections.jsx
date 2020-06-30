import React from 'react';
import BottomNav from './bottomNav';
import CollectionCard from './collection-card';
import CollectionItem from './collectionItem';

export default class Collections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collectionOpen: false,
      activeCollection: []
    };
    this.openCollection = this.openCollection.bind(this);
    this.backToCollections = this.backToCollections.bind(this);
  }

  openCollection(collection) {
    fetch(`/api/collections/${collection.collectionId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          collectionOpen: true,
          activeCollection: data
        });
      });
  }

  backToCollections() {
    this.setState({
      collectionOpen: false
    });
  }

  render() {
    if (this.state.collectionOpen) {
      return (
        <div className="collections-container">
          <h1>{this.state.activeCollection[0].collectionName}</h1>
          {
            this.state.activeCollection.map(item => {
              return <CollectionItem key={item.musicalId} item={item} setView={this.props.setView}/>;
            })
          }
          <button className="filter-button submit" onClick={this.backToCollections}><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
          <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
        </div>
      );
    } else {
      return (
        <div className="collections-container">
          <h1>My Collections</h1>
          {
            this.props.collections.map(collection => {
              return <CollectionCard key={collection.collectionId} collection={collection} callback={this.openCollection} />;
            })
          }
          <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
        </div>
      );
    }
  }
}
