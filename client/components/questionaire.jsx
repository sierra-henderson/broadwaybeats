import React from 'react';
import QuestionaireCard from './questionaire-card';
import QuestionaireMusicalCard from './questionaire-musical-card';

export default class Questionaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      genre: {},
      musicalStyle: {},
      likedMusical: {},
      questionaireMusicals: [],
      test: null
    };
    this.changePage = this.changePage.bind(this);
    this.recordData = this.recordData.bind(this);
    this.submitSeeds = this.submitSeeds.bind(this);
    this.submitQuestionaire = this.submitQuestionaire.bind(this);
    this.getLikedMusicals = this.getLikedMusicals.bind(this);
    this.addLikedMusicals = this.addLikedMusicals.bind(this);
  }

  changePage(newPage) {
    this.setState({
      page: newPage
    });
  }

  recordData(id, category, add) {
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

  submitSeeds() {
    const genres = Object.keys(this.state.genre)
      .filter(id => this.state.genre[id]);
    const musicalStyles = Object.keys(this.state.musicalStyle)
      .filter(id => this.state.musicalStyle[id]);
    const obj = {
      g: genres,
      ms: musicalStyles
    };
    if (genres.length > 0 && musicalStyles.length > 0) {
      fetch('/api/questionaire/seeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      })
        .then(res => res.json())
        .then(data => {
          this.setState({
            test: data
          }, this.getLikedMusicals);
        })
        .catch(err => console.error(err));
    }
  }

  getLikedMusicals() {
    fetch('/api/questionaire/seedMusicals/')
      .then(res => res.json())
      .then(data => {
        this.setState({
          questionaireMusicals: data
        }, this.changePage(4));
      });
  }

  addLikedMusicals() {
    const likedMusicals = Object.keys(this.state.likedMusical)
      .filter(id => this.state.likedMusical[id]);
    const obj = {
      lm: likedMusicals
    };
    if (likedMusicals.length > 0) {
      fetch('/api/questionaire/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      })
        .then(res => res.json())
        .then(data => {
          this.changePage(5);
        });
    }
  }

  submitQuestionaire() {
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => {
        this.props.setView('recommendation', {}, data);
      });
  }

  render() {
    const pageOne = [
      { cardId: 1, image: '/images/comedy.jpeg', name: 'Comedy', id: 7, category: 'genre' },
      { cardId: 2, image: '/images/drama.jpg', name: 'Drama', id: 10, category: 'genre' },
      { cardId: 3, image: '/images/mystery.jpg', name: 'Mystery/Thriller', id: 18, category: 'genre' },
      { cardId: 4, image: '/images/romance.jpeg', name: 'Romance', id: 23, category: 'genre' },
      { cardId: 5, image: '/images/adventure.jpg', name: 'Adventure', id: 4, category: 'genre' },
      { cardId: 6, image: '/images/fantasy.jpg', name: 'Fantasy', id: 15, category: 'genre' }
    ];
    const pageTwo = [
      { cardId: 7, image: '/images/classic-broadway.jpeg', name: 'Classic Broadway', id: 6, category: 'musicalStyle' },
      { cardId: 8, image: '/images/contemporary.jpg', name: 'Contemporary Broadway', id: 8, category: 'musicalStyle' },
      { cardId: 9, image: '/images/operetta.jpg', name: 'Classical/Operetta', id: 7, category: 'musicalStyle' },
      { cardId: 10, image: '/images/pop-rock.jpg', name: 'Pop/Rock', id: 17, category: 'musicalStyle' },
      { cardId: 11, image: '/images/country.jpg', name: 'Country', id: 11, category: 'musicalStyle' },
      { cardId: 12, image: '/images/folk.jpg', name: 'Folk', id: 12, category: 'musicalStyle' },
      { cardId: 13, image: '/images/gospel.jpg', name: 'Gospel', id: 14, category: 'musicalStyle' },
      { cardId: 14, image: '/images/jazz.jpeg', name: 'Jazz/Blues', id: 15, category: 'musicalStyle' }
    ];
    const pageThree = [
      { cardId: 15, image: '/images/historical.jpg', name: 'Period/Historical', id: 20, category: 'genre' },
      { cardId: 16, image: '/images/religious.jpg', name: 'Religious', id: 21, category: 'genre' },
      { cardId: 17, image: '/images/christmas.jpg', name: 'Christmas/Holiday', id: 6, category: 'genre' },
      { cardId: 18, image: '/images/experimental.jpg', name: 'Experimental', id: 12, category: 'genre' },
      { cardId: 19, image: '/images/dark-comedy.jpeg', name: 'Dark Comedy', id: 8, category: 'genre' },
      { cardId: 20, image: '/images/revue.jpeg', name: 'Revue', id: 22, category: 'genre' },
      { cardId: 21, image: '/images/adaptations-shakespeare.jpg', name: 'Adaptations (Shakespeare)', id: 2, category: 'genre' },
      { cardId: 22, image: '/images/adaptations-screen.jpg', name: 'Adaptations (Stage and Screen)', id: 3, category: 'genre' },
      { cardId: 23, image: '/images/adaptations-literature.jpg', name: 'Adaptations (Literature)', id: 1, category: 'genre' },
      { cardId: 24, image: '/images/science-fiction.jpg', name: 'Science Fiction', id: 26, category: 'genre' }
    ];
    switch (this.state.page) {
      case 0:
        return (
          <div className="questionaire-container">
            <div className="percent-complete"></div>
            <div className="questionaire-initial">
              <h1>{`Welcome, ${this.props.user}!`}</h1>
              <p>We would like you to answer a few questions to get your taste in musicals</p>
              <button className="filter-button submit" onClick={() => this.changePage(1)}>Ready?</button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="questionaire-container">
            <div className="percent-complete"></div>
            <div className="complete-bar twenty"></div>
            <div className="inner-questionaire">
              <div className="page-toggles">
                <i className="fas fa-arrow-left fa-2x" onClick={() => this.changePage(0)}></i>
                <i className="fas fa-check fa-2x" onClick={() => this.changePage(2)}></i>
              </div>
              <h1>Do you have a preferred genre?</h1>
              <div className="boxed-cards-container">
                {
                  pageOne.map(card => {
                    return <QuestionaireCard key={card.cardId} isChecked={this.state.genre[card.id]} card={card} recordData={this.recordData}/>;
                  })
                }
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="questionaire-container">
            <div className="percent-complete"></div>
            <div className="complete-bar forty"></div>
            <div className="inner-questionaire">
              <div className="page-toggles">
                <i className="fas fa-arrow-left fa-2x" onClick={() => this.changePage(1)}></i>
                <i className="fas fa-check fa-2x" onClick={() => this.changePage(3)}></i>
              </div>
              <h1>What kind of musical style do you look for in a musical?</h1>
              <div className="boxed-cards-container">
                {
                  pageTwo.map(card => {
                    return <QuestionaireCard key={card.cardId} card={card} isChecked={this.state.musicalStyle[card.id]} recordData={this.recordData}/>;
                  })
                }
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="questionaire-container">
            <div className="percent-complete"></div>
            <div className="complete-bar sixty"></div>
            <div className="inner-questionaire">
              <div className="page-toggles">
                <i className="fas fa-arrow-left fa-2x" onClick={() => this.changePage(2)}></i>
                <i className="fas fa-check fa-2x" onClick={this.submitSeeds}></i>
              </div>
              <h1>Is there anything else you look for in a musical?</h1>
              <div className="boxed-cards-container">
                {
                  pageThree.map(card => {
                    return <QuestionaireCard key={card.cardId} card={card} isChecked={this.state.genre[card.id]} recordData={this.recordData}/>;
                  })
                }
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="questionaire-container">
            <div className="percent-complete"></div>
            <div className="complete-bar eighty"></div>
            <div className="inner-questionaire">
              <div className="page-toggles align-right">
                <i className="fas fa-check fa-2x" onClick={this.addLikedMusicals}></i>
              </div>
              <h1>Almost done: pick any musicals you already love!</h1>
              <div className="boxed-cards-container">
                {
                  this.state.questionaireMusicals.map(musical => {
                    return <QuestionaireMusicalCard key={musical.musicalId} isChecked={this.state.likedMusical[musical.musicalId]} musical={musical} recordData={this.recordData} />;
                  })
                }
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="questionaire-container">
            <div className="percent-complete"></div>
            <div className="complete-bar hundred"></div>
            <div className="questionaire-initial">
              <h1 className="medium">Done!</h1>
              <i className="big-check fas fa-check-circle"></i>
              <button className="reset filter-button" onClick={this.submitQuestionaire}>Get my musicals!</button>
            </div>
          </div>
        );
    }
  }
}
