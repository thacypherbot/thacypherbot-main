const express = require('express');
const app = express();

const port = process.env.PORT ?? 3333;
app.use('/public', express.static('public'));
app.get('/', (_, res) => res.end('Hello World!'));
app.listen(port, () => console.log(`Listening on port ${port}.`));

module.exports = app;
