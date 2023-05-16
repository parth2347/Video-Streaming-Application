const express = require("express");
var multer  = require('multer');
const mysql = require('mysql2/promise');
const fs = require("fs");
const { Readable } = require('stream');
var path = require('path');
require('dotenv').config()

// Creating a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'mydatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

var storage = multer.diskStorage({
    destination:  __dirname + '/public/uploads/'
});

// Destination path of the uploaded chunks
var upload = multer(storage);
var type = upload.single('upl');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));

const fileStream = fs.createWriteStream(__dirname + '/public/uploads/240/merged.webm', { flags: 'a' });

app.post('/video', type, async (req, res) => {

    const filename = req.file.originalname;
    const videoId = req.body.chunkNumber;

    const webmReadable = new Readable();
    webmReadable._read = () => { };
    webmReadable.push(req.file.buffer);
    webmReadable.push(null);

    const outputWebmStream = fs.createWriteStream( __dirname + `/public/uploads/240/chunk_${videoId}.webm`);
    webmReadable.pipe(outputWebmStream);

    webmReadable.on("end", function() {
        outputWebmStream.end();
    })

    fileStream.write(req.file.buffer);

    const dateUploaded = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        // Inserting info about chunk to database
        const [rows, fields] = await pool.query('INSERT INTO video_segments (id, filename, dateuploaded) VALUES (?, ?, ?)', [videoId, filename, dateUploaded]);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error inserting data into database");
        return;
    }

    res.status(200).send({"uploaded": "Success", "blob_number": videoId});
    res.end();
})

app.get('/close', (req, res) => {
    fileStream.end();
    res.status(200).send({"closed": true})
})

// Get the live status of number of chunks uploaded
app.get('/getStatus', async (req, res, next) => {
    const [rows, fields] = await pool.query('SELECT count(*) as count from video_segments');
    res.send(rows[0]);
    res.end();
})

app.listen(8000, ()=> {
    console.log("Server is listening at port: 8000");
})