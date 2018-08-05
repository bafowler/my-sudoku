// every cell in the sudoku game, including static AND non-static
const cells = document.querySelectorAll("#sudoku-box td");
// the cell currently selected (clicked) by the user
var selected = null;
// which number's cells are currently highlighted; -1 if none
var numHighlighted = -1;
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
 * Handle page load behaviour.
 */
window.onload = function(e) {
    // Load easy game at index 0
    fetchGames("easy", function() {
        gameIndex = 0;
        loadGame(games[gameIndex]);
    });
    // Add colour-changing behaviours to all cells
    for (var i = 0; i < cells.length; i++) {
        cells[i].addEventListener('mouseover', function() { highlight(this);});
        cells[i].addEventListener('mouseout', function() { unhighlight(this);});
        cells[i].addEventListener('click', function() { select(this);});
    }
}

/*
 * Warn user before leaving page if the sudoku board contains user input.
 */
window.addEventListener("beforeunload", function(e) {
    if (isEmpty()) {
        return undefined;
    }
    e.returnValue = " ";
    return " ";
})

/*
 * Unfocus selected cell when user clicks outside of sudoku board.
 */
window.onclick = function(e) {
    if (e.target.tagName != "INPUT" && e.target.tagName != "TD") {
        if (selected) {
            // don't change the colour of the cell if the user "checks",
            // since it might be red
            if (e.target.id != "check") {
                selected.style.backgroundColor = "white";
            }
            selected.querySelector("input").blur();
            selected = null;
            if (numHighlighted != -1) {
            // all cells of a certain number are highlighted; unhighlight them
                highlightAll("white");
                numHighlighted = -1;
            }
        }
    }
}

/*
 * Handle keyboard input.
 */
document.body.onkeydown = function(e) {
    // switch between single/multiple mode for the selected cell's input
    // using shift key, as long as the cell is non-static
    if (e.keyCode == 16) {
        if (selected && !selected.classList.contains("static")) {
            changeCellState(selected, e);
        }
    // change the selected cell if the user selects an arrow key
    } else if (e.keyCode >= 37 && e.keyCode <= 40 && selected) {
        e.preventDefault();
        switch(e.keyCode) {
            case 37:
                moveCellByKey(selected.id, "left");
                break;
            case 38:
                moveCellByKey(selected.id, "up");
                break;
            case 39:
                moveCellByKey(selected.id, "right");
                break;
            case 40:
                moveCellByKey(selected.id, "down");
                break;
            default:
                return;
        }
    // if backspace removes numHighlighted from selected cell, unhighlight that
    // number on the board
    } else if (e.keyCode == 8) {
        if (selected.querySelector("input").value == numHighlighted &&
            !selected.classList.contains("static")) {
            highlightAll("white");
            numHighlighted = -1;
        }
    }
}

/*
 * Given a direction and a starting cell id, move to the correct cell.
 * Return if the move is invalid (i.e. leads to an new cell id that DNE).
 */
function moveCellByKey(startCellId, direction) {
    let newCellId = null;
    if (direction == "left") {
        if (startCellId[1] == "0") {
            return;
        }
        newCellId = startCellId[0] + (--startCellId[1]).toString();
    } else if (direction == "up") {
        if (startCellId[0] == "a") {
            return;
        }
        let newCharCode = startCellId[0].charCodeAt() - 1;
        newCellId = String.fromCharCode(newCharCode) + startCellId[1];
    } else if (direction == "right") {
        if (startCellId[1] == "9") {
            return;
        }
        newCellId = startCellId[0] + (++startCellId[1]).toString();
    } else if (direction == "down") {
        if (startCellId[0] == "i") {
            return;
        }
        let newCharCode = startCellId[0].charCodeAt() + 1;
        newCellId = String.fromCharCode(newCharCode) + startCellId[1];
    }

    let newCell = document.querySelector("#"+newCellId);
    if (newCell) {
        select(newCell);
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
    solvedGame = solveCurrentGame(games[gameIndex]);
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
    // If applicable, highlight all cells with value 'char'
    setTimeout(function() {
        if (current.value.length == 1 &&
            !current.classList.contains("multiple")) {
            if (numHighlighted != -1) {
                // all cells of a certain number are highlighted; unhighlight them
                highlightAll("white");
                numHighlighted = -1;
            }
            // highlight all cells of this number
            numHighlighted = char;
            highlightAll("#D4EFDF");
        }
    }, 0);
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
        // Cut off all extra digits from the end
        if (current.value.length > 1) {
            current.value = current.value.slice(0, -(current.value.length - 1));
        }
        // If applicable, highlight all cells with current's value
        if (current.value.length == 1) {
            numHighlighted = current.value;
            highlightAll("#D4EFDF");
        }

    } else {
        current.classList.add("multiple");
        current.setAttribute("maxlength", 4);
        // Unhighlight all cells with current's value
        if (numHighlighted != -1) {
            highlightAll("white");
            numHighlighted = -1;
        }
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
    if (current != selected &&
        (current.querySelector("input").value != numHighlighted ||
         current.querySelector("input").classList.contains("multiple"))) {
        current.style.backgroundColor = "white";
    }
}

/*
 * Highlight all cells in 'single' mode which have a value equal to the
 * global variable numHighlighted, but not the selected cell.
 */
function highlightAll(colour) {
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].querySelector("input").value == numHighlighted &&
            !cells[i].querySelector("input").classList.contains("multiple")) {
            if (cells[i] != selected) {
                cells[i].style.backgroundColor = colour;
            }
        }
    }
}

/*
 * Shade current cell a darker green (only one cell should be this color at
 * a time), iff it is non-static, and remove the dark green from the previously
 * selected cell. Focus the input of the selected cell. If current cell has one
 * value and is not in 'multiple' mode, highlight all cells with the same number
 * on the board.
 */
function select(current) {
    if (selected) {
        selected.style.backgroundColor = "white";
    }
    if (numHighlighted != -1) {
        // all cells of a certain number are highlighted; unhighlight them
        highlightAll("white");
        numHighlighted = -1;
    }
    selected = current;
    if (current.classList.contains("static")) {
        selected.style.backgroundColor = "#D4EFDF";
    } else {
        selected.style.backgroundColor = "#A9DFBF";
    }
    let inputTag = selected.querySelector("input");
    // ensure cursor is at the end of input
    setTimeout(function moveCursorToEnd() {
        let val = inputTag.value;
        inputTag.value = null;
        inputTag.value = val;
        inputTag.focus();
    }, 0);

    if (current.querySelector("input").value.length == 1 &&
        !current.querySelector("input").classList.contains("multiple")) {
        // highlight all cells of this number
        numHighlighted = current.querySelector("input").value;
        highlightAll("#D4EFDF");
    }
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

    if (numHighlighted != -1) {
        // all cells of a certain number are highlighted; unhighlight them
        highlightAll("white");
        numHighlighted = -1;
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
 * Check the solution against what the user has inputted on the board. Briefly
 * change the background colour of each correct cells to green and incorrect
 * cells to red.
 */
function checkBoard() {
    if (numHighlighted != -1) {
        // all cells of a certain number are highlighted; unhighlight them
        highlightAll("white");
        numHighlighted = -1;
    }
    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static")) {
            var inputTag = cells[i].querySelector("input");
            if (!inputTag.classList.contains("multiple") &&
                inputTag.value.length == 1 ) {
                if (inputTag.value == solvedGame[cells[i].id]) {
                    colourShift(cells[i], 125, 65);
                } else {
                    colourShift(cells[i], 359, 65);
                }
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

    if (numHighlighted != -1) {
        // all cells of a certain number are highlighted; unhighlight them
        highlightAll("white");
        numHighlighted = -1;
    }

    for (var i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains("static")) {
            var inputTag = cells[i].querySelector("input");
            inputTag.value = solvedGame[cells[i].id];
        }
    }
}

/*
 * Shift the background colour of element from white (100% lightness) to the
 * hue given with lightTarget lightness, then back to white.
 */
function colourShift(element, hue, lightTarget) {
    let towardsWhite = false;   // the direction of the colour shift
    let lightness = 100;        // start with white
    element.style.backgroundColor = 'hsl('+hue+','+100+'%,'+lightness+'%)';
    let interval = setInterval(function() {
        if (lightness <= lightTarget) {
            towardsWhite = true;    // switch direction of shift
        } else if (towardsWhite && lightness >= 100) {
            clearInterval(interval);    // back to white; colour shift over
        }
        towardsWhite ? lightness++ : lightness--;
        element.style.backgroundColor = 'hsl('+hue+','+100+'%,'+lightness+'%)';
    }, 14);
}
