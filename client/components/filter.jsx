import React from 'react';
import FilterButton from './filterButton';

export default class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: {},
      genre: {},
      musicalStyle: {},
      numResults: null
    };
    this.addFilter = this.addFilter.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  addFilter(id, category, add) {
    if (!add) {
      this.setState(state => ({
        [category]: {
          ...state[category],
          [id]: true
        }
      }));
    } else {
      this.setState(state => ({
        [category]: {
          ...state[category],
          [id]: false
        }
      }));
    }
  }

  handleReset() {
    this.setState({
      genre: {},
      musicalStyle: {},
      tag: {}
    });
  }

  handleSubmit() {
    const genres = Object.keys(this.state.genre).filter(id => this.state.genre[id]);
    const musicalStyles = Object.keys(this.state.musicalStyle).filter(id => this.state.musicalStyle[id]);
    const tags = Object.keys(this.state.tag).filter(id => this.state.tag[id]);
    if (genres.length > 0 && musicalStyles.length > 0 && tags.length > 0) {
      fetch(`/api/filter/${tags.join(',')}/${genres.join(',')}/${musicalStyles.join(',')}`)
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
      { buttonId: 1, id: 7, name: 'Comedy' },
      { buttonId: 2, id: 10, name: 'Drama' },
      { buttonId: 3, id: 20, name: 'Period/Historical' },
      { buttonId: 4, id: 4, name: 'Adventure' },
      { buttonId: 5, id: 14, name: 'Family' },
      { buttonId: 6, id: 15, name: 'Fantasy' },
      { buttonId: 7, id: 18, name: 'Mystery/Thriller' },
      { buttonId: 8, id: 23, name: 'Romance' },
      { buttonId: 9, id: 22, name: 'Revue' }
    ];
    const musicalStyleArr = [
      { buttonId: 10, id: 17, name: 'Pop/Rock' },
      { buttonId: 11, id: 6, name: 'Classic Broadway' },
      { buttonId: 12, id: 7, name: 'Classical/Operetta' },
      { buttonId: 13, id: 15, name: 'Jazz/Blues' },
      { buttonId: 14, id: 8, name: 'Contemporary Broadway' },
      { buttonId: 15, id: 19, name: 'World Music' },
      { buttonId: 16, id: 11, name: 'Country/Western' },
      { buttonId: 17, id: 12, name: 'Folk' },
      { buttonId: 18, id: 14, name: 'Gospel' }
    ];
    const tagArr = [
      { buttonId: 19, id: 1, name: 'Adolescence/Childhood' },
      { buttonId: 20, id: 42, name: 'Women\'s Interest' },
      { buttonId: 21, id: 39, name: 'Show Business' },
      { buttonId: 22, id: 26, name: 'Love' },
      { buttonId: 23, id: 15, name: 'Disney Shows' },
      { buttonId: 24, id: 33, name: 'Religious Themes' },
      { buttonId: 25, id: 40, name: 'Tony Award Winner' },
      { buttonId: 26, id: 23, name: 'Jewish Interest' },
      { buttonId: 27, id: 24, name: 'Latinx Interest' },
      { buttonId: 28, id: 8, name: 'Black Interest' },
      { buttonId: 29, id: 25, name: 'LGBTQ+ Interest' }
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
                return <FilterButton key={el.buttonId} categoryInfo={el} category="genre" isChecked={this.state.genre[el.id]} addFilter={this.addFilter}/>;
              })
            }
          </div>
          <div className="accordion-container">
            <h3 className="accordion-text">Musical Style</h3>
            {
              musicalStyleArr.map(el => {
                return <FilterButton key={el.buttonId} categoryInfo={el} category="musicalStyle" isChecked={this.state.musicalStyle[el.id]} addFilter={this.addFilter}/>;
              })
            }
          </div>
          <div className="accordion-container">
            <h3 className="accordion-text">Tags</h3>
            {
              tagArr.map(el => {
                return <FilterButton key={el.buttonId} categoryInfo={el} category="tag" isChecked={this.state.tag[el.id]} addFilter={this.addFilter}/>;
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
