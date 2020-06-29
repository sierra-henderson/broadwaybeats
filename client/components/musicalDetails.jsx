import React from 'react';
import BottomNav from './bottomNav';
import ScrollingBar from './scrollingBar';

export default class MusicalDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readMoreOpen: false
    };
    this.changePlotView = this.changePlotView.bind(this);
    this.handleLike = this.handleLike.bind(this);
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

  render() {
    const plot = this.state.readMoreOpen ? this.props.musical.plot
      : this.props.musical.plot.substring(0, 100) + '...';
    const musicAndLyrics = this.props.musical.lyricsBy === this.props.musical.musicBy || this.props.musical.lyricsBy.includes(this.props.musical.musicBy)
      ? this.props.musical.lyricsBy
      : this.props.musical.musicBy.includes(this.props.musical.lyricsBy)
        ? this.props.musical.musicBy
        : this.props.musical.musicBy + ', ' + this.props.musical.lyricsBy;
    const likeClass = this.props.musical.like ? 'like' : '';
    const dislikeClass = this.props.musical.like === false ? 'dislike' : '';
    const musicUrl = this.props.musical.musicUrl.replace('https://music.apple.com/', 'https://embed.music.apple.com/');
    if (this.state.readMoreOpen) {
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
          <ScrollingBar setView={this.props.setView} related={this.props.related} />
          <BottomNav setView={this.props.setView} />
        </div>
      );
    } else {
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
            <p onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
          </div>
          <div className="music-button-container">
            <button className="play-music">Listen on Apple Music</button>
            <iframe allow="autoplay *; encrypted-media *;" frameBorder="0" height="450"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src={musicUrl}></iframe>
          </div>
          <ScrollingBar setView={this.props.setView} related={this.props.related}/>
          <BottomNav setView={this.props.setView} />
        </div>
      );
    }
  }
}
