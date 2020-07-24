import React from 'react';
import TopNav from './topNav';
import BottomNav from './bottomNav';
import ScrollingBar from './scrollingBar';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      musicals: {}
    };
  }

  componentDidMount() {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => this.setState({ musicals: data }));
  }

  render() {
    if (this.state.musicals.recommendations) {
      return (
        <div>
          <TopNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
          <div className="home-container">
            <ScrollingBar setView={this.props.setView} list={this.state.musicals.recommendations} header="Your Recommendations" />
            {
              this.state.musicals.categories.map((el, i) => {
                return <ScrollingBar key={i} setView={this.props.setView} list={el} header={`${el[0].name} Musicals`} />;
              })
            }
            {
              this.state.musicals.related.map((el, i) => {
                return <ScrollingBar key={i + 2} setView={this.props.setView} list={el} header={`Because you liked ${el[0].relatedTo}`} />;
              })
            }
          </div>
          <BottomNav getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} setView={this.props.setView} />
        </div>
      );
    } else {
      return <div>Not Done</div>;
    }

  }
}
