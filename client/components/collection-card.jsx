import React from 'react';

export default class CollectionCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.handleModalClick = this.handleModalClick.bind(this);
  }

  toggleModal() {
    this.setState(state => ({
      modalOpen: !state.modalOpen
    }));
  }

  handleModalClick(mode) {
    this.setState({
      modalOpen: false
    }, this.props.openButtonModal(mode, this.props.collection));
  }

  render() {
    const collectionName = this.props.collection.name.length > 45
      ? this.props.collection.name.substring(0, 44) + '...'
      : this.props.collection.name;
    const numAlbums = this.props.collection.numMusicals === 1
      ? `${this.props.collection.numMusicals} album`
      : `${this.props.collection.numMusicals} albums`;
    const hiddenOrNot = !this.state.modalOpen ? 'hidden' : '';
    const updateDeleteAbility = !this.props.viewModal ? 'hidden' : '';
    return (
      <div className="flex-container">
        <div className="collection-card-container" onClick={() => this.props.callback(this.props.collection)}>
          <img className="rounded-image collection-image" src={this.props.collection.imageUrl} alt="" />
          <div className="collection-card-text">
            <h3>{collectionName}</h3>
            <p className="faded-text">{numAlbums}</p>
          </div>
        </div>
        <div className={`update-delete-modal-button ${updateDeleteAbility}`}>
          <i className="fas fa-ellipsis-v faded-text" onClick={this.toggleModal}></i>
          <div className={`update-delete-modal ${hiddenOrNot}`}>
            <div className="update-delete-modal-choice" onClick={() => this.handleModalClick('update')}>
              <i className="fas fa-pen"></i>
              <h5>Edit collection</h5>
            </div>
            <div className="update-delete-modal-choice" onClick={() => this.handleModalClick('delete')}>
              <i className="fas fa-trash"></i>
              <h5>Delete collection</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
