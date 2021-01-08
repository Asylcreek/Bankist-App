'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2021-01-03T18:49:59.371Z',
    '2021-01-07T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const loginForm = document.querySelector('.login');
const transferForm = document.querySelector('.form--transfer');
const closeForm = document.querySelector('.form--close');
const loanForm = document.querySelector('.form--loan');

const startResetLogoutTime = () => {
  let duration = 60;

  const timerFunction = () => {
    const minutes = String(Math.floor(duration / 60)).padStart(2, 0);
    const seconds = String(duration % 60).padStart(2, 0);

    labelTimer.textContent = `${minutes}:${seconds}`;

    duration -= 1;

    if (duration < 0) {
      clearInterval(logoutTimer);

      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
      loggedInUser = null;
    }
  };

  timerFunction();
  const logoutTimer = setInterval(timerFunction, 1000);
  return logoutTimer;
};

const formatCurrency = (amount, locale, currency) => {
  const options = { style: 'currency', currency };

  return new Intl.NumberFormat(locale, options).format(amount);
};

const calcDaysPassed = (presentDate, passedDate, locale) => {
  const days = Math.round(
    Math.abs(presentDate - passedDate) / (1000 * 60 * 60 * 24)
  );

  if (!days) return 'Today';
  else if (days === 1) return 'Yesterday';
  else if (days > 1 && days <= 5) return `${days} days ago`;
  else {
    const date = new Date(passedDate);

    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const displayMovements = (account, sortedMovements = null) => {
  //Clear any html already present
  containerMovements.innerHTML = '';

  const displayMovement = (movement, index) => {
    const type = movement < 0 ? 'withdrawal' : 'deposit';

    // Get the days passed
    const date = calcDaysPassed(
      new Date(),
      new Date(account.movementsDates[index]),
      account.locale
    );

    return `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
          <div class="movements__date">${date}</div>
          <div class="movements__value">${formatCurrency(
            movement,
            account.locale,
            account.currency
          )}</div>
        </div>`;
  };

  (sortedMovements ?? account.movements).forEach((el, i) =>
    containerMovements.insertAdjacentHTML('afterbegin', displayMovement(el, i))
  );
};

const computeUsernames = (accounts) =>
  accounts.forEach((account) => {
    const username = account.owner
      .split(' ')
      .map((el) => el.toLowerCase().trim()[0])
      .join('');

    account.username = username;
  });

const calcAndDisplayBalance = (account) => {
  const balance = account.movements.reduce((acc, el) => acc + el, 0);

  labelBalance.innerHTML = formatCurrency(
    balance,
    account.locale,
    account.currency
  );
};

const calcAndDisplaySummary = (account) => {
  const totalCredits = account.movements
    .filter((el) => el > 0)
    .reduce((acc, el) => acc + el, 0);

  const totalDebits = account.movements
    .filter((el) => el < 0)
    .reduce((acc, el) => acc + el, 0);

  const interest = account.movements
    .filter((el) => el > 0)
    .map((el) => el * (account.interestRate / 100))
    .filter((el) => el >= 1)
    .reduce((acc, el) => acc + el, 0);

  labelSumIn.innerHTML = formatCurrency(
    totalCredits,
    account.locale,
    account.currency
  );
  labelSumOut.innerHTML = formatCurrency(
    Math.abs(totalDebits),
    account.locale,
    account.currency
  );
  labelSumInterest.innerHTML = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = (account) => {
  //Display movements
  displayMovements(account);

  //Calculate and display balance
  calcAndDisplayBalance(account);

  //Calculate and display summary
  calcAndDisplaySummary(account);
};

//Compute usernames
computeUsernames(accounts);

//Initialize global variables
let loggedInUser, timer;

//Log in
loginForm.addEventListener('submit', (e) => {
  //Prevent default form behavior
  e.preventDefault();

  //Get username and pin
  const username = inputLoginUsername.value.trim();
  const pin = Number(inputLoginPin.value.trim());

  //Use username and pin to find the user
  loggedInUser = accounts.find(
    (account) => account.username === username && account.pin === pin
  );

  //Check if the user exists
  if (!loggedInUser) return alert('Invalid username or pin. Please try again.');

  //Clear input fields
  inputLoginUsername.value = '';
  inputLoginPin.value = '';

  //Remove focus from input fields
  inputLoginUsername.blur();
  inputLoginPin.blur();

  //Greet user
  labelWelcome.textContent = `Hello, ${loggedInUser.owner.split(' ')[0]}!`;

  //Show current date
  const now = new Date();

  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    // weekday: 'short',
  };

  const date = new Intl.DateTimeFormat(loggedInUser.locale, options).format(
    now
  );
  labelDate.textContent = date;

  //Start the timer (Clear timer first if it already exists)
  if (timer) clearInterval(timer);
  timer = startResetLogoutTime();

  //Show the UI
  containerApp.style.opacity = 1;

  //Update the UI
  updateUI(loggedInUser);
});

//Transfer
transferForm.addEventListener('submit', (e) => {
  //Prevent default form behavior
  e.preventDefault();

  //Get transfer details
  const to = inputTransferTo.value.toLowerCase().trim();
  const amount = Number(inputTransferAmount.value);

  //Check if amount is less than zero
  if (amount <= 0) return alert('Please enter a number greater than zero.');

  //Check if logged in user has enough funds
  const balance = Number(labelBalance.textContent.split(' ')[0]);

  if (balance < amount)
    return alert(
      'You do not have sufficient funds for the transaction. Please credit your account and try again.'
    );

  //Check if recipient exists
  const recipient = accounts.find((el) => el.username === to);
  if (!recipient)
    return alert(
      `User "${to}" does not exist. Please check the name and try again.`
    );
  else if (recipient.username === loggedInUser.username)
    return alert('You cannot send money to yourself');

  //Transfer the money
  loggedInUser.movements.push(-amount);
  recipient.movements.push(amount);

  //Add the date of the transaction
  loggedInUser.movementsDates.push(new Date().toISOString());
  recipient.movementsDates.push(new Date().toISOString());

  //Update the UI
  updateUI(loggedInUser);

  //Clear timer and restart it
  clearInterval(timer);
  timer = startResetLogoutTime();

  //Clear the input values and remove focus
  inputTransferTo.value = '';
  inputTransferAmount.value = '';

  inputTransferTo.blur();
  inputTransferAmount.blur();
});

// Close account
closeForm.addEventListener('submit', (e) => {
  //Prevent default form behavior
  e.preventDefault();

  //Get username and pin
  const username = inputCloseUsername.value.toLowerCase().trim();
  const pin = Number(inputClosePin.value);

  //Get the user index
  const loggedInUserIndex = accounts.findIndex(
    (account) => account.username === username && account.pin === pin
  );

  //Check if user exists and is the current logged in user
  if (loggedInUserIndex < 0)
    return alert('Incorrect username or pin. Please try again');
  else if (username !== loggedInUser.username && pin !== loggedInUser.pin)
    return alert('You can only close your own account!');

  //Delete the account
  accounts.splice(loggedInUserIndex, 1);

  //Clear logout timer
  clearInterval(timer);

  //Show generic message
  labelWelcome.textContent = 'Log in to get started';

  //Hide the UI
  containerApp.style.opacity = 0;

  //Clear input values and remove focus
  inputCloseUsername.value = '';
  inputClosePin.value = '';

  inputCloseUsername.blur();
  inputClosePin.blur();

  alert('Account was closed successfully');
});

//Loan
loanForm.addEventListener('submit', (e) => {
  //Prevent default form behavior
  e.preventDefault();

  //Get amount
  const loanAmount = Math.floor(Number(inputLoanAmount.value));

  //Check if there is a loan amount and it is not less than 0
  if (!loanAmount || loanAmount < 0)
    return alert('Please enter a valid amount and try again.');

  //Process loan
  setTimeout(() => {
    //Check if amount meets loan conditions
    const approved = loggedInUser.movements.some(
      (el) => el >= loanAmount * 0.1
    );

    if (approved) loggedInUser.movements.push(loanAmount);
    else return alert('Your loan was not approved.');

    //Add the date of the transaction
    loggedInUser.movementsDates.push(new Date().toISOString());

    //Update UI
    updateUI(loggedInUser);
  }, 3000);

  //Clear timer and restart it
  clearInterval(timer);
  timer = startResetLogoutTime();

  //Clear input and remove focus
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

//Sorting
let sorted = false;
btnSort.addEventListener('click', () => {
  let movements;

  if (!sorted) movements = [...loggedInUser.movements].sort((a, b) => a - b);

  sorted = !sorted;

  displayMovements(loggedInUser, sorted ? movements : null);
});
