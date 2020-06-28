import React from 'react';
import Search from './search';
import MusicalDetails from './musicalDetails';
import SignIn from './signin';
import Questionaire from './questionaire';
import Recommnendation from './recommendation';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'signin',
      params: {},
      related: [],
      user: {},
      recommended: []
    };
    this.setView = this.setView.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.addLike = this.addLike.bind(this);
    this.deleteLike = this.deleteLike.bind(this);
  }

  setView(view, params, related) {
    if (view === 'recommendation') {
      this.setState({
        view: view,
        params: params,
        recommended: related
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
    fetch(`/api/recommendations/${user.userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          this.setState({
            view: 'questionaire',
            user: user.username
          });
        } else {
          this.setState({
            view: 'search',
            user: user
          });
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
        : this.state.view === 'search'
          ? <Search setView={this.setView}/>
          : this.state.view === 'details'
            ? <MusicalDetails setView={this.setView} musical={this.state.params} related={this.state.related} addLike={this.addLike} deleteLike={this.deleteLike}/>
            : this.state.view === 'recommendation'
              ? <Recommnendation setView={this.setView} musicals={this.state.recommended} addLike={this.addLike}/>
              : <h1>TBD</h1>;
    return (appView);
  }
}
