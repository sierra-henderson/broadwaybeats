import React from 'react';
import BoxedCard from './boxed-card';
import BottomNav from './bottomNav';
import Filter from './filter';

export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      musicals: null,
      value: '',
      filter: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.queryDatabase = this.queryDatabase.bind(this);
    this.filterResults = this.filterResults.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
    this.filterResults = this.filterResults.bind(this);
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    }, this.queryDatabase);
  }

  queryDatabase() {
    if (this.state.value === '') {
      this.setState({
        musicals: null
      });
    } else {
      fetch(`/api/search/${this.state.value}`)
        .then(res => res.json())
        .then(data => {
          this.setState({
            musicals: data
          });
        });
    }
  }

  toggleFilter() {
    this.setState(state => ({
      filter: !state.filter
    }));
  }

  filterResults(data) {
    this.setState({
      musicals: data
    });
  }

  render() {
    if (this.state.filter) {
      return <Filter toggleFilter={this.toggleFilter} filterResults={this.filterResults} />;
    } else {
      if (this.state.musicals === null) {
        return (
          <div>
            <div className="search-and-filter">
              <input type="text" name="" className="input-rounded" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
              <button id="filterButton" onClick={this.toggleFilter}>Filter</button>
            </div>
            <div className="search-results">
              <h3>Please search using the search bar or filter button.</h3>
            </div>
            <BottomNav getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} setView={this.props.setView} />
          </div>
        );
      } else if (this.state.musicals.length === 0) {
        return (
          <div>
            <div className="search-and-filter">
              <input type="text" name="" className="input-rounded" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
              <button id="filterButton" onClick={this.toggleFilter}>Filter</button>
            </div>
            <div className="search-results">
              <h3>There are no musicals that match your query.</h3>
            </div>
            <BottomNav getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} setView={this.props.setView}/>
          </div>
        );
      } else {
        return (
          <div>
            <div className="search-and-filter">
              <input className="input-rounded" type="text" name="" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
              <button id="filterButton" onClick={this.toggleFilter}>Filter</button>
            </div>
            <div className="boxed-cards-container">
              {
                this.state.musicals.map(musical => {
                  return <BoxedCard setView={this.props.setView} key={musical.musicalId} musical={musical} />;
                })
              }
            </div>
            <BottomNav getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} setView={this.props.setView}/>
          </div>
        );
      }
    }
  }
}
