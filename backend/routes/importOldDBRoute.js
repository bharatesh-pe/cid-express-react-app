const express = require('express');
const router = express.Router();
const importOldDBController = require('../controllers/importOldDBController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/import-old-data', upload.single('file'), importOldDBController.import_old_data)
module.exports = router;