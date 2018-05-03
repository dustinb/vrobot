var spider = require('./spider.js');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');

module.exports = {

  randomSong: function (callback) {
    var page = Random(1, 400);
    spider.getURL('http://freemusicarchive.org/genre/Hip-Hop/?sort=track_date_published&d=1&page=' + page, function (html) {
      var $ = cheerio.load(html);
      var rand = Random(0, $('div.play-item').length - 1);
      var song = {};

      // Cheerio doesn't have :eq selector
      $('div.play-item').each(function () {
        if (rand < 0) return;
        song.artist = $(this).find('.ptxt-artist a').text();
        song.track = $(this).find('.ptxt-track a').text();
        song.download = $(this).find('a.icn-arrow').attr('href');
        rand--;
      });

      // https://stackoverflow.com/questions/20132064/node-js-download-file-using-content-disposition-as-filename

      // Start the download
      var r = request(song.download);

      // RegExp to extract the filename from Content-Disposition
      var regexp = /filename="(.*)"/gi;

      r.on('response', function (res) {
        song.filename = regexp.exec(res.headers['content-disposition'])[1];
        res.pipe(fs.createWriteStream(song.filename));
        callback(song);
      });

    });
  }
};

function Random(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}