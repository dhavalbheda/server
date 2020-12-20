const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../../config/keys');

const userAuth = async(req,res,next) => {
    try{
        const token = req.headers.authorization;      
        const decoded = jwt.verify(token, keys.JWT_TOKEN);
        const user = await User.findOne({_id: decoded.user, 'tokens.token': token});
        
        if(!user) {
                throw new Error();
        }

        req.userToken = token;
        req.user = user;
        next();
    }
    catch(e){
        res.status(401).send({errors: [{msg: 'You Are Not Authorized...'}]});
    }

}

module.exports = userAuth;