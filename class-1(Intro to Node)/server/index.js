const http = require("http");

const myServer = http.createServer((req, res) => {
   res.end('Hello From My Server')
});

myServer.listen(8001, () => {
  console.log("Server started at port 8001");
});
