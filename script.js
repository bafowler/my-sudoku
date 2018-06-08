// every cell in the soduko game, including static AND non-static
const cells = document.querySelectorAll("#soduko-box td");
// the cell currently selected (clicked) by the user
var selected = null;

// unfocus selected cell when user clicks outside of soduko board
window.onclick = function (e) {
    if (e.target.tagName != "INPUT") {
        if (selected) {
            selected.style.backgroundColor = "white";
            selected.querySelector("input").blur();
            selected = null;
        }
    }
}

// switch between single/multiple mode for the selected cell's input
// using shift key
document.body.onkeydown = function (e) {
    if (e.keyCode == 16) {
        if (selected) {
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

// on user confirm, clear the soduko board of all user input
function clearBoard() {
    if (confirm("Are you sure you'd like to clear the board?")) {
        for (var i = 0; i < cells.length; i++) {
            if (!cells[i].classList.contains("static")) {
                let cellInput = cells[i].querySelector("input");
                cellInput.classList.remove("multiple");
                cellInput.setAttribute("maxlength", 1);
                cellInput.value = "";
            }
        }
    }
}

// add behaviours to all non-static cells
for (var i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("static")) {
        cells[i].addEventListener('mouseover', function() { highlight(this) });
        cells[i].addEventListener('mouseout', function() { unhighlight(this) });
        cells[i].addEventListener('click', function() { select(this)})
    }
}
