import React from 'react';

export default class QuestionaireCard extends React.Component {
  render() {
    if (this.props.isChecked) {
      return (
        <div className="card" onClick={() => this.props.recordData(this.props.card.id, this.props.card.category, this.props.isChecked)}>
          <div className="overlay">
            <img className="card-image" src={this.props.card.image} alt="" />
            <h4>{this.props.card.name}</h4>
          </div>
        </div>
      );
    } else {
      return (
        <div className="card" onClick={() => this.props.recordData(this.props.card.id, this.props.card.category, this.props.isChecked)}>
          <img className="card-image" src={this.props.card.image} alt="" />
          <h4>{this.props.card.name}</h4>
        </div>
      );
    }
  }
}
