const express = require('express')
const mongoose = require('mongoose')
const productRoutes = require('./routes/productRoutes.js')

require('dotenv').config()



const app = express()
app.use(express.json())

app.use('/api/products', productRoutes)



mongoose
  .connect(process.env.dbUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });


// Products  






app.get('/', (req, res) => {
  res.send('Hello from the Server')
})


app.listen(8006, () => {
  console.log("server Started")
})