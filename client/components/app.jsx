import React from 'react';
import Search from './search';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'search'
    };
    this.setView = this.setView.bind(this);
  }

  setView(view) {
    this.setState({
      view: view
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
      ? <Search setView={this.setView} />
      : <h1>TBD</h1>;
    return (appView);
  }
}
