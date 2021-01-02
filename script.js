'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
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

const displayMovement = (movement, index) => {
    const type = movement < 0 ? 'withdrawal' : 'deposit';

    return `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
    index + 1
  } ${type}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${movement}€</div>
        </div>`;
};

const displayMovements = (account) => {
    //Clear any html already present
    containerMovements.innerHTML = '';

    account.movements.forEach((el, i) =>
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

    labelBalance.innerHTML = `${balance} &euro;`;
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

    labelSumIn.innerHTML = `${totalCredits} &euro;`;
    labelSumOut.innerHTML = `${Math.abs(totalDebits)} &euro;`;
    labelSumInterest.innerHTML = `${interest} &euro;`;
};

const updateUI = (account) => {
    //Display movements
    displayMovements(account);

    //Calculate and display balance
    calcAndDisplayBalance(account);

    //Calculate and display summary
    calcAndDisplaySummary(account);
};

computeUsernames(accounts);

let loggedInUser;

//Log in
loginForm.addEventListener('submit', (e) => {
    //Prevent default form behaviour
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

    //Show the UI
    containerApp.style.opacity = 1;

    //Update the UI
    updateUI(loggedInUser);
});

//Transfer
transferForm.addEventListener('submit', (e) => {
    //Prevent default form behaviour
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

    //Update the UI
    updateUI(loggedInUser);

    //Clear the input values and remove focus
    inputTransferTo.value = '';
    inputTransferAmount.value = '';

    inputTransferTo.blur();
    inputTransferAmount.blur();
});

// Close transfer
closeForm.addEventListener('submit', (e) => {
    //Prevent default form behaviour
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