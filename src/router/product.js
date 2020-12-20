const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator'); // Custom Validation
const adminAuth = require('../middleware/adminAuth');
const Product = require('../models/Product');
const {v4: uuid4} = require('uuid');
const { model } = require('../models/Product');
const clientAuth = require('../middleware/userAuth');
const multerSetup = require('../utils/multerSetup');
const path = require('path')


// @route   Post product/
// @desc    Add Product
// @access  private
router.post('/', [adminAuth, [
                check('name', 'Name Is Required').not().isEmpty(),
                check('description', 'Discription Is Required').not().isEmpty(),
                check('size', 'Size Is Required').not().isEmpty(),
                check('price', 'Price Is Required').isNumeric(),
                check('artist', 'Artist Name is Required').not().isEmpty(),
            ], multerSetup.single('product')], async(req, res) => {
    const errors = validationResult(req.body);
    if(!errors.isEmpty()) 
        return res.status(400).json({errors: errors.array()});

    try {
        const {name, size, price, artist, description} = req.body;
        const product = new Product({name, size, description, price, artist, image: req.file.filename, uuid: uuid4()});
        await product.save();
        res.status(201).send({product, success: true});
    }
    catch(error) {
        res.status(400).json({errors: [{msg: 'Server Error'}]});
    } 
});


// @route   Post product/rating/:uuid
// @desc    Rate Product
// @access  private
router.put('/rating/:uuid', [clientAuth, [
    check('rating', 'Rating is required').isNumeric()
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) 
        return res.status(400).json({errors: errors.array()});

    try {
        // Check Product is Available or not
        const found = await Product.findByUuid(req.params.uuid);
        if(found.error)
            res.status(404).json({errors: [{msg: 'Product Not Found'}]});

        // If found then check client has already reated or not
        const product = found.product;
        let flag = true;
        product.rating.map(item => {
            if(item.client == req.user.id){
                item.rate = req.body.rating;
                flag = false;
            }
        })

        if(flag)
            product.rating.push({client: req.user.id, rate: req.body.rating});
        // Save Product in DB
        await product.save();
        res.status(200).json({product, success: true});
    } catch(error) {
        res.status(500).json({errors: [{msg: 'Server Error'}]});
    }
    
});


// @route   Get product/
// @desc    Get All Product
// @access  private
router.get('/', async(req, res) => {   
    const products = await Product.find({});
    return res.status(200).json({products})
})


// @route   Post product/
// @desc    Rate Product
// @access  private
router.get('/getImage/:imageName', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '../../uploads', req.params.imageName));
});

module.exports = router;
