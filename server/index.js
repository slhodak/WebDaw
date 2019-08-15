const express = require('express');
const path = require('path');

const port = 9000;
const app = express();

process.title = 'WebDaw';

app.use(express.static(path.resolve(__dirname, '../client/dist')));
app.use('/client', express.static(path.resolve(__dirname, '../client')));

app.listen(port, () => {
  console.log(`DAW available on port ${port}`);
});
