import React from 'react';
import BottomNav from './bottomNav';
import ScrollingBar from './scrollingBar';

export default class Home extends React.Component {
  render() {
    return (
      <div>
        <div className="home-container">
          <ScrollingBar setView={this.props.setView} list={this.props.musicalList.recommendations} header="Your Recommendations" />
          {
            this.props.musicalList.categories.map((el, i) => {
              return <ScrollingBar key={i} setView={this.props.setView} list={el} header={`${el[0].name} Musicals`} />;
            })
          }
          {
            this.props.musicalList.related.map((el, i) => {
              return <ScrollingBar key={i + 2} setView={this.props.setView} list={el} header={`Because you liked ${el[0].relatedTo}`} />;
            })
          }
        </div>
        <BottomNav getAllRecommendations={this.props.getAllRecommendations} setView={this.props.setView} />
      </div>
    );
  }
}
