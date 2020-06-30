import React from 'react';
import BottomNav from './bottomNav';
import ScrollingBar from './scrollingBar';
import CollectionCard from './collection-card';

export default class MusicalDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readMoreOpen: false,
      addCollectionOpen: false
    };
    this.changePlotView = this.changePlotView.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleAddCollection = this.handleAddCollection.bind(this);
    this.closeModal = this.closeModal.bind(this);
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
      addCollectionOpen: true
    }, () => this.props.getAllCollections(false));
  }

  closeModal() {
    this.setState({
      addCollectionOpen: false
    });
  }

  render() {
    const plot = this.state.readMoreOpen ? this.props.musical.plot
      : `${this.props.musical.plot.substring(0, 100)}...`;
    const musicAndLyrics = this.props.musical.lyricsBy === this.props.musical.musicBy || this.props.musical.lyricsBy.includes(this.props.musical.musicBy)
      ? this.props.musical.lyricsBy
      : this.props.musical.musicBy.includes(this.props.musical.lyricsBy)
        ? this.props.musical.musicBy
        : this.props.musical.musicBy + ', ' + this.props.musical.lyricsBy;
    const likeClass = this.props.musical.like ? 'like' : '';
    const dislikeClass = this.props.musical.like === false ? 'dislike' : '';
    const musicUrl = this.props.musical.musicUrl.replace('https://music.apple.com/', 'https://embed.music.apple.com/');
    if (this.state.readMoreOpen && this.state.addCollectionOpen) {
      return (
        <div>
          <div className="info-container">
            <img className="details-image" src={this.props.musical.imageUrl} alt="" />
            <h2>{this.props.musical.title}</h2>
            <h5>{musicAndLyrics}</h5>
            <div className="icon-group">
              <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
              <i className={`fas fa-times ${dislikeClass}`}></i>
            </div>
            <div className="add-collection">
              <i className="fas fa-plus fa-lg"></i>
              <h5>Add to collection</h5>
            </div>
            <p onClick={this.changePlotView}>{plot}<span className="faded-text">Read Less</span></p>
          </div>
          <div className="music-button-container">
            <button className="play-music">Listen on Apple Music</button>
            <iframe allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
              style="width:100%;max-width:660px;overflow:hidden;background:transparent;"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src={musicUrl}></iframe>
          </div>
          <ScrollingBar setView={this.props.setView} list={this.props.related} header="Related"/>
          <BottomNav getAllRecommendations={this.props.getAllRecommendations} setView={this.props.setView} />
          <div className="modal-overlay">
            <div className="modal-background">
              <i id="closeModalButton" className="fas fa-times" onClick={this.closeModal}></i>
              <h3>Add to Collections</h3>
              <div className="center">
                <button className="filter-button add-to-collection-button">New Collection</button>
              </div>
              {
                this.props.collections.map(collection => {
                  return <CollectionCard key={collection.collectionId} collection={collection} />;
                })
              }
            </div>
          </div>
        </div>
      );
    } else if (this.state.readMoreOpen && !this.state.addCollectionOpen) {
      return (
        <div>
          <div className="info-container">
            <img className="details-image" src={this.props.musical.imageUrl} alt="" />
            <h2>{this.props.musical.title}</h2>
            <h5>{musicAndLyrics}</h5>
            <div className="icon-group">
              <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
              <i className={`fas fa-times ${dislikeClass}`}></i>
            </div>
            <div className="add-collection" onClick={this.handleAddCollection}>
              <i className="fas fa-plus fa-lg"></i>
              <h5>Add to collection</h5>
            </div>
            <p onClick={this.changePlotView}>{plot}<span className="faded-text">Read Less</span></p>
          </div>
          <div className="music-button-container">
            <button className="play-music">Listen on Apple Music</button>
            <iframe allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src={musicUrl}></iframe>
          </div>
          <ScrollingBar setView={this.props.setView} list={this.props.related} header="Related" />
          <BottomNav getAllRecommendations={this.props.getAllRecommendations} setView={this.props.setView} />
        </div>
      );
    } else if (!this.state.readMoreOpen && !this.state.addCollectionOpen) {
      return (
        <div>
          <div className="musical-details-container">
            <div className="info-container">
              <img className="details-image" src={this.props.musical.imageUrl} alt="" />
              <h2>{this.props.musical.title}</h2>
              <h5>{musicAndLyrics}</h5>
              <div className="icon-group">
                <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
                <i className={`fas fa-times ${dislikeClass}`}></i>
              </div>
              <div className="add-collection" onClick={this.handleAddCollection}>
                <i className="fas fa-plus fa-lg"></i>
                <h5>Add to collection</h5>
              </div>
              <p onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
            </div>
            <div className="music-button-container">
              <button className="play-music">Listen on Apple Music</button>
              <iframe allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                src={musicUrl}></iframe>
            </div>
            <ScrollingBar setView={this.props.setView} list={this.props.related} header="Related" />
          </div>
          <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
        </div>
      );
    } else if (!this.state.readMoreOpen && this.state.addCollectionOpen) {
      return (
        <div>
          <div className="musical-details-container">
            <div className="info-container">
              <img className="details-image" src={this.props.musical.imageUrl} alt="" />
              <h2>{this.props.musical.title}</h2>
              <h5>{musicAndLyrics}</h5>
              <div className="icon-group">
                <i className={`fas fa-heart ${likeClass}`} onClick={this.handleLike}></i>
                <i className={`fas fa-times ${dislikeClass}`}></i>
              </div>
              <div className="add-collection">
                <i className="fas fa-plus fa-lg"></i>
                <h5>Add to collection</h5>
              </div>
              <p onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
            </div>
            <div className="music-button-container">
              <button className="play-music">Listen on Apple Music</button>
              <iframe allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                src={musicUrl}></iframe>
            </div>
            <ScrollingBar setView={this.props.setView} list={this.props.related} header="Related" />
          </div>
          <BottomNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
          <div className="modal-overlay">
            <div className="modal-background">
              <i id="closeModalButton" className="fas fa-times" onClick={this.closeModal}></i>
              <h3>Add to Collections</h3>
              <div className="center">
                <button className="filter-button add-to-collection-button">New Collection</button>
              </div>
              {
                this.props.collections.map(collection => {
                  return <CollectionCard key={collection.collectionId} collection={collection} />;
                })
              }
            </div>
          </div>
        </div>
      );
    }
  }
}
