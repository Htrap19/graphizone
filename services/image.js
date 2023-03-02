const {GridFile} = require('../models/gridfile');
const fs = require('fs');
const {rm} = require('fs').promises;
const Jimp = require('jimp');
const {Readable, Writable} = require("stream");
const _ = require('lodash');
const path = require("path");

class BufferStream extends Readable {
    constructor(buffer) {
        super();
        this.buffer = buffer;
    }

    _read () {
        this.push(this.buffer);
        this.push(null);
    }
}

class WriteStream extends Writable {
    constructor() {
        super();
        this.accumulator = [];
    }

    _write(chunk, encoding, callback) {
        this.accumulator.push(chunk);
        callback();
    }

    getBuffer () {
        return Buffer.concat(this.accumulator);
    }
}

module.exports.upload = async function(req, res, next) {
    // TODO: It should be only types(png, jpeg, bmp, tiff, gif) -> From Jimp
    if (!req.files || req.files.length <= 0)
        return res.status(400).json("Please select file to upload!");

    const uploadedFiles = [];
    const promises = req.files.map(async file => {
        try {
            const image = await Jimp.read(file.path);
            const newImage = new GridFile({ filename: file.originalname });
            newImage.metadata = {
                width: image.getWidth(),
                height: image.getHeight()
            };

            const stream = new BufferStream(await image.getBufferAsync(Jimp.MIME_JPEG));
            const updatedImage = await newImage.upload(stream);
            uploadedFiles.push(updatedImage);
        } catch (ex) {
            next(ex);
        } finally {
            fs.unlinkSync(file.path);
        }
    });

    await Promise.all(promises);

    res.json(uploadedFiles);
}

module.exports.resizeImage = async function(req, res, next) {
    const {width, height} = req.params;
    const imageFromDB = await GridFile.findById(req.params.id);
    if (!imageFromDB)
        return res.status(404).json("Image not found!");

    const filePath = path.join(__dirname, "../temp-files", `/${imageFromDB.filename}`);
    try {
        const stream = new WriteStream();
        await imageFromDB.download(stream);

        const image = await Jimp.read(stream.getBuffer());
        await image
            .resize(parseInt(width), parseInt(height))
            .writeAsync(filePath);

        const readStream = fs.createReadStream(filePath);
        res.attachment(imageFromDB.filename);
        readStream.pipe(res);
    } catch (ex) {
        next(ex);
    } finally {
        await rm(filePath);
    }
}
