const express = require("express");
const mongoose = require("mongoose");

const app = express();

const dbUrl =
  "mongodb+srv://mrinalbhattacharya_db_user:PL1UDwCzyLEV9yKi@cluster0.p7o0qqj.mongodb.net/?appName=Cluster0";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello from the Server");
});

app.listen(8002, () => {
  console.log("Server Started");
});
