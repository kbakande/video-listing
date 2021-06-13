const { response } = require("express");
require('dotenv').config()
const cors = require("cors");
const os = require('os')
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { Pool } = require("pg");
const { title } = require("process");
const { url } = require("inspector");
app.use(cors());

app.use(express.static(path.join(__dirname, 'client/build')));

// if (process.env.get('DATABASE_URL')) {
//   DATABASE_URL = 'sqlite:///' + os.path.join(basedir, 'app.db')
// }
// else {
//   DATABASE_URL = process.env['DATABASE_URL']
// }
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const connectionString = `${process.env['DATABASE_URL']}?ssl=disable`;
console.log(connectionString);

const pool = new Pool({
  connectionString,
});

const allVideosQuery = `SELECT * FROM videos`;
const newVideoInsertQuery = `INSERT INTO videos (video_id, title, url, rating) VALUES ($1, $2, $3, $4) RETURNING id`;
const videoByIdQuery = `SELECT * FROM videos WHERE id = $1`;
const videoDeleteQuery = `DELETE FROM videos WHERE id = $1`;

const isValidID = (id) => {
  return !isNaN(id) && id >= 0
};

// GET "/"
app.get("/allVideos", (req, res) => {
  console.log(pool);
  pool.query(allVideosQuery)
    .then(result => {
      console.log(result.rows)
      res.send(result.rows);
    })
});

// POST "/newvideo"
app.use(express.json());
let newVideoID = 1;
let rating = 0;
app.post("/", (req, res) => {
  const addedVideo = req.body;
  const urlValidation = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]+)/;

  if ((addedVideo.hasOwnProperty("title")) && (addedVideo.hasOwnProperty("url")) && (!(addedVideo["title"].toString().trim() === "")) && addedVideo["url"].match(urlValidation)) {

    const video_id = newVideoID++;
    const title = addedVideo["title"];
    const url = addedVideo["url"];


    pool.query(newVideoInsertQuery, [video_id, title, url, rating])
      .then(result => {
        pool.query(allVideosQuery)
          .then(result => {
            res.status(201).send(result.rows)
          })
      }).catch(error => res.status(500).send(error))

  } else {
    res.status(400)
    res.json({
      "result": "failure",
      "message": "Video could not be saved"
    })
  }
});

app.get("/:ID", (req, res) => {
  const videoID = parseInt(req.params.ID);
  if (!isValidID(videoID)) {
    res.status(404).send({ message: "Supplier not found" })
  } else {
    pool.query(videoByIdQuery, [videoID])
      .then(result => {
        if (result.rows.length === 0) {
          res.status(404).send({ message: "Supplier not found" })
        } else {
          res.send({ video_id: result.rows[0]["video_id"] })
        }
      }).catch(error => res.status(500).send(error))
  }
});

app.delete("/:ID", (req, res) => {
  const videoToDelete = req.body[0].id;
  if (!isValidID(videoToDelete)) {
    res.status(404).send({ message: "Video not found" });
  } else {
    pool.query(videoDeleteQuery, [videoToDelete])
      .then(() => {
        pool.query(allVideosQuery)
          .then(result => {
            res.status(201).send(result.rows)
          })
      }).catch(error => res.status(500).send(error))
  }
});

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/client/build/index.html'))
// })

app.listen(port, () => console.log(`Listening on port ${port}`));