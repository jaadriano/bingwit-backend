'use strict';

const AWS                = require('aws-sdk');
const multer             = require('multer')
const fs                 = require('fs');
const config             = require('../config/configuration');


exports.upload = async (req, res) => {
  let id = res.locals.data.id;
  let filename;

  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, config.s3.directory);
    },
    filename: (req, file, callback) => {
      filename = file.originalname;
      callback(null, file.originalname);
    }
  });

  const uploadFile = multer({storage}).single('file');
  
  uploadFile(req, res, (err) => {
    if (err) return ReE (res, err, 500);
    let s3bucket = new AWS.S3({
      accessKeyId: config.s3.iam_user_key,
      secretAccessKey: config.s3.iam_user_secret,
      Bucket: config.s3.bucket_name,
    });
    fs.readFile(config.s3.directory+filename, (err, file) => {
      if(!file) return ReE (res, err, 500);
      s3bucket.createBucket(() => {
        let params = {
          Bucket: config.s3.bucket_name,
          Key: id+Date.now().toString(),
          Body: file,
          ACL:'public-read-write'
        };
        s3bucket.upload(params, (err, data) => {
          if (err) return ReE (res, err, 500);
          if (data) {
            /* delete file from local filesystem */
            fs.unlink(config.s3.directory+filename, (err) => {
              if (err) return ReE (res, err, 500);
              // if no error, file has been deleted successfully
              console.log(data)
              return ReS (res, {message: 'Successfully uploaded.', url: data.Location}, 200);
            });
          }
        });
      });
    });
  });
}
