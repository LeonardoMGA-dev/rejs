import express from 'express';
import ejs from 'ejs';
import App from './public/utils/App.js';
import components from './public/utils/components.js';
import Component from './public/utils/Component.js';


const app = express();

app.use(express.static('public'));

app.get('/', async (req, res) => {
    // render asynchronously
    const app = new App({ components, ejs, isServer: true });
    const html = await app.render('Index', {});
    res.send(html);
});

app.get('/random', async (req, res) => {
    // create a random list of numbers
    const data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
    res.json(data);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});