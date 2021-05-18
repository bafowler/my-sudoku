var express = require("express");
var app = express();

app.use(express.static("./public"));
app.listen(3000);

console.log("local server started on port 3000");
