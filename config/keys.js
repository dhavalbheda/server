process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

if(process.env.NODE_ENV === 'dev') {
    module.exports = require('./dev')   
} else {
    module.exports = require('./production')
}