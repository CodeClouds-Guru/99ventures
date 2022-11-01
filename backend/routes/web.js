const express = require('express')
const router = express.Router()
router.get('/', (req, res) => {
  res.status(200).send('99ventures backend')
})

router.all('/test', async (req, res) => {
  const AWS = require('aws-sdk')
  const ArchieverClass = require("../helpers/Archiever");
  const archiver = new ArchieverClass('testzip');
  let prefix = 'CodeClouds/1/file-manager/xyz/aaa/';
  let s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
    signatureVersion: "v4"
  })
  const objects = await s3.listObjectsV2({
    Bucket: process.env.S3_BUCKET_NAME,
    Delimiter: '/',
    Prefix: prefix
  }).promise()
  var flag = false;
  if ('Contents' in objects && objects.Contents.length > 0) {
    for (let obj of objects.Contents) {
      if (obj.Key.substr(-1) !== '/') {
        const s3FileName = obj.Key.replace(prefix, '')
        let s3File = await s3.getObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: obj.Key
        }).promise()
        console.log(s3File)
        if ('Body' in s3File) {
          flag = true;
          archiver.append(s3File.Body, s3FileName)
        }
      }
    }
  }
  if (flag) {
    archiver.finalize();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=files.zip");
    archiver.zip.pipe(res);
  } else {
    res.json({
      status: false,
      message: 'No file to archieve'
    })
  }
});

module.exports = {
  prefix: '/',
  router,
}
