const express = require('express');
const Gateway = require('micromq/gateway');
const multer  = require('multer');
const fs = require('fs');
const {nice: slugidNice} = require('slugid');

const OUTPUT_DIR = 'uploads'
const SERVICES = ['convert']
const ORIGINAL_NAME = 'original'

// TODO: move to service test
const checkFileExtension = (mimetype) => {
  switch (mimetype) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/gif':
      return 'gif'
    // case 'image/svg+xml':
    //   return 'svg'
  }
}

// TODO: move to service
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const slug = slugidNice();
    const extension = checkFileExtension(file.mimetype)
    const path = `${__dirname}/${OUTPUT_DIR}/${slug}`

    file.slug = slug
    file.extension = extension

    fs.open(path, err => {
      err ? fs.mkdirSync(path, { recursive: true }) : path
      return cb(null, path)
    })
  },
  filename: (req, file, cb) => {
    const extension = checkFileExtension(file.mimetype)
    cb(null, `${ORIGINAL_NAME}.${extension}`)
  }
})

const upload = multer({storage})
const gateway = new Gateway({
  microservices: SERVICES,
  rabbit: {
    url: 'amqp://guest:guest@rabbitmq:5672',
    // url: process.env.MESSAGE_QUEUE
  },
});

const app = express();
app.use(gateway.middleware());

app.get('/', async (req, res) => {
  res.json({
    ok: true,
    status: 200
  })
});

app.post('/convert', upload.single('image'), async (req, res) => {
  req.body.file = req.file
  await res.delegate('convert');
});

app.listen(process.env.PORT || 3090);
