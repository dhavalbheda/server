const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, 'uploads/'),
    filename: (req, file, callback) => callback(null, Date.now() + path.extname(file.originalname))
})

module.exports = multer({
                    storage,
                    limits: { fileSize: 1000000 * 5 } //5 MB         
                })
