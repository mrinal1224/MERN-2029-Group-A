const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json())

const dbUrl =
  "mongodb+srv://mrinalbhattacharya_db_user:PL1UDwCzyLEV9yKi@cluster0.p7o0qqj.mongodb.net/LMS?appName=Cluster0";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });


  // course Schema


 const courseSchema =  new mongoose.Schema({
     course_name : {
        type : String,
        required: true
     },

     instructor : {
        type : String,
        required:true
     },

     ratings : {
        type : Number
     },

     isPublished : {
        type : Boolean,
        required : true
     }

  })


  // Models - CRUD

  const CourseModel = mongoose.model('course' ,courseSchema )

app.get("/", (req, res) => {
  res.send("Hello from the Server");
});

// Create a Course

app.post('/api/courses' , async (req , res)=>{
    let course = await CourseModel.create({
          course_name : req.body.course_name,
          instructor : req.body.instructor,
          isPublished :req.body.isPublished,
          ratings : req.body.ratings
    })

    res.send('Course Created' , course)
})



app.listen(8002, () => {
  console.log("Server Started");
});
