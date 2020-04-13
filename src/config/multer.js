const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if(err) cb(err);

        file.key = `${hash.toString('hex')}-${file.originalname}`;
        
        cb(null, file.key ); //null pq não tem erro
      })
    },
  }),

  s3: multerS3({
    s3: new aws.S3(), //ve as varaveis de ambiente
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if(err) cb(err);
        //aki não precisaa do file.key pois ele faz automaticamente
        const fileName = `${hash.toString('hex')}-${file.originalname}`;
       
        cb(null, fileName); //null pq não tem erro
      });
    },
  })
}

module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits:{ 
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
    ];
    if(allowedMimes.includes(file.mimetype)){
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }

}