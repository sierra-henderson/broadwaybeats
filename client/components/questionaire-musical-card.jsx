import React from 'react';

export default class QuestionaireMusicalCard extends React.Component {
  render() {
    if (this.props.isChecked) {
      return (
        <div className="musical-questionaire-card overlay" onClick={() => this.props.recordData(this.props.musical.musicalId, 'likedMusical', this.props.isChecked)}>
          <img src={this.props.musical.imageUrl} alt="" />
        </div>
      );
    } else {
      return (
        <div className="musical-questionaire-card" onClick={() => this.props.recordData(this.props.musical.musicalId, 'likedMusical', this.props.isChecked)}>
          <img src={this.props.musical.imageUrl} alt="" />
        </div>
      );
    }
  }
}
