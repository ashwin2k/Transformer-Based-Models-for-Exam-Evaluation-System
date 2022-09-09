const express = require("express");
const MongoClient = require('mongodb').MongoClient;
const {spawn} = require("child_process")
var cors = require('cors')
const app = express();
const url = 'mongodb://localhost:27017';
const DB_NAME="exam";
const PORT=3000;
const client = new MongoClient(url);
app.use(cors())

app.post("/predict", (req,res)=>{
    const summary=spawn('/home/local/ZOHOCORP/ashwin-13877/anaconda3/envs/exam/bin/python3',['./python/summary.py',req.query.context]);
    summary.stdout.setEncoding('utf8');
    summary.stdout.on('data', (data)=>{
        console.log(data);
        res.send(data);
    });
    summary.on("error", (err)=>{
        console.log(err)
    })
});


app.listen(PORT, ()=>{
    console.log(`Server started on ${PORT}`);
});