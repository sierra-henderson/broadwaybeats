import React from 'react';
import BoxedCard from './boxed-card';

export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      musicals: null,
      value: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.queryDatabase = this.queryDatabase.bind(this);
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

  render() {
    if (this.state.musicals === null) {
      return (
        <div>
          <div className="search-and-filter">
            <input type="text" name="" id="searchBar" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
            <button id="filterButton">Filter</button>
          </div>
          <div className="search-results">
            <h3>Please search using the search bar or filter button.</h3>
          </div>
        </div>
      );
    } else if (this.state.musicals.length === 0) {
      return (
        <div>
          <div className="search-and-filter">
            <input type="text" name="" id="searchBar" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
            <button id="filterButton">Filter</button>
          </div>
          <div className="search-results">
            <h3>There are no musicals that match your query.</h3>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="search-and-filter">
            <input type="text" name="" id="searchBar" placeholder="seach by title" value={this.state.value} onChange={this.handleChange} />
            <button id="filterButton">Filter</button>
          </div>
          <div className="search-results">
            {
              this.state.musicals.map(musical => {
                return <BoxedCard key={musical.musicalId} musical={musical} />;
              })
            }
          </div>
        </div>
      );
    }

  }
}
