const express = require('express');
const app = express();

require('./startup/db')();
require('./startup/routes')(app);

const PORT = process.env.PORT || 6420;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`); });