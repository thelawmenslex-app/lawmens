const multer = require('multer');

const Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public');
        //define storage for upload file in local file system
        // and store that in storage variable
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
        //define name for uploading file in server(system)
    },
});
const upload = multer({ storage: Storage }).single('banner');
module.exports = { upload };
