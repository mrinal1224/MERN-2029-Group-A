const express = require("express");

const app = express();

app.use(express.json())

// read a resource - http method - get


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
  if(!course) res.status(404).send('The Course Does not exist')

  res.send(course);

  
});

// create a resource - http method - post

app.post('/courses' , (req , res)=>{
    courses.push(req.body)
    res.send('Course Created')
    // We have to improve this
})

 








// update a resource - http method - put , patch
// delete a resource - http method - delete




// get a unique course

app.listen(8004, () => {
  console.log("Server Started at port 8004");
});
