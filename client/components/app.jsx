import React from 'react';
import Search from './search';
import MusicalDetails from './musicalDetails';
import SignIn from './signin';
import Questionaire from './questionaire';
import Home from './home';
import Collections from './collections';
import CollectionItem from './collectionItem';
import Suggestion from './suggestion';
import PageNotFound from './pageNotFound';
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
      user: null,
      isAuthorizing: true,
      recommended: [],
      collections: [],
      questionaireFilled: false,
      signinRedirect: false
    };
    this.setView = this.setView.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.submitQuestionnaire = this.submitQuestionnaire.bind(this);
    this.addLike = this.addLike.bind(this);
    this.deleteLike = this.deleteLike.bind(this);
    this.getAllCollections = this.getAllCollections.bind(this);
    this.getMusicalDetails = this.getMusicalDetails.bind(this);
  }

  componentDidMount() {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.numLiked) {
          this.setState({
            user: data.username,
            questionaireFilled: true,
            isAuthorizing: false
          });
        } else {
          this.setState({
            user: data.username,
            isAuthorizing: false
          });
        }
      });
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
            signinRedirect: 'questionnaire',
            questionaireFilled: false
          });
        } else {
          this.setState({
            user: user.username,
            signinRedirect: 'home',
            questionaireFilled: true
          });
        }
      });
  }

  submitQuestionnaire() {
    this.setState({
      questionaireFilled: true
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

  getMusicalDetails(id) {
    fetch(`/api/musicals/${id}`)
      .then(res => res.json())
      .then(data => {
        return fetch(`/api/musicals/${id}/like`)
          .then(res => res.json())
          .then(likeInfo => {
            data.like = likeInfo.like;
            return fetch(`/api/musicals/${id}/related`)
              .then(res => res.json())
              .then(related => {
                this.setState({
                  params: data,
                  related: related
                });
              });
          });
      });
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

  render() {
    if (this.state.isAuthorizing) return null;
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            {!this.state.user ? <Redirect to="/signin" /> : !this.state.questionaireFilled ? <Redirect to="/questionnaire" /> : <Home getMusicalDetails={this.getMusicalDetails} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} musicalList={this.state.recommended} />}
          </Route>
          <Route path="/questionnaire">
            {this.state.isAuthorizing ? <Redirect to="/signin" /> : this.state.questionaireFilled ? <Redirect to="/" /> : <Questionaire setView={this.setView} user={this.state.user} getAllRecommendations={this.getAllRecommendations} />}
          </Route>
          <Route path="/search">
            {!this.state.user ? <Redirect to="/signin" /> : !this.state.questionaireFilled ? <Redirect to="/questionnaire" /> : <Search getMusicalDetails={this.getMusicalDetails} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />}
          </Route>
          <Route exact path="/collections">
            {!this.state.user ? <Redirect to="/signin" /> : !this.state.questionaireFilled ? <Redirect to="/questionnaire" /> : <Collections musicalList={this.state.recommended} />}
          </Route>
          <Route exact path="/musicals/:musicalId" render={props => <MusicalDetails getMusicalDetails={this.getMusicalDetails} getAllCollections={this.getAllCollections} collections={this.state.collections} musical={this.state.params} related={this.state.related} addLike={this.addLike} deleteLike={this.deleteLike} {...props} />} />
          <Route path="/suggestion">
            {!this.state.user ? <Redirect to="/signin" /> : !this.state.questionaireFilled ? <Redirect to="/questionnaire" /> : <Suggestion setView={this.setView} getAllRecommendations={this.getAllRecommendations} getAllCollections={this.getAllCollections} />}
          </Route>
          <Route path="/collections/:collectionId" component={CollectionItem} />
          <Route path="/signin">
            {this.state.signinRedirect === 'questionnaire' ? <Redirect to="/questionnaire" /> : this.state.signinRedirect === 'home' ? <Redirect to="/" /> : <SignIn loginUser={this.loginUser} />}
          </Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Router>
    );
  }
}
