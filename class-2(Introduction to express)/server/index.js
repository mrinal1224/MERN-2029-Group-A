const express = require("express");

const app = express();

// read a resource - http method - get
// create a resource - http method - post
// update a resource - http method - put , patch
// delete a resource - http method - delete

const courses = [
  { id: 1, courseName: "Java", instructor: "Priyansh" },
  { id: 2, courseName: "Python", instructor: "Aadrita" },
  { id: 3, courseName: "DBMS", instructor: "Vinayak" },
];

app.get("/courses", (req, res) => {
  res.send(courses);
});

app.get("/courses/:id", (req, res) => {
  let course = courses.find((course) => course.id === parseInt(req.params.id));
  res.send(course);
});

// get a unique course

app.listen(8004, () => {
  console.log("Server Started at port 8004");
});
