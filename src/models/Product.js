const mongoose = require('mongoose') // mongoose package
const validator = require('validator') // Field Validation
const bycypt = require('bcryptjs') // Password encryption
const jwt = require('jsonwebtoken') // Token Generate
const keys = require('../../config/keys')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        trim: true,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    uuid:{
        type:String,
        trim: true,
        unique: true,
        required: true,
    },
    size: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    artist: {
        type: String,
        required: true
    },
    rating: [
        {
            client: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            rate: {
                type: Number,
                max: 5,
                default: -1
            }
        }
    ]
},{
    timestamps: true
})

// Find Product
productSchema.statics.findByUuid = async (uuid) => {
    const product = await Product.findOne({uuid})

    if(!product)
        return {errors: [{msg: 'Product Not Found'}]}

    return {product, success: true}
}


const Product = mongoose.model('Product', productSchema);
module.exports = Product;
