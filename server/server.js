const express = require("express");
var multer  = require('multer');
const mysql = require('mysql2/promise');
let i = 0;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root@123',
    database: 'mydatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

var upload = multer({ dest: __dirname + '/public/uploads/480p' });
var type = upload.single('upl');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send("Hello world !")
})

app.post('/video', type, async (req, res) => {
    console.log(req.file);

    const file = req.file;
    const filename = file.originalname;

    const videoId = i++;
    const dateUploaded = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const [rows, fields] = await pool.query('INSERT INTO video_segments (id, filename, dateuploaded) VALUES (?, ?, ?)', [videoId, filename, dateUploaded]);
        console.log(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error inserting data into database");
        return;
    }

    res.status(200);
})

app.listen(8000, ()=> {
    console.log("Server is listening at port: 8000");
})