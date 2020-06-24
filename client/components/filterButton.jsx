import React from 'react';

export default class FilterButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.addFilter(this.props.categoryInfo.id, this.props.category, this.props.isChecked);
  }

  render() {
    const buttonStyling = this.props.isChecked ? 'checked' : 'unchecked';
    return (
      <button className={`filter-button ${buttonStyling}`} onClick={this.handleClick}>
        {this.props.categoryInfo.name}
      </button>
    );
  }
}
