import React from 'react';
import BoxedCard from './boxed-card';
import TopNav from './topNav';
import BottomNav from './bottomNav';
import Filter from './filter';
import { Link } from 'react-router-dom';

export default class Search extends React.Component {
  constructor(props, match) {
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
    if (event.target.value !== '.' && event.target.value !== '\\' && event.target.value !== '/' && event.target.value !== '#') {
      this.setState({
        value: event.target.value
      }, this.queryDatabase);
    }
  }

  queryDatabase() {
    if (this.state.value === '' || this.state.value === ' ' || this.state.value === '.' || this.state.value === '#' || this.state.value === '/' || this.state.value === '\\') {
      this.setState({
        musicals: null
      });
    } else {
      const query = this.state.value.startsWith(' ') ? this.state.value.substring(1) : this.state.value;
      fetch(`/api/search/${query}`)
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
            <TopNav />
            <div className="search-and-filter">
              <input type="text" name="" className="input-rounded" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
              <button id="filterButton" onClick={this.toggleFilter}>Filter</button>
            </div>
            <div className="search-results">
              <h3>Please search using the search bar or filter button.</h3>
            </div>
            <BottomNav />
          </div>
        );
      } else if (this.state.musicals.length === 0) {
        return (
          <div>
            <TopNav />
            <div className="search-and-filter">
              <input type="text" name="" className="input-rounded" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
              <button id="filterButton" onClick={this.toggleFilter}>Filter</button>
            </div>
            <div className="search-results">
              <h3>There are no musicals that match your query.</h3>
            </div>
            <BottomNav />
          </div>
        );
      } else {
        return (
          <div className="search">
            <TopNav />
            <div className="search-and-filter">
              <input className="input-rounded" type="text" name="" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
              <button id="filterButton" onClick={this.toggleFilter}>Filter</button>
            </div>
            <div className="boxed-cards-container">
              {
                this.state.musicals.map(musical => {
                  return (
                    <Link to={`/musicals/${musical.musicalId}`} key={musical.musicalId} onClick={() => this.props.getMusicalDetails(musical.musicalId)}>
                      <BoxedCard musical={musical} />
                    </Link>
                  );
                })
              }
            </div>
            <BottomNav />
          </div>
        );
      }
    }
  }
}
