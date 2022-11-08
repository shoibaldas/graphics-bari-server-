const express = require('express')
const app = express();
var cors = require('cors');
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Graphics Bari API is running');
});

app.listen(port, () => {
    console.log(`Graphics Bari server is Running on ${port}`);
})