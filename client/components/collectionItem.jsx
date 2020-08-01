import React from 'react';
import CollectionItemCard from './collectionItemCard';
import BottomNav from './bottomNav';
import TopNav from './topNav';
import { Link } from 'react-router-dom';

export default class CollectionItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCollection: [],
      activeCollectionName: '',
      myCollection: null
    };
    this.deleteMusicalFromCollection = this.deleteMusicalFromCollection.bind(this);
  }

  componentDidMount() {
    fetch(`/api/collections/${this.props.match.params.collectionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          this.setState({
            myCollection: false
          });
        } else {
          if (this.props.user === data[0].username) {
            this.setState({
              activeCollection: data,
              activeCollectionName: data[0].collectionName,
              myCollection: true
            });
          } else {
            this.setState({
              myCollection: false
            });
          }
        }
      });
  }

  deleteMusicalFromCollection(id) {
    const collectionId = this.state.activeCollection[0].collectionId;
    fetch(`/api/collections/${collectionId}/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        this.setState(state => ({
          activeCollection: state.activeCollection.filter(el => el.musicalId !== id)
        }));
      });
  }

  render() {
    if (this.state.myCollection) {
      if (this.state.activeCollection.length > 0) {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>{this.state.activeCollectionName}</h1>
              {
                this.state.activeCollection.map(item => {
                  return (
                    <CollectionItemCard item={item} key={item.musicalId} setView={this.props.setView} deleteMusicalFromCollection={this.deleteMusicalFromCollection} />
                  );
                })
              }
              <Link to="/collections">
                <button className="filter-button submit"><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
              </Link>
              <BottomNav />
            </div>
          </div>

        );
      } else {
        return (
          <div>
            <TopNav />
            <div className="collections-container">
              <h1>{this.state.activeCollectionName}</h1>
              <p className="no-items">You don&apos;t have any musicals in here yet!</p>
              <Link to="/collections">
                <button className="filter-button submit"><i className="fas fa-angle-left pointer-icon"></i>Back to Collections</button>
              </Link>
              <BottomNav />
            </div>
          </div>
        );
      }
    } else if (this.state.myCollection === false) {
      return (
        <div>
          <TopNav />
          <div className="error-message-container">
            <img src="/images/no-access.svg" alt="" />
            <p>Looks like your trying to access a collection that does not exist or is not your own!</p>
            <Link to="/collections">
              <button className="filter-button submit"><i className="fas fa-angle-left pointer-icon"></i>Back to My Collections</button>
            </Link>
          </div>
          <BottomNav />
        </div>
      );
    } else {
      return null;
    }
  }
}
