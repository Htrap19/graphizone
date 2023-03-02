const multer = require('multer');
const path = require('path');
const {upload, resizeImage} = require('../services/image');
const {validateId} = require('../middleware/validateParam');
const {Router} = require('express');
const router = Router();
const multerUpload = multer({ dest: path.join(__dirname, '../temp-files') });

router.post('/', multerUpload.any(), upload);
router.get('/resize/:id/:width/:height', validateId, resizeImage);

module.exports = router;