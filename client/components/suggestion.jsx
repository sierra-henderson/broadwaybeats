import React from 'react';
import BottomNav from './bottomNav';
import TopNav from './topNav';

export default class Suggestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      composer: '',
      notes: '',
      messageModal: false
    };
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleChangeComposer = this.handleChangeComposer.bind(this);
    this.handleChangeNotes = this.handleChangeNotes.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeTitle(event) {
    this.setState({
      title: event.target.value
    });
  }

  handleChangeComposer(event) {
    this.setState({
      composer: event.target.value
    });
  }

  handleChangeNotes(event) {
    this.setState({
      notes: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const obj = {
      title: this.state.title,
      composer: this.state.composer,
      notes: this.state.notes
    };
    fetch('/api/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          messageModal: true,
          title: '',
          composer: '',
          notes: ''
        });
      });
  }

  render() {
    const modalClass = !this.state.messageModal ? 'hidden' : '';
    return (
      <div>
        <TopNav setView={this.props.setView} getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} />
        <div className="suggestion-container">
          <h1>Can&apos;t find the musical you want?</h1>
          <h4>Tell us a little about it and we&apos;ll try to add it to the site as soon as possible.</h4>
          <div className={`success-message ${modalClass}`}>
            <p>Thanks for submitting! We&apos;ll review your suggestion shortly.</p>
          </div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" className="input-rounded" onChange={this.handleChangeTitle} value={this.state.title} placeholder="Title" />
            <input type="text" className="input-rounded" onChange={this.handleChangeComposer} value={this.state.composer} placeholder="Composer" />
            <input type="text" className="input-rounded" onChange={this.handleChangeNotes} value={this.state.notes} placeholder="Any notes on genre, musical style" />
            <p className="faded-text">*At this time, we only support musicals available on Apple Music</p>
            <button className="filter-button reset" type="submit">Submit</button>
          </form>
          <BottomNav getAllRecommendations={this.props.getAllRecommendations} getAllCollections={this.props.getAllCollections} setView={this.props.setView} />
        </div>
      </div>

    );
  }
}
