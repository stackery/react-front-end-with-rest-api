const { spawn } = require('child_process');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const AWS = require('aws-sdk');
const s3 = AWS.s3;

exports.handler = async message => {
  console.log(message);
  const ret = await spawn('npm', ['run', 'build'], {'cwd': 'front-end'});
  console.log(ret);

  var params = {
    Body: await readFile('./front-end/build/index.html'),
    Bucket: process.env.BUCKET_NAME,
    Key: 'index.html'
  };
  console.log(params);
  const s3Response = await s3.putObject(params).promise();
  console.log(s3Response);

  return {};
};
