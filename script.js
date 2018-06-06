const cells = document.querySelectorAll("#soduko-box td");
var selected = null;

document.body.onkeydown = function (e) {
    if (e.keyCode == 16) {
        if (selected) {
            changeCellState(selected, e)
        }
    }
}

document.body.onclick = function (e) {
    if (selected) {
        selected.querySelector("input").focus();
    }
}

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

function changeCellValue(current, char) {
    if (current.value.length == 1 && !current.classList.contains("multiple")) {
        current.value = char;
    } else if (current.value.length == 4) {
        current.value = current.value.slice(0, -1);
        current.value += char;
    }
}

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

function highlight(current) {
    if (current != selected) {
        current.style.backgroundColor = "#D4EFDF";
    }
}

function unhighlight(current) {
    if (current != selected) {
        current.style.backgroundColor = "white";
    }
}

function select(current) {
    if (selected != null) {
        selected.style.backgroundColor = "white";
    }
    selected = current;
    selected.style.backgroundColor = "#A9DFBF";
}

for (var i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("static")) {
        cells[i].addEventListener('mouseover', function() { highlight(this) });
        cells[i].addEventListener('mouseout', function() { unhighlight(this) });
        cells[i].addEventListener('click', function() { select(this)})
    }
}
