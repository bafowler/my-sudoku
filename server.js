var http = require("http");
var fs = require("fs");
var path = require("path");

http.createServer(function(req, res) {
    if (req.url === "/") {
        fs.readFile("./index.html", "UTF-8", function (err, html) {
            if (err) throw err;
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        })
    } else if (req.url.match(/.css$/)) {
        let cssPath = path.join(__dirname, req.url);
        let stream = fs.createReadStream(cssPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/css"});
        stream.pipe(res);
    } else if (req.url.match(/.js$/)) {
        let jsPath = path.join(__dirname, req.url);
        let stream = fs.createReadStream(jsPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/js"});
        stream.pipe(res);
    } else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("File not found");
    }
}).listen(3000);

console.log("server started");
