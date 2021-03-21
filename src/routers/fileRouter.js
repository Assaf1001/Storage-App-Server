const express = require("express");
const auth = require("../middleware/auth");
const { Readable } = require("stream");
const {
    uploadFileToS3,
    deleteFileFromS3,
    getFileFromS3,
} = require("../middleware/s3-handlers");
const File = require("../models/fileModel");

const router = new express.Router();

router.post("/files", auth, uploadFileToS3, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(422).send({
                status: 422,
                message: "File not uploaded",
            });
        }

        const file = new File({
            originalName: req.file.originalname,
            storageName: req.file.key.split("/")[1],
            bucket: process.env.S3_BUCKET,
            region: process.env.AWS_REGION,
            key: req.file.key,
            location: req.file.location,
            type: req.file.originalname.split(".")[1],
            owner: req.user._id,
        });

        await file.save();
        res.status(201).send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/files", auth, async (req, res) => {
    try {
        await req.user.populate({ path: "files" }).execPopulate();
        if (!req.user.files) return res.send([]);

        res.send(req.user.files);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/file", auth, getFileFromS3, async (req, res) => {
    const fileName = req.query.name;
    const stream = Readable.from(req.fileBuffer);
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    try {
        const isUserOwnFile = req.user._id == req.query.owner;
        if (!isUserOwnFile) {
            res.status(400).send({
                status: 400,
                message: "Cannot download",
            });
        }

        stream.pipe(res);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete("/files", auth, deleteFileFromS3, async (req, res) => {
    try {
        await File.findByIdAndDelete(req.body.id);
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
