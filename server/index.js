const express = require('express');
const path = require('path');

const port = 9000;
const app = express();

app.use(express.static(path.resolve(__dirname, '../client/dist')));
app.use('/src', express.static(path.resolve(__dirname, '../client/src')));

app.listen(port, () => {
  console.log(`DAW available on port ${port}`);
});
