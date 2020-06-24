import React from 'react';

export default class FilterButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      checked: !state.checked
    }), () => this.props.addFilter(this.props.categoryInfo.id, this.props.category, this.state.checked));
  }

  render() {
    const buttonStyling = this.state.checked ? 'checked' : 'unchecked';
    return (
      <button className={`filter-button ${buttonStyling}`} onClick={this.handleClick}>
        {this.props.categoryInfo.name}
      </button>
    );
  }
}
