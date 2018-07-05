var express = require("express");
var games = require("./public/sudoku-games.json");
var app = express();

app.use(express.static("./public"));
app.listen(3000);

console.log("server started");
