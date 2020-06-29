import React from 'react';
import RegularCard from './regular-card';

export default class ScrollingBar extends React.Component {
  render() {
    return (
      <div>
        <h3 className="related">{this.props.header}</h3>
        <div className="scroll-bar">
          {
            this.props.list.map(musical => {
              return <RegularCard setView={this.props.setView} key={musical.musicalId} musical={musical} />;
            })
          }
        </div>
      </div>
    );
  }
}
