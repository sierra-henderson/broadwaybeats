import React from 'react';

export default class QuestionaireMusicalCard extends React.Component {
  render() {
    if (this.props.isChecked) {
      return (
        <div className="musical-questionaire-card overlay" onClick={() => this.props.recordData(this.props.musical.musicalId, 'likedMusical', this.props.isChecked)}>
          <img src="https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/1d/dd/bd/1dddbd66-fedb-1d86-b550-f23d92f6fc37/075679872791.jpg/1000x1000bb.jpeg" alt="" />
        </div>
      );
    } else {
      return (
        <div className="musical-questionaire-card" onClick={() => this.props.recordData(this.props.musical.musicalId, 'likedMusical', this.props.isChecked)}>
          <img src="https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/1d/dd/bd/1dddbd66-fedb-1d86-b550-f23d92f6fc37/075679872791.jpg/1000x1000bb.jpeg" alt="" />
        </div>
      );
    }
  }
}
