import React from 'react';
import { Link } from 'react-router-dom';

export default class RegularCard extends React.Component {
  render() {
    return (
      <Link to={`/musicals/${this.props.musical.musicalId}`} onClick={() => this.props.getMusicalDetails(this.props.musical.musicalId)}>
        <div className="unboxed">
          <div className="card-box">
            <img className="card-image unboxed" src={this.props.musical.imageUrl} alt="" />
          </div>
          <h4>{this.props.musical.title}</h4>
        </div>
      </Link>
    );
  }
}
