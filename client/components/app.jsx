import React from 'react';
import Search from './search';
import MusicalDetails from './musicalDetails';
import SignIn from './signin';
import Questionaire from './questionaire';
import Home from './home';
import Collections from './collections';
import CollectionItem from './collectionItem';
import Suggestion from './suggestion';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      related: [],
      user: {},
      recommended: [],
      collections: [],
      signinRedirect: false
    };
    this.setView = this.setView.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.addLike = this.addLike.bind(this);
    this.deleteLike = this.deleteLike.bind(this);
    this.getAllRecommendations = this.getAllRecommendations.bind(this);
    this.getAllCollections = this.getAllCollections.bind(this);
  }

  setView(view, params, related) {
    if (view === 'home') {
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
            user: user.username,
            signinRedirect: 'questionnarire'
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
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <Home setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended} />}
          </Route>
          <Route path="/questionnaire">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <Questionaire setView={this.setView} user={this.state.user} getAllRecommendations={this.getAllRecommendations} />}
          </Route>
          <Route path="/search">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <Search setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />}
          </Route>
          <Route exact path="/collections">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <Collections collections={this.state.collections} setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended} />}
          </Route>
          <Route path="/musicals/:musicalId">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <MusicalDetails collections={this.state.collections} setView={this.setView} musical={this.state.params} related={this.state.related} addLike={this.addLike} deleteLike={this.deleteLike} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />}
          </Route>
          <Route path="/suggestion">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <Suggestion setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />}
          </Route>
          <Route path="/collections/:collectionId">
            {typeof this.state.user === 'object' ? <Redirect to="/signin" /> : <CollectionItem />}
          </Route>
          <Route path="/signin">
            <SignIn loginUser={this.loginUser} signinRedirect={this.state.signinRedirect} />
          </Route>
        </Switch>
      </Router>
    );
    // const appView = this.state.view === 'signin'
    //   ?
    //   : this.state.view === 'questionaire'
    //     ? <Questionaire setView={this.setView} user={this.state.user} getAllRecommendations={this.getAllRecommendations}/>
    //     : this.state.view === 'home'
    //       ? <Home setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended}/>
    //       : this.state.view === 'search'
    //         ? <Search setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections}/>
    //         : this.state.view === 'collections'
    //           ? <Collections collections={this.state.collections} setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended} />
    //           : this.state.view === 'details'
    //             ? <MusicalDetails collections={this.state.collections} setView={this.setView} musical={this.state.params} related={this.state.related} addLike={this.addLike} deleteLike={this.deleteLike} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections}/>
    //             : this.state.view === 'suggestion'
    //               ? <Suggestion setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />
    //               : <h1>TBD</h1>;
    // return (appView);
  }
}
