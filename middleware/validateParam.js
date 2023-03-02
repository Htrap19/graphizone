const mongoose = require('mongoose');

function validateParam(param) {
    return (req, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params[param]))
            return res.status(400).json(`${param} invalid objectId`);

        next();
    }
}

module.exports.validateParam = validateParam;
module.exports.validateId = validateParam('id');