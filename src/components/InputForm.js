import React, { Component } from 'react';
import { connect } from 'react-redux';
import { accounts, journal } from '../data';
import * as actions from '../actions';
import * as utils from '../utils';

class InputForm extends Component {
  state = {
    accounts,
    journal,
    userInput: '1000 5000 MAR-16 JUL-16 HTML',
    error: ""
  };

  componentDidMount() {
    this.handleSubmit();
  }

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleSubmit = e => {
    e && e.preventDefault();


    if (this.state.userInput.trim() === "") {
      this.setState({ error: "User input is required." });
      return;
    }
    this.setState({ error: "" });

    this.props.dispatch(actions.setJournalEntries(utils.parseCSV(this.state.journal)));
    this.props.dispatch(actions.setAccounts(utils.parseCSV(this.state.accounts)));
    this.props.dispatch(actions.setUserInput(utils.parseUserInput(this.state.userInput)));
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className='form-group'>
          <label htmlFor="journal">Journal</label>
          <textarea className="form-control" id="journal" rows="3" value={this.state.journal} onChange={this.handleChange}></textarea>
        </div>

        <div className='form-group'>
          <label htmlFor="accounts">Accounts</label>
          <textarea className="form-control" id="accounts" rows="3" value={this.state.accounts} onChange={this.handleChange}></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="userInput">User input</label>
          <input type="text" className="form-control" id="userInput" value={this.state.userInput} onChange={this.handleChange} placeholder="e.g. 1000 5000 MAR-16 JUL-16 HTML" />
          <small style={{ color: 'gray' }}>
            Format: startAccount endAccount startPeriod endPeriod HTML/CSV
          </small>
          {this.state.error &&  <div style={{ color: 'red', marginTop: 4 }}>
            Please use the format: <code>1000 5000 MAR-16 JUL-16 HTML</code>
          </div>}
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    );
  }
}

export default connect()(InputForm);
