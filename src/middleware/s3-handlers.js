const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const fileStorage = multerS3({
    s3,
    acl: "private",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "attachment",
    bucket: process.env.S3_BUCKET,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const fileName = `${req.user.email}/${new Date().getTime()}-${
            file.originalname
        }`;
        cb(null, fileName);
    },
});

const uploadFileToS3 = multer({ storage: fileStorage }).single("file");

const getFileFromS3 = async (req, res, next) => {
    const Key = req.query.key;

    try {
        const { Body } = await s3
            .getObject({
                Key,
                Bucket: process.env.S3_BUCKET,
            })
            .promise();

        req.fileBuffer = Body;
        next();
    } catch (err) {
        res.status(404).send({
            code: 404,
            message: "File not found",
        });
    }
};

const deleteFileFromS3 = async (req, res, next) => {
    const Key = req.body.key;

    try {
        await s3
            .deleteObject({
                Key,
                Bucket: process.env.S3_BUCKET,
            })
            .promise();

        next();
    } catch (err) {
        res.status(404).send({
            code: 404,
            message: "File not found",
        });
    }
};
module.exports = { uploadFileToS3, getFileFromS3, deleteFileFromS3 };
