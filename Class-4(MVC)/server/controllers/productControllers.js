const ProductModel = require('../models/ProductModel.js')




exports.createProduct = async function (req, res) {
     let product = await ProductModel.create({
          product_name: req.body.product_name,
          price: req.body.price,
          description: req.body.description,
          isInStock: req.body.isInStock,
          ratings: req.body.ratings
     })

     console.log(product)

     res.send('Product created')
}

exports.getAllProducts = async function (req, res) {
     let products = await ProductModel.find()
     res.send(products)
}

exports.updateProduct = async function (req, res) {
     await ProductModel.findByIdAndUpdate(req.params.id, req.body)
     res.status(202).json({message : 'prouduct updated'})
}

// Delete