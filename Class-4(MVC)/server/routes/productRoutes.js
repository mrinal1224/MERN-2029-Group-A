const express = require('express')
const ProductModel = require('../models/ProductModel.js')


const router = express.Router()


// router.get('/getAllproducts' , (req , res)=>{
//     res.send()
// })


router.post('/create' , async (req , res)=>{
   let product = await ProductModel.create({
        product_name : req.body.product_name,
        price : req.body.price,
        description: req.body.description,
        isInStock : req.body.isInStock,
        ratings : req.body.ratings  
     })

     console.log(product)

     res.send('Product created')
})


// router.put('/update')

// router.delete()

module.exports = router