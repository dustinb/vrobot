var spider = require('./spider.js');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');

module.exports = {

  randomSong: function (callback) {
    var page = Random(1, 200);
    const url = 'https://freemusicarchive.org/genre/Hip-Hop?sort=track_date_published&d=1&page=' + page;
    console.log(url);
    spider.getURL(url, function (html) {
      var $ = cheerio.load(html);
      console.log("found items", $('div.play-item').length);
      var rand = Random(0, $('div.play-item').length - 1);
      var song = {};

      // Cheerio doesn't have :eq selector
      $('div.play-item').each(function () {
        if (rand < 0) return;
        song.data = $(this).data('track-info');
        song.artist = song.data.artistName;
        song.track = song.data.title;
        song.download = song.data.fileUrl
        rand--;
      });

      // https://stackoverflow.com/questions/20132064/node-js-download-file-using-content-disposition-as-filename

      // Start the download
      console.log(song);
      // return;
      var r = request(song.download);

      r.on('response', function (res) {
        song.filename = song.download.substring(song.download.lastIndexOf('/')+1);
        res.pipe(fs.createWriteStream(song.filename));
        callback(song);
      });

    });
  }
};

function Random(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}