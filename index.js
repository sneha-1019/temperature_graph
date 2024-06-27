const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);
const dbName = 'temp-inp';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.post('/tempinp', function(req, res) {
    let a = req.body.temp;
    let now = new Date();
    
    // Convert to IST
    const hrs = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const sec = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hrs}:${min}:${sec}`;

    async function main() {
        try {
            await client.connect();
            console.log('Connected successfully to server');
            const db = client.db(dbName);
            const collection = db.collection('inputs');
            await collection.insertOne({
                "Temperature": a,
                "Time": timeString
            });
            console.log('Data inserted successfully.');
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }
    
    main()
        .then(() => res.redirect('/'))
        .catch(err => res.status(500).send('Error processing request.'));
});

app.get('/view', (req, res) => {
    async function main() {
        try {
            await client.connect();
            console.log('Connected successfully to server');
            const db = client.db(dbName);
            const collection = db.collection('inputs');
            let data = await collection.find({}).toArray();
            let xVal = data.map(item => item.Time);
            let yVal = data.map(item => item.Temperature);
            res.render('view', { xVal, yVal});
        } catch (err) {
            console.error(err);
            res.status(500).send('Error connecting to the database.');
        } finally {
            await client.close();
        }
    }
    
    main().catch(console.error);
});

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});