import React from 'react';

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const obj = {
      username: this.state.value
    };
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then(res => res.json())
      .then(data => {
        this.props.loginUser(data);
      });
  }

  render() {
    return (
      <div className="main-background">
        <div className="sign-in-container">
          <img src="/images/mask.svg" alt=""/>
          <h1 className="logo">Broadway Beats</h1>
          <h5>Sign up or sign in to get your musical matches!</h5>
          <form onSubmit={this.handleSubmit}>
            <input className="input-rounded" type="text" onChange={this.handleChange} value={this.state.value} placeholder="Please enter a username"/>
            <button className="filter-button submit sign-up" type="submit">Start</button>
          </form>
        </div>
      </div>
    );
  }
}
