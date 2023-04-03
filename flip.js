// Import the required libraries
const TelegramBot = require('node-telegram-bot-api');
const random = require('random');

// Initialize the bot with your bot token
const bot = new TelegramBot('6167941632:AAFnwmgwdEpIIdaUlgbQKi1mSar6k57bd9U', { polling: true });

// Define the initial balance for players
const INITIAL_BALANCE = 100;

// Define the minimum and maximum bet amounts
const MIN_BET = 1;
const MAX_BET = 5;

// Define the commission rate for the NatBank
const COMMISSION_RATE = 0.05;

// Initialize the NatBank's balance
let natbank_balance = 0;

// Initialize the leaderboard dictionary
let leaderboard = {};

// Define the coin flip function
function flip_coin() {
  return random.boolean() ? 'heads' : 'tails';
}

// Define the start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;

  // Add the user to the leaderboard if not already present
  if (!leaderboard[userId]) {
    leaderboard[userId] = { username, score: INITIAL_BALANCE };
  }

  const message = `Welcome ${username}! Your current balance is ${leaderboard[userId].score}.`;
  bot.sendMessage(chatId, message);
});

// Define the bet command handler
bot.onText(/\/bet (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  const betAmount = parseInt(match[1]);

  // Add the user to the leaderboard if not already present
  if (!leaderboard[userId]) {
    leaderboard[userId] = { username, score: INITIAL_BALANCE };
  }

  // Check if the bet amount is within the allowed range
  if (betAmount < MIN_BET || betAmount > MAX_BET) {
    const message = `Invalid bet amount. Please place a bet between ${MIN_BET} and ${MAX_BET}.`;
    bot.sendMessage(chatId, message);
    return;
  }

  // Check if the player has enough score to place the bet
  if (leaderboard[userId].score < betAmount) {
    const message = `You don't have enough score to place the bet. Your current balance is ${leaderboard[userId].score}.`;
    bot.sendMessage(chatId, message);
    return;
  }

  // Flip the coin
  const result = flip_coin();

  // Update the player's score based on the result of the coin flip
  if (result === 'heads') {
    leaderboard[userId].score += betAmount;
  } else {
    leaderboard[userId].score -= betAmount;
    const natbankProfit = Math.floor(betAmount * COMMISSION_RATE);
    natbank_balance += natbankProfit;
  }

  // Send the result of the coin flip to the player
  const message = `The coin landed on ${result}.`;
  bot.sendMessage(chatId, message);

  // Send the player's updated balance
  const balanceMessage = `Your current balance is ${leaderboard[userId].score}.`;
  bot.sendMessage(chatId, balanceMessage);
});

// Define the leaderboard command handler
bot.onText(/\/leaderboard/, (msg) => {
  const chatId = msg.chat.id;

  // Sort the leaderboard by score in descending order
  const sortedLeaderboard = Object.entries(leaderboard)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 10);

