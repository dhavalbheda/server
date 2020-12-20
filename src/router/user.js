const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator'); // Custom Validation
const userAuth = require('../middleware/userAuth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');

// @route   Post user/signup
// @desc    Register user
// @access  Public
router.post('/signup', [
                check('firstName', 'First Name Is Required').not().isEmpty(),
                check('lastName', 'Last Name Is Required').not().isEmpty(),
                check('email', 'Email Address Is Invalid').isEmail(),
                check('password', 'Password Minimum 6 Character Required.').isLength({min: 6}),
            ], async(req, res) => {
    // Check Pre-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});

    // Check Email Exists Or Not
    const exists = await User.checkEmailExists(req.body.email);
    if(exists)
        return res.status(400).json({errors: [{msg: 'Email Already Exists.'}]});
    
    // Saving And Generating Token
    try {
        const user = new User(req.body);
        const token = await user.generateToken();
        res.status(201).send({user, token});
    }
    catch(error) {
        if(error.code === 11000)
            res.status(400).json({errors: [{msg: 'Email Already Exists'}]});
        res.status(400).json(error);
    } 
})

// @route   Post user/signup
// @desc    Login user
// @access  Public
router.post('/signin', [
        check('email', 'Email Address Is Invalid').isEmail(),
        check('password', 'Password Minimum 6 Character Required.').isLength({min: 6})
    ], async(req, res) => {

    // Check Pre-Validations
    const errors = validationResult(req);
    if(!errors.isEmpty()) 
        return res.status(400).json({errors: errors.array()});
        
    const { email, password } = req.body;
    try {
        const user = await User.findByCredentials(email, password);
        if(user.errors)
            return res.status(400).json({errors: user.errors})  
        
        // Generate Token
        const token = await user.generateToken()
        res.status(200).json({user, token})
    } catch(error) {
        res.status(400).json(error)
    }
})


// @route   Get user/profile/all
// @desc    Get All user
// @access  Private
router.get('/profile/all', userAuth, async(req, res) => {
    const users = await User.find({});
    return res.status(200).json({users: users})
})

// @route   Post user/logout
// @desc    Logout user
// @access  Private
router.put('/logout', userAuth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(item => item.token !== req.userToken);
        await req.user.save();
        return res.status(200).json({success: true, error: false, msg: 'Logout Successfully...'});
    } catch (e) {
        return res.status(500).json({errors: [{msg: 'Server Error.'}]});
    }
})

// @route   Get user/profile
// @desc    Get user Profile
// @access  Private
router.get('/profile', userAuth, async(req, res) => {
    return res.status(200).json({user: req.user})
})

// @route   Put user/profile
// @desc    Update user
// @access  Private
router.put('/profile', [ userAuth, [
    check('firstName', 'First Name Is Required').not().isEmpty(),
    check('lastName', 'Last Name Is Required').not().isEmpty(),
    check('email', 'Email Address Is Invalid').isEmail(),
]], async(req, res) => {
    // Check Pre-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
    if(req.body.password === "")
        delete req.body.password;

    // Check Updated Email Already Exists Or Not
    if(req.user.email !== req.body.email) {
        const exists = await User.checkEmailExists(req.body.email);
        if(exists)
            return res.status(400).json({errors: [{msg: 'Email Already Exists.'}]});
    }
    try {
        // Updating user Profile
        Object.keys(req.body).forEach(key => req.user[key] = req.body[key]);

        // Updating User In Database
        await req.user.save();
        return res.status(200).json({user: req.user, success: true});
    } catch(error) {
        return res.status(500).json({success: false, errors: [{msg: 'Server Error'}]});
    }
})

module.exports = router;