const images = require('../routes/images');
const error = require('../middleware/error');
const express = require("express");

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/images', images);

    // Error middleware
    app.use(error);
}
