import React from 'react';
import FilterButton from './filterButton';

export default class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: [],
      genre: [],
      musicalStyle: [],
      numResults: null
    };
    this.addFilter = this.addFilter.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  addFilter(id, category, add) {
    if (add) {
      this.setState({
        [category]: this.state[category].concat([id])
      });
    } else {
      this.setState({
        [category]: this.state[category].filter(el => el !== id)
      });
    }
  }

  handleReset() {
    this.setState({
      genre: [],
      musicalStyle: [],
      tag: []
    });
  }

  handleSubmit() {
    if (this.state.genre.length > 0 && this.state.musicalStyle.length > 0 && this.state.tag.length > 0) {
      fetch(`/api/filter/${this.state.tag.join(',')}/${this.state.genre.join(',')}/${this.state.musicalStyle.join(',')}`)
        .then(res => res.json())
        .then(data => {
          this.props.filterResults(data);
          this.setState({
            numResults: data.length
          }, () => {
            if (this.state.numResults > 0) {
              this.props.toggleFilter();
            }
          });
        });
    }
  }

  render() {
    const resultsDisplay = this.state.numResults === null ? 'Please select at least one option from each category'
      : this.state.numResults === 0 ? 'There are no results matching your query. Try removing some filters'
        : `${this.state.numResults} results`;
    const genreArr = [
      { id: 7, name: 'Comedy' },
      { id: 10, name: 'Drama' },
      { id: 20, name: 'Period/Historical' },
      { id: 4, name: 'Adventure' },
      { id: 14, name: 'Family' },
      { id: 15, name: 'Fantasy' },
      { id: 18, name: 'Mystery/Thriller' },
      { id: 23, name: 'Romance' },
      { id: 22, name: 'Revue' }
    ];
    const musicalStyleArr = [
      { id: 17, name: 'Pop/Rock' },
      { id: 6, name: 'Classic Broadway' },
      { id: 7, name: 'Classical/Operetta' },
      { id: 15, name: 'Jazz/Blues' },
      { id: 8, name: 'Contemporary Broadway' },
      { id: 19, name: 'World Music' },
      { id: 11, name: 'Country/Western' },
      { id: 12, name: 'Folk' },
      { id: 14, name: 'Gospel' }
    ];
    const tagArr = [
      { id: 1, name: 'Adolescence/Childhood' },
      { id: 42, name: 'Women\'s Interest' },
      { id: 39, name: 'Show Business' },
      { id: 26, name: 'Love' },
      { id: 15, name: 'Disney Shows' },
      { id: 33, name: 'Religious Themes' },
      { id: 40, name: 'Tony Award Winner' },
      { id: 23, name: 'Jewish Interest' },
      { id: 24, name: 'Latinx Interest' },
      { id: 8, name: 'Black Interest' },
      { id: 25, name: 'LGBTQ+ Interest' }
    ];
    return (
      <div className="filter-container">
        <div className="filter-header">
          <h2>Filters</h2>
        </div>
        <div className="accordion-group">
          <div className="accordion-container">
            <h3 className="accordion-text">Genre</h3>
            {
              genreArr.map(el => {
                return <FilterButton key={el.id} categoryInfo={el} category="genre" addFilter={this.addFilter}/>;
              })
            }
          </div>
          <div className="accordion-container">
            <h3 className="accordion-text">Musical Style</h3>
            {
              musicalStyleArr.map(el => {
                return <FilterButton key={el.id} categoryInfo={el} category="musicalStyle" addFilter={this.addFilter}/>;
              })
            }
          </div>
          <div className="accordion-container">
            <h3 className="accordion-text">Tags</h3>
            {
              tagArr.map(el => {
                return <FilterButton key={el.id} categoryInfo={el} category="tag" addFilter={this.addFilter}/>;
              })
            }
          </div>
        </div>
        <h4 className="results-display">{resultsDisplay}</h4>
        <div className="button-group">
          <button className="reset filter-button" onClick={this.handleReset}>Reset</button>
          <button className="submit filter-button" onClick={this.handleSubmit}>Search</button>
        </div>
      </div>
    );
  }
}
