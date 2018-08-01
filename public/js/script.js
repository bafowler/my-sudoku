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

/*
 * load in the default easy game (the easy game at index 0) on page load
 * and add in highlighting behaviours for all cells.
 */
window.onload = function (e) {
    fetchGames("easy", function() {
        gameIndex = 0;
        loadGame(games[gameIndex]);
    });

    for (var i = 0; i < cells.length; i++) {
        cells[i].addEventListener('mouseover', function() { highlight(this);});
        cells[i].addEventListener('mouseout', function() { unhighlight(this);});
        cells[i].addEventListener('click', function() { select(this);});
    }
}

/*
 * Warn user before leaving page if the sudoku board contains user input.
 */
window.addEventListener("beforeunload", function (e) {
    if (isEmpty()) {
        return undefined;
    }
    e.returnValue = " ";
    return " ";
})

/* Unfocus selected cell when user clicks outside of sudoku board, and not on
 * a button.
 */
window.onclick = function (e) {
    if (e.target.tagName != "INPUT" && e.target.tagName != "TD" &&
        e.target.tagName != "BUTTON") {
        if (selected) {
            selected.style.backgroundColor = "white";
            selected.querySelector("input").blur();
            selected = null;
        }
    }
}

/*
 * Switch between single/multiple mode for the selected cell's input
 * using shift key, as long as the cell is non-static.
 */
document.body.onkeydown = function (e) {
    if (e.keyCode == 16) {
        if (selected && !selected.classList.contains("static")) {
            changeCellState(selected, e);
        }
    }
}

/*
 * Ensure correct input is focused when its container cell is clicked.
 */
document.body.onclick = function (e) {
    if (selected) {
        selected.querySelector("input").focus();
    }
}

/*
 * Check if the difficulty has changed before loading in a new game.
 */
function checkDifficulty(newGameDifficulty) {
    // only proceed if the board is empty or the user confirms
    if (!isEmpty() && !confirm("Are you sure you'd like to clear the board? " +
    "This will erase your progress.")) {
        return;
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

/*
 * Choose a new random game within the current difficulty to load in,
 * different than the game currently loaded.
 */
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

/*
 * Load the current game onto the board.
 */
function loadGame(game) {
    solveCurrentGame();
    for (let cellId in game) {
        var cell = document.getElementById(cellId);
        cell.classList.toggle("static");
        var inputTag = cell.querySelector("input");
        inputTag.setAttribute("readonly", true);
        inputTag.value = game[cellId];
    }
}

/*
 * Fetch the games of a certain difficulty, set the global var 'games', then
 * perform the callback function.
 */
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

/*
 * Validate the input of the user into current cell.
 * Only allow numbers from 1-9.
 */
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

/*
 * Change the value of the input tag inside cell current to char, or add char
 * to the already existing value if the cell is in 'multiple' mode.
 * If cell input is in 'single' mode ('multiple' class is absent), allow only
 * one digit input.
 * If cell input is in 'multiple' mode ('multiple' class is present), allow
 * one to four digit input.
 */
function changeCellValue(current, char) {
    if (current.value.length == 1 && !current.classList.contains("multiple")) {
        current.value = char;
    } else if (current.value.length == 4) {
        current.value = current.value.slice(0, -1);
        current.value += char;
    }
}

/*
 * Toggle cell input between 'multiple' and 'single' (marked by the absence
 * of multiple in the classList) modes
 */
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

/*
 * Shade cell current a light green, iff it is non-static.
 */
function highlight(current) {
    if (current.classList.contains("static")) {
        return;
    }
    if (current != selected) {
        current.style.backgroundColor = "#D4EFDF";
    }
}

/*
 * Shade current cell white.
 */
function unhighlight(current) {
    if (current != selected) {
        current.style.backgroundColor = "white";
    }
}

/*
 * Shade current cell a darker green (only one cell should be this color at
 * a time), iff it is non-static, and remove the dark green from the previously
 * selected cell.
 */
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

/*
 * Clear the sudoku board of all user input.
 */
function clearBoardInput() {
    // only proceed if the board is empty or the user confirms
    if (!isEmpty() && !confirm("Are you sure you'd like to clear the board? " +
    "This will erase your progress.")) {
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

/*
 * Clear the sudoku board entirely, of the game and all user input and reset
 * all cells to non-static.
 */
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

/*
 * Return true if every cell is empty, false otherwise.
 */
function isEmpty() {
    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static") &&
        cells[i].querySelector("input").value.length > 0) {
            return false;
        }
    }
    return true;
}

/*
 * Check the solution against what the user has inputted on the board. Change
 * the background colour of each incorrect cell found to red.
 */
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

/*
 * Display the solution to the current game on the board.
 */
function displaySolvedGame() {
    // only proceed if the board is empty or the user confirms
    if (!isEmpty() && !confirm("Are you sure you'd like to solve the game? " +
    "This will erase your progress.")) {
        return;
    }

    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static")) {
            var inputTag = cells[i].querySelector("input");
            inputTag.value = solvedGame[cells[i].id];
        }
    }
}

/*
 * Create a sudoku game, which is a dictionary that maps cell id to possible
 * cell values. The game will start out with each cell having every impossible
 * value (123456789). Then, assign each "static" cell given by the current game
 * its appropriate value. Search for the solution using guess-and-check. Set the
 * solvedGame global variable to the solution if found, null otherwise.
 */
function solveCurrentGame() {
    var game = {};
    for (let row of rows) {
        for (let col of cols) {
            game[row + col] = "123456789";
        }
    }
    for (let cellId in games[gameIndex]) {
        if (!assign(game, cellId, games[gameIndex][cellId])) {
            console.error("Couldn't assign value " + games[gameIndex][cellId] +
            " to cell " + cellId);
        }
    }
    if (!(solvedGame = search(game))) {
        solvedGame = null;
    }
}
/*
 * Return true iff the game is solved (i.e. each cell has only one possible
 * value), false otherwise
 */
function checkSolved(game) {
    for (let cellId in game) {
        if (game[cellId].length != 1) {
            return false;
        }
    }
    return true;
}
/*
 * Return the id of an unsolved cell within a partially solved game that has
 * the least possible values (while still having >1 possible value)
 */
function findMinLengthCellId(game) {
    let minLengthCellId = null;
    let minLength = 10;
    for (let cellId in game) {
        if (game[cellId].length > 1) {
            if (!minLengthCellId ||
                game[cellId].length < minLength) {
                minLength = game[cellId].length;
                minLengthCellId = cellId;
            }
        }
    }
    return minLengthCellId;
}
/*
 * Take a partially completed game and recursively 'search' for the solution
 * by guessing different values for the unsolved cell within the game that has
 * the least possible values and seeing if a contradicition is found. Return
 * the solved game if it is found, false if no solution can be found.
 *
 */
function search(game) {
    if (!game) {
        return false;
    }
    if (checkSolved(game)) {
        return game;
    }

    let minLengthCellId = findMinLengthCellId(game);

    for (let value of game[minLengthCellId]) {
        // create a copy of the game
        let gameCopy = {};
        Object.keys(game).forEach(function(cellId) {
            gameCopy[cellId] = game[cellId];
        })
        // assign one of the possible values
        if (!assign(gameCopy, minLengthCellId, value)) {
            continue;   // contradicition found, move on to the next value
        }
        // take the copy of the game with the 'guessed' value and guess more
        // values using recursion
        gameCopy = search(gameCopy);
        if (gameCopy) {
            return gameCopy;
        }
    }

    return false;
}
/*
 * Assign value to the cell with the given id in the game by eliminating all
 * its other possible values. Return false if a contradiciton is found,
 * true otherwise.
 */
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

/*
 * Eliminate value from the cell with the given id's possible values, within
 * the game. If the cell with the given id is reduced to one possible value,
 * recursively eliminate that value from all peers. Check the three units that
 * include the cell with the given id to see if, due to the first elimination,
 * the unit is reduced to only one place for value. If so, assign value to that
 * one possible cell. Return false if a contradiciton is found, true otherwise.
 */
function eliminate(game, id, value) {
    if (game[id].indexOf(value) == -1) {
        return true;    // value already eliminated
    }
    game[id] = game[id].replace(value, "");

    if (game[id].length == 0) {
        return false;   // contradiction: no possible for cell
    } else if (game[id].length == 1) {
        // cell with id is reduced to one value, eliminate it from peers
        let valueToEliminate = game[id];
        let peers = getPeers(game, id);
        if (!peers.every(function(peer){
            return eliminate(game, peer, valueToEliminate);
        })) {
            // contradiction: value could not be eliminated from a certain peer
            return false;
        }
    }
    // check all units to see if they are reduced to one place for value
    let units = getUnits(game, id);
    for (let unit of units) {
        // find all possible places for value within unit
        let places = [];
        for (let cellId of unit) {
            if (game[cellId].indexOf(value) != -1) {
                places.push(cellId);
            }
        }
        if (places.length == 0) {
            return false;   // contradiciton: no place for value within unit
        } else if (places.length == 1) {
            // only one place for value; assign it there
            if (!assign(game, places[0], value)) {
                return false;   // contradiction: value could not be assigned
            }
        }
    }
    return true;
}

/*
 * Return a list of all unique peers for the cell with id in game.
 * A 'peer' is a cell that shares a row, column, or square with another cell.
 */
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
    // get all peers of the same square, if they aren't already a peer due to
    // existing in the same row or column
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

/*
 * Return a list of the three units associated with id (row, column, square) in
 * game. The same cell id can be included in multiple units.
 */
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
