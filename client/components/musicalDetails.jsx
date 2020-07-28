import React from 'react';
import TopNav from './topNav';
import BottomNav from './bottomNav';
import ScrollingBar from './scrollingBar';
import CollectionCard from './collection-card';

export default class MusicalDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      readMoreOpen: false,
      addCollectionOpen: false,
      newCollectionButton: false,
      musicVisible: false
    };
    this.changePlotView = this.changePlotView.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleAddCollection = this.handleAddCollection.bind(this);
    this.handleCollectionClick = this.handleCollectionClick.bind(this);
    this.addToCollection = this.addToCollection.bind(this);
    this.openButtonModal = this.openButtonModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.viewMusic = this.viewMusic.bind(this);
  }

  changePlotView() {
    this.setState(state => ({
      readMoreOpen: !state.readMoreOpen
    }));
  }

  handleLike() {
    if (this.props.musical.like) {
      this.props.deleteLike(this.props.musical.musicalId);
    } else if (this.props.musical.like === null) {
      this.props.addLike(this.props.musical.musicalId);
    }
  }

  handleAddCollection() {
    this.setState({
      addCollectionOpen: true,
      newCollectionButton: false
    }, () => this.props.getAllCollections(false));
  }

  addToCollection(musicalId, collectionName, numMusicals) {
    const obj = {
      collectionName,
      numMusicals
    };
    fetch(`/api/collections/${musicalId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then(res => res.json())
      .then(data => {
        this.closeModal();
      });
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  closeModal() {
    this.setState({
      addCollectionOpen: false
    });
  }

  openButtonModal() {
    this.setState({
      newCollectionButton: true
    });
  }

  handleReset(event) {
    event.preventDefault();
    this.setState({
      newCollectionButton: false
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.addToCollection(this.props.musical.musicalId, this.state.value, 'n/a');
  }

  handleCollectionClick(collection) {
    this.addToCollection(this.props.musical.musicalId, collection.name, collection.numMusicals);
  }

  viewMusic() {
    this.setState(state => ({
      musicVisible: !state.musicVisible
    }));
  }

  render() {
    if (this.props.musical.title) {
      const plot = this.state.readMoreOpen ? this.props.musical.plot
        : `${this.props.musical.plot.substring(0, 100)}...`;
      const musicAndLyrics = this.props.musical.lyricsBy === this.props.musical.musicBy || this.props.musical.lyricsBy.includes(this.props.musical.musicBy)
        ? this.props.musical.lyricsBy
        : this.props.musical.musicBy.includes(this.props.musical.lyricsBy)
          ? this.props.musical.musicBy
          : this.props.musical.musicBy + ', ' + this.props.musical.lyricsBy;
      const likeClass = this.props.musical.like ? 'like' : '';
      const musicUrl = this.props.musical.musicUrl.replace('https://music.apple.com/', 'https://embed.music.apple.com/');
      const newCollectionVisible = !this.state.newCollectionButton ? 'hidden' : '';
      const musicVisible = !this.state.musicVisible ? 'hidden' : '';
      if (this.state.readMoreOpen && this.state.addCollectionOpen) {
        return (
          <div>
            <TopNav />
            <div className="musical-details-container">
              <div className="info-container">
                <img className="details-image" src={this.props.musical.imageUrl} alt="" />
                <div className="details-text">
                  <h2>{this.props.musical.title}</h2>
                  <h5>{musicAndLyrics}</h5>
                  <div className="icon-group">
                    <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
                  </div>
                  <div className="add-collection" onClick={this.handleAddCollection}>
                    <i className="fas fa-plus fa-lg"></i>
                    <h5>Add to collection</h5>
                  </div>
                </div>
              </div>
              <p className="plot" onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
              <div className="music-button-container">
                <button className="play-music" onClick={this.viewMusic}>Listen on Apple Music</button>
                <iframe className={`${musicVisible}`} allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src={musicUrl}></iframe>
              </div>
              <ScrollingBar getMusicalDetails={this.props.getMusicalDetails} list={this.props.related} header="Related" />
              <BottomNav />
              <div className="modal-overlay">
                <div className="modal-background">
                  <i id="closeModalButton" className="fas fa-times" onClick={this.closeModal}></i>
                  <h3>Add to Collections</h3>
                  <div className="center">
                    <button className="filter-button add-to-collection-button" onClick={this.openButtonModal}>New Collection</button>
                  </div>
                  {
                    this.props.collections.map(collection => {
                      return <CollectionCard noLink={true} callback={this.handleCollectionClick} key={collection.collectionId} collection={collection} viewModal={false} />;
                    })
                  }
                </div>
              </div>
              <div className={`modal-overlay button-modal ${newCollectionVisible}`}>
                <div className="button-modal-content">
                  <h2>New Collection</h2>
                  <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
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
      } else if (this.state.readMoreOpen && !this.state.addCollectionOpen) {
        return (
          <div>
            <TopNav />
            <div className="musical-details-container">
              <div className="info-container">
                <img className="details-image" src={this.props.musical.imageUrl} alt="" />
                <div className="details-text">
                  <h2>{this.props.musical.title}</h2>
                  <h5>{musicAndLyrics}</h5>
                  <div className="icon-group">
                    <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
                  </div>
                  <div className="add-collection" onClick={this.handleAddCollection}>
                    <i className="fas fa-plus fa-lg"></i>
                    <h5>Add to collection</h5>
                  </div>
                </div>
              </div>
              <p className="plot" onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
              <div className="music-button-container">
                <button className="play-music" onClick={this.viewMusic}>Listen on Apple Music</button>
                <iframe className={`${musicVisible}`} allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src={musicUrl}></iframe>
              </div>
              <ScrollingBar getMusicalDetails={this.props.getMusicalDetails} list={this.props.related} header="Related" />
              <BottomNav />
            </div>
          </div>
        );
      } else if (!this.state.readMoreOpen && !this.state.addCollectionOpen) {
        return (
          <div>
            <TopNav />
            <div className="musical-details-container">
              <div className="info-container">
                <img className="details-image" src={this.props.musical.imageUrl} alt="" />
                <div className="details-text">
                  <h2>{this.props.musical.title}</h2>
                  <h5>{musicAndLyrics}</h5>
                  <div className="icon-group">
                    <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
                  </div>
                  <div className="add-collection" onClick={this.handleAddCollection}>
                    <i className="fas fa-plus fa-lg"></i>
                    <h5>Add to collection</h5>
                  </div>
                </div>
              </div>
              <p className="plot" onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
              <div className="music-button-container">
                <button className="play-music" onClick={this.viewMusic}>Listen on Apple Music</button>
                <iframe className={`${musicVisible}`} allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src={musicUrl}></iframe>
              </div>
              <ScrollingBar getMusicalDetails={this.props.getMusicalDetails} list={this.props.related} header="Related" />
            </div>
            <BottomNav />
          </div>
        );
      } else if (!this.state.readMoreOpen && this.state.addCollectionOpen) {
        return (
          <div>
            <TopNav />
            <div className="musical-details-container">
              <div className="info-container">
                <img className="details-image" src={this.props.musical.imageUrl} alt="" />
                <div className="details-text">
                  <h2>{this.props.musical.title}</h2>
                  <h5>{musicAndLyrics}</h5>
                  <div className="icon-group">
                    <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
                  </div>
                  <div className="add-collection" onClick={this.handleAddCollection}>
                    <i className="fas fa-plus fa-lg"></i>
                    <h5>Add to collection</h5>
                  </div>
                </div>
              </div>
              <p className="plot" onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
              <div className="music-button-container">

                <button className="play-music" onClick={this.viewMusic}>Listen on Apple Music</button>
                <iframe className={`${musicVisible}`} allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src={musicUrl}></iframe>
              </div>
              <ScrollingBar getMusicalDetails={this.props.getMusicalDetails} list={this.props.related} header="Related" />
            </div>
            <BottomNav />
            <div className="modal-overlay">
              <div className="modal-background">
                <i id="closeModalButton" className="fas fa-times" onClick={this.closeModal}></i>
                <h3>Add to Collections</h3>
                <div className="center">
                  <button className="filter-button add-to-collection-button" onClick={this.openButtonModal}>New Collection</button>
                </div>
                {
                  this.props.collections.map(collection => {
                    return <CollectionCard noLink={true} callback={this.handleCollectionClick} key={collection.collectionId} collection={collection} />;
                  })
                }
              </div>
            </div>
            <div className={`modal-overlay button-modal ${newCollectionVisible}`}>
              <div className="button-modal-content">
                <h2>New Collection</h2>
                <form onSubmit={this.handleSubmit}>
                  <input type="text" className="add-collection-input" placeholder="Collection Name" value={this.state.value} onChange={this.handleChange} />
                  <div className="button-group collection">
                    <button className="reset filter-button" onClick={this.handleReset}>Cancel</button>
                    <button className="submit filter-button" type="submit">Confirm</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return null;
    }
  }
}
