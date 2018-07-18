// every cell in the sudoku game, including static AND non-static
const cells = document.querySelectorAll("#sudoku-box td");
// the cell currently selected (clicked) by the user
var selected = null;

// load in the default easy game on page load
window.onload = function (e) {
    let gameRequest = new XMLHttpRequest();
    gameRequest.open('GET', 'sudoku-games.json');
    gameRequest.send();
    gameRequest.onreadystatechange = function () {
        if (gameRequest.readyState == 4) {
            loadGame(JSON.parse(gameRequest.responseText)[0]);
        }
    }
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
            selected.style.backgroundColor = "white";
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
            console.log(selected)
            changeCellState(selected, e)
        }
    }
}

// ensure correct input is focused when its container cell is clicked
document.body.onclick = function (e) {
    if (selected) {
        selected.querySelector("input").focus();
    }
}

// load in the sudoku game on the clearBoard
function loadGame(game) {
    for (let i = 0; i < game.cells.length; i++) {
        var cellData = game.cells[i];
        var cell = document.getElementById(cellData.id);
        cell.classList.toggle("static");
        var inputTag = cell.querySelector("input");
        inputTag.setAttribute("readonly", true);
        inputTag.setAttribute("value", cellData.value);
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
    if (selected) {
        selected.style.backgroundColor = "white";
    }
    selected = current;
    selected.style.backgroundColor = "#A9DFBF";
}

// clear the sudoku board of all user input
function clearBoard() {
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

// add behaviours to all non-static cells
for (var i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("static")) {
        cells[i].addEventListener('mouseover', function() { highlight(this) });
        cells[i].addEventListener('mouseout', function() { unhighlight(this) });
        cells[i].addEventListener('click', function() { select(this)})
    }
}
