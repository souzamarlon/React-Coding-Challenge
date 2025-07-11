export const stringToDate = str => {
  if (str === '*') {
    return new Date(str);
  }

  const [month, year] = str.split('-');
  return new Date(`${month} 1 20${year}`);
}

export const dateToString = d => {
  if (isNaN(d.valueOf())) {
    return '*';
  }

  const [_, month, __, year] = d.toString().split(' ');
  return `${month.toUpperCase()}-${year.slice(2, 4)}`
}

export const parseCSV = str => {
  let [headers, ...lines] = str.split(';\n');

  headers = headers.split(';');

  return lines.map(line => {
    return line
      .split(';')
      .reduce((acc, value, i) => {
        if (['ACCOUNT', 'DEBIT', 'CREDIT'].includes(headers[i])) {
          acc[headers[i]] = parseInt(value, 10);
        } else if (headers[i] === 'PERIOD') {
          acc[headers[i]] = stringToDate(value);
        } else {
          acc[headers[i]] = value;
        }
        return acc;
      }, {});
  });
}

export const toCSV = arr => {
  let headers = Object.keys(arr[0]).join(';');
  let lines = arr.map(obj => Object.values(obj).join(';'));
  return [headers, ...lines].join(';\n');
}

export const parseUserInput = str => {
  const [
    startAccount, endAccount, startPeriod, endPeriod, format
  ] = str.split(' ');

  return {
    startAccount: parseInt(startAccount, 10),
    endAccount: parseInt(endAccount, 10),
    startPeriod: stringToDate(startPeriod),
    endPeriod: stringToDate(endPeriod),
    format
  };
}


export function filterBalance({ accounts, journalEntries, startAccount, endAccount, startPeriod, endPeriod }){

  const accountValues = accounts.map(acc => acc.ACCOUNT);

  const resolvedStartAccount = startAccount || Math.min(...accountValues);

  const resolvedEndAccount = endAccount || Math.max(...accountValues);

  const periodDates = journalEntries.map(j => new Date(j.PERIOD));

  const resolvedStartPeriod = !isNaN(startPeriod) ? new Date(startPeriod) : new Date(Math.min(...periodDates.map(d => d.getTime())));

  const resolvedEndPeriod = !isNaN(endPeriod) ? new Date(endPeriod) : new Date(Math.max(...periodDates.map(d => d.getTime())));

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

  return balance
}
