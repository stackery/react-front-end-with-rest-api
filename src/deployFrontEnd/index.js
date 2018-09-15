const { execFile } = require('child_process');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const path = require('path');

const AWS = require('aws-sdk');

const s3 = new AWS.S3();
exports.handler = async message => {
  console.log(message);
  const tmpDir = `/tmp/react-front-end${process.pid}`;
  const npm = 'npm';
  await spawnPromise('rm', ['-rf', tmpDir]);
  await spawnPromise('mkdir', [tmpDir]);
  await spawnPromise('cp', ['-R', 'front-end/', tmpDir]);
  await spawnPromise(
    npm,
    ['--production',
      '--no-progress',
      '--loglevel=error',
      '--cache', path.join('/tmp', 'npm'),
      '--userconfig', path.join('/tmp', 'npmrc'),
      'install'
    ],
    {cwd: tmpDir}
  );
  await spawnPromise(
    npm,
    ['--production',
      '--no-progress',
      '--loglevel=error',
      '--cache', path.join('/tmp', 'npm'),
      '--userconfig', path.join('/tmp', 'npmrc'),
      'run', 'build'
    ],
    {cwd: tmpDir}
  );

  const fh = await readFile(`${tmpDir}/build/index.html`);
  console.log(fh);

  const params = {
    ACL: 'public-read',
    Body: fh,
    Bucket: process.env.BUCKET_NAME,
    Key: 'index.html'
  };
  console.log(params);
  const s3Response = await s3.putObject(params).promise();
  console.log(s3Response);

  return {};
};

function spawnPromise (command, args, options) {
  console.log(`Running \`${command} '${args.join("' '")}'\`...`);

  options = options || {};

  if (!options.env) {
    options.env = {};
  }

  Object.assign(options.env, process.env);

  return new Promise((resolve, reject) => {
    execFile(command, args, options, (err, stdout, stderr) => {
      console.log('STDOUT:');
      console.log(stdout);
      console.log('STDERR:');
      console.log(stderr);

      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;

        reject(err);
      } else {
        resolve({stdout: stdout, stderr: stderr});
      }
    });
  });
}
