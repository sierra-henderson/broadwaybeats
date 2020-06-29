import React from 'react';

export default class Recommendation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };
  }

  nextMusical(type, id) {
    if (this.state.index === this.props.musicals.length - 1) {
      this.props.getAllRecommendations();
    } else {
      if (type === 'like') {
        this.props.addLike(id);
      }
      this.setState(state => ({
        index: state.index + 1
      }));
    }
  }

  render() {
    // console.log(this.state.index);
    // console.log(this.props.musicals[this.state.index]);
    return (
      <div className="main-background column-center">
        <img className="recommendation-image" src={this.props.musicals[this.state.index].imageUrl} alt=""/>
        <h1>{this.props.musicals[this.state.index].title}</h1>
        <div className="big-icon-group">
          <i className="fas fa-times faded-dislike"></i>
          <i className="fas fa-heart faded-like" onClick={() => this.nextMusical('like', this.props.musicals[this.state.index].musicalId)}></i>
        </div>
        <p className="faded-text" onClick={() => this.nextMusical('neither', 'n/a')}>I have no opinion on this musical</p>
      </div>
    );
  }
}
