// every cell in the sudoku game, including static AND non-static
const cells = document.querySelectorAll("#sudoku-box td");
// the cell currently selected (clicked) by the user
var selected = null;
// the index of the currently selected game
var gameIndex = -1;
// the currently selected difficulty level (default is 'easy', on page load)
var gameDifficulty = "easy";
// an array of all games included in the selected difficulty level
var games = null;
// the solution to the currently selected game
var solvedGame = null;
// constants for every sudoku game
const rows = "abcdefghi";
const cols = "012345678";
const squares = [ ["a0", "a1", "a2", "b0", "b1", "b2", "c0", "c1", "c2"],
                ["a3", "a4", "a5", "b3", "b4", "b5", "c3", "c4", "c5"],
                ["a6", "a7", "a8", "b6", "b7", "b8", "c6", "c7", "c8"],
                ["d0", "d1", "d2", "e0", "e1", "e2", "f0", "f1", "f2"],
                ["d3", "d4", "d5", "e3", "e4", "e5", "f3", "f4", "f5"],
                ["d6", "d7", "d8", "e6", "e7", "e8", "f6", "f7", "f8"],
                ["g0", "g1", "g2", "h0", "h1", "h2", "i0", "i1", "i2"],
                ["g3", "g4", "g5", "h3", "h4", "h5", "i3", "i4", "i5"],
                ["g6", "g7", "g8", "h6", "h7", "h8", "i6", "i7", "i8"] ];

// load in the default easy game (i.e. the easy game at index 0) on page load
window.onload = function (e) {
    fetchGames("easy", function() {
        gameIndex = 0;
        loadGame(games[gameIndex]);
    });
}

// warn user before leaving page if the sudoku board contains user input
window.addEventListener("beforeunload", function (e) {
    if (isEmpty()) {
        return undefined;
    }
    e.returnValue = " ";
    return " ";
})

// unfocus selected cell when user clicks outside of sudoku board
window.onclick = function (e) {
    if (e.target.tagName != "INPUT" && e.target.tagName != "TD") {
        if (selected) {
            // don't change colour of cell if it is red due to player error
            if (!selected.style.backgroundColor == "#ff5e5e") {
                selected.style.backgroundColor = "white";
            }
            selected.querySelector("input").blur();
            selected = null;
        }
    }
}

// switch between single/multiple mode for the selected cell's input
// using shift key, as long as the cell is non-static
document.body.onkeydown = function (e) {
    if (e.keyCode == 16) {
        if (selected && !selected.classList.contains("static")) {
            changeCellState(selected, e);
        }
    }
}

// ensure correct input is focused when its container cell is clicked
document.body.onclick = function (e) {
    if (selected) {
        selected.querySelector("input").focus();
    }
}

// check to see if the difficulty has been changed before loading in a new game
function checkDifficulty(newGameDifficulty) {
    // first check if the user wants to proceed with loading in a new game
    if (!isEmpty()) {
        if (!confirm("Are you sure you'd like to clear the board?")) {
            return;
        }
    }

    // if the user selects a new difficulty, fetch the games for that difficulty
    // before loading the new game
    if (newGameDifficulty != gameDifficulty) {
        gameDifficulty = newGameDifficulty;
        fetchGames(gameDifficulty, function() {
            newGame();
        })
    // otherwise, just load in the new game
    } else {
        newGame();
    }
}

// choose a new random game to load in
function newGame() {
    let newGameIndex = gameIndex;
    // find a random index that is different than the current game's index
    while (newGameIndex == gameIndex) {
        newGameIndex = Math.floor((Math.random() * games.length));
    }
    gameIndex = newGameIndex;
    resetBoard();
    loadGame(games[gameIndex]);
}

// load in the sudoku game on the board
function loadGame(game) {
    solveCurrentGame();
    for (let i = 0; i < game.cells.length; i++) {
        var cellData = game.cells[i];
        var cell = document.getElementById(cellData.id);
        cell.classList.toggle("static");
        var inputTag = cell.querySelector("input");
        inputTag.setAttribute("readonly", true);
        inputTag.value = cellData.value;
    }
}

// fetch the games of a certain difficulty, set the global var 'games', and
// perform the callback function
function fetchGames(difficulty, _callback) {
    var gameFile = 'sudoku-games-' + difficulty + '.json';
    let gameRequest = new XMLHttpRequest();
    gameRequest.open('GET', gameFile);
    gameRequest.send();
    gameRequest.onreadystatechange = function () {
        if (gameRequest.readyState == 4) {
            games = JSON.parse(gameRequest.responseText);
            _callback();
        }
    }
}

// validate the input of a user into cell current
// only allow numbers from 1-9
function validateInput(current, event) {
    if (!current.hasAttribute("readonly")) {
        var char = String.fromCharCode(event.keyCode);
        if (isNaN(char) || char == '0') {
            return false;
        }
        changeCellValue(current, char);
        return true;
    }
    return false;
}

// change the value of the input tag inside cell current to char, or add char
// to the already existing value if the cell is in 'multiple' mode
// if cell input is in 'single' mode ('multiple' class is absent), allow only
// one digit input
// if cell input is in 'multiple' mode ('multiple' class is present), allow
// one to four digit input
function changeCellValue(current, char) {
    if (current.value.length == 1 && !current.classList.contains("multiple")) {
        current.value = char;
    } else if (current.value.length == 4) {
        current.value = current.value.slice(0, -1);
        current.value += char;
    }
}

// toggle cell input between 'multiple' and 'single' (marked by the absence
// of multiple)
function changeCellState(current, event) {
    current = current.querySelector("input");
    if (current.classList.contains("multiple")) {
        current.classList.remove("multiple");
        current.setAttribute("maxlength", 1);
        if (current.value.length > 1) {
            current.value = current.value.slice(0, -(current.value.length - 1));
        }
    } else {
        current.classList.add("multiple");
        current.setAttribute("maxlength", 4);
    }
}

// shade cell current a light green
function highlight(current) {
    if (current.classList.contains("static")) {
        return;
    }
    if (current != selected) {
        current.style.backgroundColor = "#D4EFDF";
    }
}

// shade cell current white
function unhighlight(current) {
    if (current != selected) {
        current.style.backgroundColor = "white";
    }
}

// shade cell current a darker green (only one cell should be this color at
// a time)
function select(current) {
    if (current.classList.contains("static")) {
        return;
    }
    if (selected) {
        selected.style.backgroundColor = "white";
    }
    selected = current;
    selected.style.backgroundColor = "#A9DFBF";
}

// clear the sudoku board of all user input
function clearBoardInput() {
    // only proceed if the user confirms
    if (!confirm("Are you sure you'd like to clear the board?")) {
        return;
    }

    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static")) {
            let cellInput = cells[i].querySelector("input");
            cellInput.classList.remove("multiple");
            cellInput.setAttribute("maxlength", 1);
            cellInput.value = "";
        }
    }
}

// clear the sudoku board entirely, of the game and all user input and reset
// all cells to non-static
function resetBoard() {
    for (var i = 0; i < cells.length; i++) {
        let cellInput = cells[i].querySelector("input");
        cells[i].classList.remove("static");
        cellInput.classList.remove("multiple");
        cellInput.removeAttribute("readonly");
        cellInput.setAttribute("maxlength", 1);
        cellInput.value = "";
    }
}

// return true if every cell is empty, false otherwise
function isEmpty() {
    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static") &&
        cells[i].querySelector("input").value.length > 0) {
            return false;
        }
    }
    return true;
}

function checkBoard() {
    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static")) {
            var inputTag = cells[i].querySelector("input");
            if (inputTag.value.length == 1 &&
                inputTag.value != solvedGame[cells[i].id]) {
                    cells[i].style.backgroundColor = "#ff5e5e";
            }
        }
    }
}



function displaySolvedGame() {
    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static")) {
            var inputTag = cells[i].querySelector("input");
            inputTag.value = solvedGame[cells[i].id];
        }
    }
}

function solveCurrentGame() {
    var game = {};
    for (let row of rows) {
        for (let col of cols) {
            game[row + col] = "123456789";
        }
    }
    for (let cell of games[gameIndex].cells) {
        if (!assign(game, cell.id, cell.value.toString())) {
            console.error("Couldn't assign value " + cell.value.toString() +
            " to cell " + cell.id);
        }
    }
    solvedGame = game;
}

function assign(game, id, value) {
    otherValues = game[id].replace(value, "").split("");
    if (otherValues.every(function(otherValue) {
        return eliminate(game, id, otherValue);
    })) {
        return true;
    } else {
        return false;
    }
}

function eliminate(game, id, value) {
    if (game[id].indexOf(value) == -1) {
        return true;
    }
    game[id] = game[id].replace(value, "");

    if (game[id].length == 0) {
        return false;
    } else if (game[id].length == 1) {
        let otherValue = game[id];
        let peers = getPeers(game, id);
        if (!peers.every(function(peer){
            return eliminate(game, peer, otherValue);
        })) {
            return false;
        }
    }

    let units = getUnits(game, id);
    for (let unit of units) {
        let places = [];
        for (let cellId of unit) {
            if (game[cellId].indexOf(value) != -1) {
                places.push(cellId);
            }
        }
        if (places.length == 0) {
            return false;
        } else if (places.length == 1) {
            if (!assign(game, places[0], value)) {
                return false;
            }
        }
    }
    return true;
}

// return a list of the ids of all peers for the cell with the given id
// a 'peer' is a cell that shares a row, column, or square with another cell
function getPeers(game, id) {
    let peers = [];
    // get all peers of the same row
    for (let col of cols) {
        if (id[1] != col) {
            peers.push(id[0] + col);
        }
    }
    // get all peers of the same column
    for (let row of rows) {
        if (id[0] != row) {
            peers.push(row + id[1]);
        }
    }
    // get all peers of the same square, if they aren't in the same row/column
    for (let arr of squares) {
        if (arr.includes(id)) {
            for (let cellId of arr) {
                if (cellId != id && cellId[0] != id[0] && cellId[1] != id[1]) {
                    peers.push(cellId);
                }
            }
            break;
        }
    }
    return peers;
}

function getUnits(game, id) {
    let units = [[], [], []];
    // get unit[0], the row
    for (let col of cols) {
        units[0].push(id[0] + col);
    }
    // get unit[1], the column
    for (let row of rows) {
        units[1].push(row + id[1]);
    }
    // get unit[2], the square
    for (let arr of squares) {
        if (arr.includes(id)) {
            for (let cellId of arr) {
                units[2].push(cellId);
            }
            break;
        }
    }
    return units;
}

// add behaviours to all non-static cells
for (var i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("static")) {
        cells[i].addEventListener('mouseover', function() { highlight(this) });
        cells[i].addEventListener('mouseout', function() { unhighlight(this) });
        cells[i].addEventListener('click', function() { select(this)})
    }
}
