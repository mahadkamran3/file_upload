const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {
      console.log('Destination function called');
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      console.log('Filename function called');
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Received a request');
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    console.log('File uploaded:', req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log('Cloudinary upload result:', result);
    res.status(200).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
    });
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.log('Error during file upload:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}.\nClosing HTTP server...`);
  server.close(() => {
    mongoose.connection.close(() => {
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
