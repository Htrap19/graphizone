const gridFileSchema = require('gridfile');
const mongoose = require('mongoose');

const GridFile = mongoose.model('GridFile', gridFileSchema, 'grid.files');

module.exports.GridFile = GridFile;