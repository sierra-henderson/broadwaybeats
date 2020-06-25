import React from 'react';
import Search from './search';
import MusicalDetails from './musicalDetails';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'search',
      params: {}
    };
    this.setView = this.setView.bind(this);
  }

  setView(view, params) {
    this.setState({
      view: view,
      params: params
    });
  }

  componentDidMount() {
    fetch('/api/health-check')
      .then(res => res.json())
      .then(data => this.setState({ message: data.message || data.error }))
      .catch(err => this.setState({ message: err.message }))
      .finally(() => this.setState({ isLoading: false }));
  }

  render() {
    const appView = this.state.view === 'search'
      ? <Search setView={this.setView}/>
      : this.state.view === 'details'
        ? <MusicalDetails setView={this.setView} musical={this.state.params}/>
        : <h1>TBD</h1>;
    return (appView);
  }
}
