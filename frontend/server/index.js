const express = require('express')
const app = express();
const proxy = require('express-http-proxy');

const runForeignTests = require('./middleware/runForeignTests');

app.use('/tools', proxy('http://172.31.32.45:3001'));
app.post('/run', async (req, res) => {
    try {
        const json = await runForeignTests();
        res.json(json);
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get('/', (req, res) => res.send('Hello NullPointerException!!!'))

app.listen(3001, () => console.log('Example app listening on port 3001!'))