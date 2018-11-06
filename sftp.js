var url = require('url');
let Client = require('ssh2-sftp-client');
let sftp = new Client();
var async   = require('async');

var ftpSite = "sftp://XXXX:XXXXXXX@usw-s009.rsync.net/AOpen/_Videos_/2017-10-08_Mushroom";
var info = url.parse(ftpSite);

// Want the path relative to our sftp home directory
info.path = info.path.substr(1);
console.log(info);

// A temp directory for the files
var tmp = require('tmp');
var tmpobj = tmp.dirSync();
console.log('Dir: ', tmpobj.name);

sftp.connect({
    host: info.host,
    port: 22,
    username: info.auth.split(':')[0],
    password: info.auth.split(':')[1],
    algorithms: {
      serverHostKey: ['ssh-dss']
    }
}).then(function() {
  // path relative to our home dir
  return sftp.list(info.path);

}).then(function(data) {
  // Get each file into a temp directory
  async.eachSeries(data, function(file, callback) {
    console.log(file.name);
    sftp.fastGet(info.path + '/' + file.name, tmpobj.name + '/' + file.name, callback);
  }, function() {
    // Done with download
    console.log('finished');
  });
}).catch(function(err) {
    console.log(err, 'catch error');
});

