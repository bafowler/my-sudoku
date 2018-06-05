const cells = document.querySelectorAll("#soduko-box td");
var selected = null;

function validateInput(current, event) {
  if (!current.hasAttribute("readonly")) {
    var char = String.fromCharCode(event.keyCode);
    if(isNaN(char)) {
      return false;
    }
    current.value = char;
    return true;
  }
  return false;
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
