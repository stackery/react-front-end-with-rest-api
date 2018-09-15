const { execFile } = require('child_process');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const path = require('path');

const AWS = require('aws-sdk');
const s3 = AWS.s3;

exports.handler = async message => {
  console.log(message);
  const npm = path.resolve(require.resolve('npm'), '../../../../node_modules/npm/bin/npm-cli.js');
  await spawnPromise(
    npm,
    ['--production',
      '--no-progress',
      '--loglevel=error',
      '--cache', path.join('/tmp', 'npm'),
      '--userconfig', path.join('/tmp', 'npmrc'),
      'install'
    ],
    {cwd: 'front-end'}
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
    {cwd: 'front-end'}
  );

  console.log(process.cwd());
  const fh = await readFile('/tmp/build/index.html');
  console.log(fh);

  var params = {
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
