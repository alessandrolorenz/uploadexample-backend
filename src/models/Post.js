const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const  { promisify } = require('util'); //fs usa forma js antiga sincrona

const s3 = new aws.S3();
  //new aws.S3({
  //   accessKeyId:'xxxxxxxxxxx',
  //   secretAccessKey: 'idwx4'
  // })

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PostSchema.pre('save', function() {
  // sem arrow func pq precisa do this(envia a instancia pelo post atraves do this)
  if(!this.url) {
    this.url=`${process.env.APP_URL}/files/${this.key}`
  }
});

PostSchema.pre('remove', function() {
  if(process.env.STORAGE_TYPE ==='s3') {
    console.log(process.env.BUCKET_NAME);
    
    return s3.deleteObject({
      Bucket: process.env.BUCKET_NAME,
      Key: this.key,
    }).promise()
  } else {
    return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key))
  }

})

module.exports = mongoose.model('Post', PostSchema);