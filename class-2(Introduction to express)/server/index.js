const express = require("express");

const app = express();

// read a resource - http method - get
// create a resource - http method - post
// update a resource - http method - put , patch
// delete a resource - http method - delete

app.get("/", (req, res) => {
  res.send("This is an Express Server");
});

app.listen(8002, () => {
  console.log("Server Started at port 8002");
});
