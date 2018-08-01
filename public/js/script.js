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

/*
 * Unfocus selected cell when user clicks outside of sudoku board.
 */
window.onclick = function (e) {
    if (e.target.tagName != "INPUT" && e.target.tagName != "TD") {
        if (selected) {
            // don't change the colour of the cell if the user "checks",
            // since it might be red
            if (e.target.id != "check") {
                selected.style.backgroundColor = "white";
            }
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
    solvedGame = solveCurrentGame();
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
            if (!inputTag.classList.contains("multiple") &&
                inputTag.value.length == 1 &&
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
