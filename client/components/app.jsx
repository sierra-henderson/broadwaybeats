import React from 'react';
import Search from './search';
import MusicalDetails from './musicalDetails';
import SignIn from './signin';
import Questionaire from './questionaire';
import Recommnendation from './recommendation';
import Home from './home';
import Collections from './collections';
import Suggestion from './suggestion';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'signin',
      params: {},
      related: [],
      user: {},
      recommended: [],
      collections: []
    };
    this.setView = this.setView.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.addLike = this.addLike.bind(this);
    this.deleteLike = this.deleteLike.bind(this);
    this.getAllRecommendations = this.getAllRecommendations.bind(this);
    this.getAllCollections = this.getAllCollections.bind(this);
  }

  setView(view, params, related) {
    if (view === 'recommendation' || view === 'home') {
      this.setState({
        view: view,
        params: params,
        recommended: related
      });
    } else if (view === 'collections') {
      this.setState({
        view: view,
        params: params,
        collections: related
      });
    } else {
      this.setState({
        view: view,
        params: params,
        related: related
      });
    }
  }

  loginUser(user) {
    fetch('/api/recommendations/')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          this.setState({
            view: 'questionaire',
            user: user.username
          });
        } else {
          this.setState({
            user: user.username
          }, this.getAllRecommendations);
        }
      });
  }

  addLike(id) {
    if (id) {
      fetch(`/api/musicals/${id}/like`, {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          this.setState(state => ({
            params: {
              ...state.params,
              like: true
            }
          }));
        });
    }
  }

  deleteLike(id) {
    if (id) {
      fetch(`/api/musicals/${id}/like`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          this.setState(state => ({
            params: {
              ...state.params,
              like: data.like
            }
          }));
        });
    }
  }

  getAllRecommendations() {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => this.setView('home', {}, data));
  }

  getAllCollections(boolean) {
    if (boolean) {
      fetch('/api/collections')
        .then(res => res.json())
        .then(data => this.setView('collections', {}, data));
    } else {
      fetch('/api/collections')
        .then(res => res.json())
        .then(data => this.setState({
          collections: data
        }));
    }
  }

  componentDidMount() {
    fetch('/api/health-check')
      .then(res => res.json())
      .then(data => this.setState({ message: data.message || data.error }))
      .catch(err => this.setState({ message: err.message }))
      .finally(() => this.setState({ isLoading: false }));
  }

  render() {
    const appView = this.state.view === 'signin'
      ? <SignIn loginUser={this.loginUser}/>
      : this.state.view === 'questionaire'
        ? <Questionaire setView={this.setView} user={this.state.user} />
        : this.state.view === 'home'
          ? <Home setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended}/>
          : this.state.view === 'search'
            ? <Search setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections}/>
            : this.state.view === 'collections'
              ? <Collections collections={this.state.collections} setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended} />
              : this.state.view === 'details'
                ? <MusicalDetails collections={this.state.collections} setView={this.setView} musical={this.state.params} related={this.state.related} addLike={this.addLike} deleteLike={this.deleteLike} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections}/>
                : this.state.view === 'recommendation'
                  ? <Recommnendation setView={this.setView} musicals={this.state.recommended} addLike={this.addLike} getAllRecommendations={this.getAllRecommendations}/>
                  : this.state.view === 'suggestion'
                    ? <Suggestion setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />
                    : <h1>TBD</h1>;
    return (appView);
  }
}
