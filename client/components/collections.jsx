import React from 'react';
import BottomNav from './bottomNav';
import CollectionCard from './collection-card';

export default class Collections extends React.Component {
  render() {
    return (
      <div className="collections-container">
        <h1>My Collections</h1>
        {
          this.props.collections.map(collection => {
            return <CollectionCard key={collection.collectionId} collection={collection}/>;
          })
        }
        <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections}/>
      </div>
    );
  }
}
