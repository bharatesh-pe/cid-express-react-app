
const express = require('express');
const templateDataController = require('../controllers/templateDataController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const {
    insertDataValidation,
    updateDataValidation,
    gwtDataValidation,
    paginateDataValidation,
} = require('../validations/templateDataValidation');
const { userSendResponse } = require('../services/userSendResponse');
const jwt = require("jsonwebtoken");
require('dotenv').config();

const eitherAuthMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Decode the token without verification to inspect its payload
        const decoded = jwt.decode(token);

        // Check if it's a user or admin token
        if (decoded?.user_id) {
            // Handle user authentication
            await new Promise((resolve, reject) =>
                userAuthMiddleware(req, res, err => (err ? reject(err) : resolve()))
            );
            return next();
        } else if (decoded?.admin_user_id) {
            // Handle admin authentication
            await new Promise((resolve, reject) =>
                adminAuthMiddleware(req, res, err => (err ? reject(err) : resolve()))
            );
            return next();
        } else {
            return res.status(401).json({ error: "Invalid token payload." });
        }
    } catch (error) {
        return res.status(400).json({ error: "Invalid token." });
    }
};

const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express Router
const router = express.Router();



// AWS S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    ...(process.env.S3_ENDPOINT && {
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
    }),
});

// Multer Configuration
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME,
        contentType: (req, file, cb) => {
            cb(null, file.mimetype); // Set correct MIME type
        },
        key: (req, file, cb) => {
            const fileExtension = path.extname(file.originalname);
            const uniqueFileName = `template/${file.fieldname}_${Date.now()}_${uuidv4()}${fileExtension}`;
            cb(null, uniqueFileName); // Generate unique key for S3
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.png', '.pdf', '.docx', '.doc', '.xls', '.xlsx'];
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',//docx
            'application/msword', // .doc
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        ];

        if (!allowedExtensions.includes(path.extname(file.originalname))) {
            req.fileValidationError = 'File extension is not allowed';
            return cb(null, false);
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
            req.fileValidationError = 'File type is not allowed';
            return cb(null, false);
        }
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
});




// router.post(
//     '/insertTemplateData',
//     // userAuthMiddleware, // Middleware to check user authentication

//     eitherAuthMiddleware,
//     (req, res, next) => {
//         // Dynamically decide whether to use file upload middleware based on request
//         if (req.is('multipart/form-data')) {
//             upload.any()(req, res, (err) => {
//                 if (err) {
//                     console.error('Error during file upload:', err);
//                     return res
//                         .status(400)
//                         .json(
//                             userSendResponse(false, req, 'File upload failed', err)
//                         );
//                 }
//                 next();
//             });
//         } else {
//             // If not multipart/form-data, skip the file upload step
//             next();
//         }
//     },
//     [insertDataValidation], // Validation for input data
//     templateDataController.insertTemplateData // Controller to handle the request
// );



router.post(
    '/insertTemplateData',
    // eitherAuthMiddleware,
    (req, res, next) => {
        if (req.is('multipart/form-data')) {
            upload.any()(req, res, (err) => {
                if (err) {
                    console.error('Error during file upload:', err);
                    return res.status(400).json(
                        userSendResponse(false, req, 'File upload failed', err)
                    );
                }
                next();
            });
        } else {
            next();
        }
    },
    [insertDataValidation],
    templateDataController.insertTemplateData
);



router.post('/updateTemplateData',
    // userAuthMiddleware,
    // eitherAuthMiddleware,
    (req, res, next) => {
        // Dynamically decide whether to use file upload middleware based on request
        if (req.is('multipart/form-data')) {
            upload.any()(req, res, (err) => {
                if (err) {
                    console.error('Error during file upload:', err);
                    return res
                        .status(400)
                        .json(
                            userSendResponse(false, req, 'File upload failed', err)
                        );
                }
                next();
            });
        } else {
            // If not multipart/form-data, skip the file upload step
            next();
        }
    },
    templateDataController.updateTemplateData)
router.post('/deleteTemplateData',
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    templateDataController.deleteTemplateData)
router.post('/deleteFile',
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    templateDataController.deleteFileFromTemplate)


router.post('/getTemplateData',
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    [gwtDataValidation],
    templateDataController.getTemplateData)

router.post('/viewTemplateData',
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    [gwtDataValidation],
    templateDataController.viewTemplateData)
router.post('/viewMagazineTemplateData',
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    [gwtDataValidation],
    templateDataController.viewMagazineTemplateData)
// router.post('/get/:table_name', userAuthMiddleware, templateDataController.getTemplateData);

router.post('/paginateTemplateData',
    // adminAuthMiddleware,
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    [paginateDataValidation],
    templateDataController.paginateTemplateData)
router.post('/paginateTemplateDataForOtherThanMaster',
    // adminAuthMiddleware,
    // eitherAuthMiddleware,
    // userAuthMiddleware,
    // [paginateDataValidation],
    templateDataController.paginateTemplateDataForOtherThanMaster)


router.post('/downloadExcelData',
    // userAuthMiddleware,

    templateDataController.downloadExcelData)

router.post('/fetchAndDownloadExcel',
    // userAuthMiddleware,



    templateDataController.fetchAndDownloadExcel)


router.post('/downloadDocumentAttachments/:profile_attachment_id',
    // userAuthMiddleware,

    templateDataController.downloadDocumentAttachments)


router.post('/getEventsByOrganization',
    // userAuthMiddleware,

    templateDataController.getEventsByOrganization)


router.post('/getEventsByLeader',
    // userAuthMiddleware,

    templateDataController.getEventsByLeader)




module.exports = router;