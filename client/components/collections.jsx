import React from 'react';
import BottomNav from './bottomNav';
import TopNav from './topNav';
import CollectionCard from './collection-card';
import CollectionItem from './collectionItem';

export default class Collections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collections: [],
      collectionOpen: false,
      activeCollection: [],
      activeCollectionName: '',
      buttonModal: {},
      value: ''
    };
    this.openCollection = this.openCollection.bind(this);
    this.deleteMusicalFromCollection = this.deleteMusicalFromCollection.bind(this);
    this.backToCollections = this.backToCollections.bind(this);
    this.openButtonModal = this.openButtonModal.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => this.setState({
        collections: data
      }));
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

  openButtonModal(mode, collection) {
    if (mode === 'update') {
      this.setState({
        buttonModal: {
          open: true,
          mode: mode,
          activeCollection: collection
        },
        value: collection.name
      });
    } else {
      this.setState({
        buttonModal: {
          open: true,
          mode: mode,
          activeCollection: collection
        }
      });
    }
  }

  handleReset(event) {
    event.preventDefault();
    this.setState({
      buttonModal: {}
    });
  }

  handleUpdate(event) {
    event.preventDefault();
    const obj = {
      collectionName: this.state.value
    };
    fetch(`/api/collections/${this.state.buttonModal.activeCollection.collectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          buttonModal: {}
        }, this.props.getAllCollections);
      });
  }

  handleDelete() {
    fetch(`/api/collections/${this.state.buttonModal.activeCollection.collectionId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          buttonModal: {}
        }, this.props.getAllCollections);
      });
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  render() {
    if (this.state.collectionOpen) {
      if (this.state.activeCollection.length > 0) {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>{this.state.activeCollectionName}</h1>
              {
                this.state.activeCollection.map(item => {
                  return <CollectionItem key={item.musicalId} item={item} setView={this.props.setView} deleteMusicalFromCollection={this.deleteMusicalFromCollection} />;
                })
              }
              <button className="filter-button submit" onClick={this.backToCollections}><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
              <BottomNav />
            </div>
          </div>

        );
      } else {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>{this.state.activeCollectionName}</h1>
              <p className="no-items">You don&apos;t have any musicals in here yet!</p>
              <button className="filter-button submit" onClick={this.backToCollections}><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
              <BottomNav />
            </div>
          </div>
        );
      }
    } else {
      if (this.state.collections.length === 0) {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>My Collections</h1>
              <h3>You currently have no collections!</h3>
              <BottomNav />
            </div>
          </div>
        );
      } else if (this.state.buttonModal.open && this.state.buttonModal.mode === 'update') {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>My Collections</h1>
              {
                this.state.collections.map(collection => {
                  return <CollectionCard key={collection.collectionId} renderModal={this.renderModal} collection={collection} callback={this.openCollection} openButtonModal={this.openButtonModal} viewModal={true}/>;
                })
              }
              <BottomNav />
              <div className={'modal-overlay button-modal'}>
                <div className="button-modal-content">
                  <h2>Update Collection</h2>
                  <form onSubmit={this.handleUpdate} onReset={this.handleReset}>
                    <input type="text" className="add-collection-input" placeholder="Collection Name" value={this.state.value} onChange={this.handleChange} />
                    <div className="button-group collection">
                      <button className="reset filter-button" type="reset">Cancel</button>
                      <button className="submit filter-button" type="submit">Confirm</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (this.state.buttonModal.open && this.state.buttonModal.mode === 'delete') {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>My Collections</h1>
              {
                this.state.collections.map(collection => {
                  return <CollectionCard key={collection.collectionId} renderModal={this.renderModal} collection={collection} callback={this.openCollection} viewModal={true}/>;
                })
              }
              <BottomNav />
              <div className={'modal-overlay button-modal'}>
                <div className="button-modal-content">
                  <h2>Are you sure you want to delete?</h2>
                  <div className="button-group collection">
                    <button className="reset filter-button" onClick={this.handleReset}>Cancel</button>
                    <button className="submit filter-button" onClick={this.handleDelete}>Confirm</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>My Collections</h1>
              {
                this.state.collections.map(collection => {
                  return <CollectionCard key={collection.collectionId} renderModal={this.renderModal} collection={collection} callback={this.openCollection} openButtonModal={this.openButtonModal} viewModal={true} />;
                })
              }
              <BottomNav />
            </div>
          </div>
        );
      }

    }
  }
}
