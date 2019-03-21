// Code your JavaScript / jQuery solution here
$(document).ready(function() {
  attachListeners();
});

const WINNING_COMBOS = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

var turn = 0;
var currentGame = false;

function player() {
  return turn % 2 === 0 ? "X" : "O";
}

function updateState(square) {
  let token = player();
  $(square).text(token);
}

function setMessage(message) {
  $('#message').text(message);
}

function checkWinner() {
  let board = {};
  let winner = false;
  var pieces = $('td');
  for(var i = 0; i < pieces.length; i++) {
    board[i] = pieces[i].innerHTML;
  }

  WINNING_COMBOS.some(function(combo) {
    if (board[combo[0]] !== "" && board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]]) {
      setMessage(`Player ${board[combo[0]]} Won!`);
      return winner = true;
    }
  });

  return winner;
}

function resetBoard() {
  $('td').empty();
  turn = 0;
  currentGame = 0;
}

function save() {
  var state = []
  var gameState = {state: state}
  $('td').text((index, piece) => {state.push(piece)});
  if(currentGame) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${currentGame}`,
      data: gameState
    });
  } else {
    $.post('/games', gameState, function(game) {
      currentGame = game['data']['id'];
      $('#games').append(`<button id="currentGame-${currentGame}">${currentGame}</button><br>`);
      $(`#currentGame-${currentGame}`).on('click', () => reload(currentGame));
    });
  }
}

function doTurn(square) {
  updateState(square);
  turn++;
  if (checkWinner()) {
    save();
    resetBoard();
  } else if (turn === 9) {
    setMessage("Tie game.");
    save();
    resetBoard();
  }
}

function attachListeners() {
  $('td').on('click', function(event) {
    if (!checkWinner() && !$.text(this)) {
      doTurn(this);
    }
  });

  $('#previous').on('click', function() {
    previous();
  });

  $('#save').on('click', () => {
    save();
  });

  $('#clear').on('click', () => resetBoard());
}

function reload(currentGame) {
  $.get(`/games/${currentGame}`, function(game) {
    // currentGame = game['data']['id'];
    var state = game['data']['attributes']['state'];
    $('td').empty();
    $('td').text(function(index) {
      return state[index];
    });
    turn = state.join("").length
    currentGame = game['data']['id'];
  });
}

function previous() {
  $('#games').empty();
  $.get('/games', function(games) {
    games['data'].forEach(function(game) {
      $('#games').append(`<button id="currentGame-${game.id}">${game.id}</button><br>`);
      $(`#currentGame-${game.id}`).on('click', function() {
        reload(game.id)
      });
    });
  });
}
