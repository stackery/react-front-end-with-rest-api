const { spawnSync } = require('child_process');

exports.handler = async message => {
  console.log(message);
  const ret = spawnSync('npm', ['run', 'build'], {'cwd': 'front-end'});
  console.log(ret);

  return {};
};
