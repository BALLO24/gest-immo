const Minio = require('minio');
const dotenv = require('dotenv');
const path = require('path');
// Load .env relative to backend folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false, // change en true si tu as configuré https
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

module.exports = minioClient;
