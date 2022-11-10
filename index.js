const express = require('express')
var cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vrrg6hy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized Access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const servicesCollection = client.db('serviceMan').collection('services');
        const reviewsCollection = client.db('serviceMan').collection('reviews');

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.send({ token });
        });

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query).sort({ _id: -1 });
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = ({ _id: ObjectId(id) });
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        app.get('/reviews', verifyJWT, async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/review', async (req, res) => {
            let query = {}
            const cursor = reviewsCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.findOne(query);
            res.send(result);
        });

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        app.patch('/reviews/:id', async (req, res) => {
            const { id } = req.params;
            const result = await reviewsCollection.updateOne({ _id: ObjectId(id) }, { $set: req.body })
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(error => console.log(error))

app.get('/', (req, res) => {
    res.send('Graphics Bari API is running');
});

app.listen(port, () => {
    console.log(`Graphics Bari server is Running on ${port}`);
})