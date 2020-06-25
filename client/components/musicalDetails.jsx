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
  }

  componentDidMount() {
    fetch(`/api/musicals/${this.props.musical.musicalId}/related`)
      .then(res => res.json)
      .then(data => {
        this.setState({
          related: data
        });
      });
  }

  changePlotView() {
    this.setState(state => ({
      readMoreOpen: !state.readMoreOpen
    }));
  }

  render() {
    const plot = this.state.readMoreOpen ? this.props.musical.plot
      : this.props.musical.plot.substring(0, 100) + '...';
    const musicAndLyrics = this.props.musical.lyricsBy === this.props.musical.musicBy || this.props.musical.lyricsBy.includes(this.props.musical.musicBy)
      ? this.props.musical.lyricsBy
      : this.props.musical.musicBy.includes(this.props.musical.lyricsBy)
        ? this.props.musical.musicBy
        : this.props.musical.musicBy + ', ' + this.props.musical.lyricsBy;
    if (this.state.readMoreOpen) {
      return (
        <div>
          <div className="info-container">
            <img className="details-image" src={this.props.musical.imageUrl} alt="" />
            <h2>{this.props.musical.title}</h2>
            <h5>{musicAndLyrics}</h5>
            <div className="icon-group">
              <i className="fas fa-heart like"></i>
              <i className="fas fa-times dislike"></i>
            </div>
            <div className="add-collection">
              <i className="fas fa-plus fa-lg"></i>
              <h5>Add to collection</h5>
            </div>
            <p onClick={this.changePlotView}>{plot}<span className="read-more-less">Read Less</span></p>
          </div>
          <div className="music-button-container">
            <button className="play-music">Listen on Apple Music</button>
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
              <i className="fas fa-heart like"></i>
              <i className="fas fa-times dislike"></i>
            </div>
            <div className="add-collection">
              <i className="fas fa-plus fa-lg"></i>
              <h5>Add to collection</h5>
            </div>
            <p onClick={this.changePlotView}>{plot}<span className="read-more-less">Read More</span></p>
          </div>
          <div className="music-button-container">
            <button className="play-music">Listen on Apple Music</button>
          </div>
          <ScrollingBar setView={this.props.setView} related={this.props.related}/>
          <BottomNav setView={this.props.setView} />
        </div>
      );
    }
  }
}
