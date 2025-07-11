import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as utils from '../utils';

class BalanceOutput extends Component {
  render() {
    if (!this.props.userInput.format) {
      return null;
    }

    return (
      <div className='output'>
        <p>
          Total Debit: {this.props.totalDebit} Total Credit: {this.props.totalCredit}
          <br />
          Balance from account {this.props.userInput.startAccount || '*'}
          {' '}
          to {this.props.userInput.endAccount || '*'}
          {' '}
          from period {utils.dateToString(this.props.userInput.startPeriod)}
          {' '}
          to {utils.dateToString(this.props.userInput.endPeriod)}
        </p>
          {this.props.balance.length === 0 ? (
            <p>No results found.</p>
          ) : (
            <div>
              {this.props.userInput.format === 'CSV' ? (
                <pre>{utils.toCSV(this.props.balance)}</pre>
              ) : null}
              {this.props.userInput.format === 'HTML' ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ACCOUNT</th>
                      <th>DESCRIPTION</th>
                      <th>DEBIT</th>
                      <th>CREDIT</th>
                      <th>BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.balance.map((entry, i) => (
                      <tr key={i}>
                        <th scope="row">{entry.ACCOUNT}</th>
                        <td>{entry.DESCRIPTION}</td>
                        <td>{entry.DEBIT}</td>
                        <td>{entry.CREDIT}</td>
                        <td>{entry.BALANCE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              </div>
          )}
          </div>
    )
        
  }
}

BalanceOutput.propTypes = {
  balance: PropTypes.arrayOf(
    PropTypes.shape({
      ACCOUNT: PropTypes.number.isRequired,
      DESCRIPTION: PropTypes.string.isRequired,
      DEBIT: PropTypes.number.isRequired,
      CREDIT: PropTypes.number.isRequired,
      BALANCE: PropTypes.number.isRequired
    })
  ).isRequired,
  totalCredit: PropTypes.number.isRequired,
  totalDebit: PropTypes.number.isRequired,
  userInput: PropTypes.shape({
    startAccount: PropTypes.number,
    endAccount: PropTypes.number,
    startPeriod: PropTypes.date,
    endPeriod: PropTypes.date,
    format: PropTypes.string
  }).isRequired
};

export default connect(state => {
 
  /* YOUR CODE GOES HERE */
  const { journalEntries = [], accounts = [], userInput } = state;

  const {
    startAccount,
    endAccount,
    startPeriod,
    endPeriod
  } = userInput;

  const accountValues = accounts.map(acc => acc.ACCOUNT);

  const resolvedStartAccount = startAccount || Math.min(...accountValues);

  const resolvedEndAccount = endAccount || Math.max(...accountValues);

  const periodDates = journalEntries.map(j => new Date(j.PERIOD));

  const resolvedStartPeriod = !isNaN(startPeriod) ? new Date(userInput.startPeriod) : new Date(Math.min(...periodDates.map(d => d.getTime())));

  const resolvedEndPeriod = !isNaN(endPeriod) ? new Date(userInput.endPeriod) : new Date(Math.max(...periodDates.map(d => d.getTime())));

  const filteredAccounts = accounts.filter(
    ({ ACCOUNT }) => ACCOUNT >= resolvedStartAccount  && ACCOUNT <= resolvedEndAccount
  );

  const balance = filteredAccounts.flatMap(({ ACCOUNT, LABEL }) => {
    const entries = journalEntries.filter(
      (entry) =>
        entry.ACCOUNT === ACCOUNT &&
        new Date(entry.PERIOD) >= resolvedStartPeriod &&
        new Date(entry.PERIOD) <= resolvedEndPeriod
    );
  
    const DEBIT = entries.reduce((sum, e) => sum + e.DEBIT, 0);
    const CREDIT = entries.reduce((sum, e) => sum + e.CREDIT, 0);
  
    if (DEBIT === 0 && CREDIT === 0) return [];
  
    return [{
      ACCOUNT,
      DESCRIPTION: LABEL || '',
      DEBIT,
      CREDIT,
      BALANCE: DEBIT - CREDIT,
    }];
  });

  const totalCredit = balance.reduce((acc, entry) => acc + entry.CREDIT, 0);
  const totalDebit = balance.reduce((acc, entry) => acc + entry.DEBIT, 0);

  return {
    balance,
    totalCredit,
    totalDebit,
    userInput: state.userInput
  };
})(BalanceOutput);
