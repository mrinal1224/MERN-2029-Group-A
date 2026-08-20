const mongoose = require('mongoose')



const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },

    price: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    ratings: {
        type: Number
    },

    isInStock: {
        type: Boolean,
        required: true
    }
})

const ProductModel = mongoose.model('product', productSchema)

module.exports = ProductModel