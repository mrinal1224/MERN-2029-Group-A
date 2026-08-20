const express = require('express')

const {createProduct , getAllProducts , updateProduct} = require('../controllers/productControllers.js')


const router = express.Router()


router.get('/getAllproducts' , getAllProducts)


router.post('/create', createProduct)


router.put('/update/:id' , updateProduct)

// router.delete()

module.exports = router