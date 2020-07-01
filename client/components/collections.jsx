import React from 'react';
import BottomNav from './bottomNav';
import CollectionCard from './collection-card';
import CollectionItem from './collectionItem';

export default class Collections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collectionOpen: false,
      activeCollection: [],
      activeCollectionName: '',
      buttonModal: {}
    };
    this.openCollection = this.openCollection.bind(this);
    this.deleteMusicalFromCollection = this.deleteMusicalFromCollection.bind(this);
    this.backToCollections = this.backToCollections.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openCollection(collection) {
    fetch(`/api/collections/${collection.collectionId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          collectionOpen: true,
          activeCollection: data,
          activeCollectionName: collection.name
        });
      });
  }

  backToCollections() {
    this.setState({
      collectionOpen: false
    }, () => this.props.getAllCollections(true));
  }

  deleteMusicalFromCollection(id) {
    const collectionId = this.state.activeCollection[0].collectionId;
    fetch(`/api/collections/${collectionId}/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        this.setState(state => ({
          activeCollection: state.activeCollection.filter(el => el.musicalId !== id)
        }));
      });
  }

  renderModal() {
    this.setState({
      modalOpen: true
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false
    });
  }

  render() {
    if (this.state.collectionOpen) {
      if (this.state.activeCollection.length > 0) {
        return (
          <div className="collections-container">
            <h1>{this.state.activeCollectionName}</h1>
            {
              this.state.activeCollection.map(item => {
                return <CollectionItem key={item.musicalId} item={item} setView={this.props.setView} deleteMusicalFromCollection={this.deleteMusicalFromCollection} />;
              })
            }
            <button className="filter-button submit" onClick={this.backToCollections}><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
            <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
          </div>
        );
      } else {
        return (
          <div className="collections-container">
            <h1>{this.state.activeCollectionName}</h1>
            <p className="no-items">You don&apos;t have any musicals in here yet!</p>
            <button className="filter-button submit" onClick={this.backToCollections}><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
          </div>
        );
      }
    } else {
      if (this.state.modalOpen) {
        return (
          <div>
            <div className="collections-container">
              <h1>My Collections</h1>
              {
                this.props.collections.map(collection => {
                  return <CollectionCard key={collection.collectionId} renderModal={this.renderModal} collection={collection} callback={this.openCollection} />;
                })
              }
              <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
            </div>
            <div className="modal-overlay">
              <div className="modal-background twenty-five">
                <i id="closeModalButton" className="fas fa-times" onClick={this.closeModal}></i>
                <div className="update-delete-modal-choice" onClick={this.openButtonModal}>
                  <i className="fas fa-pen fa-lg"></i>
                  <h3>Edit collection</h3>
                </div>
                <div className="update-delete-modal-choice" onClick={this.openButtonModal}>
                  <i className="fas fa-trash fa-lg"></i>
                  <h3>Delete collection</h3>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="collections-container">
            <h1>My Collections</h1>
            {
              this.props.collections.map(collection => {
                return <CollectionCard key={collection.collectionId} renderModal={this.renderModal} collection={collection} callback={this.openCollection} />;
              })
            }
            <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
          </div>
        );
      }

    }
  }
}
