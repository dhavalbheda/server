const mongoose = require('mongoose') // mongoose package
const validator = require('validator') // Field Validation
const bycypt = require('bcryptjs') // Password encryption
const jwt = require('jsonwebtoken') // Token Generate
const keys = require('../../config/keys') 

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        trim: true,
        required: true
    },
    lastName:{
        type:String,
        trim: true,
        required: true
    },
    email:{
        type:String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error("Invalid Email Address..")
        }
    },
    password: {
        type: String,
        minlength: 6,
        trim:true,
        required: true,
        validate(value){
            if(value.toLowerCase().includes('password'))
                throw new Error('Password Does Not Contain Password')
        }
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    tokens: [{
        token:{
                type:String
        }
    }],
},{
    timestamps: true
})

// Generating Token Before SignUP
userSchema.methods.generateToken = async function() {
    const user = this
    const token = jwt.sign({user: user._id.toString()}, keys.JWT_TOKEN)
    user.tokens = user.tokens.concat({token}) 
    try {
        await user.save()
    } catch(e) {
        console.log(e);
    } 
    return token
}

// For Login
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email})
    if(!user)
        return {errors: [{msg: 'Email Address Not Found'}]}

    const isMatch = await bycypt.compare(password, user.password)
    if(!isMatch)
        return {errors: [{msg: 'Incorrect Password'}]}
    return user
}

//Hash the Plain Text Password Before Save
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password'))
        user.password = await bycypt.hash(user.password, 8)
    next()
})

// Check Email Already Exists or not 
userSchema.statics.checkEmailExists = async(email) => {
    const user = await User.findOne({email});
    if(user)
        return true;
    return false;
}

const User = mongoose.model('User', userSchema)
module.exports = User 