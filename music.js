var spider = require('./spider.js');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');

var vidjeo = {};

var page = Random(1, 400);
spider.getURL('http://freemusicarchive.org/genre/Hip-Hop/?sort=track_date_published&d=1&page=' + page, function(html, vidjeo) {
  var $ = cheerio.load(html);
  var rand = Random(0, $('div.play-item').length - 1);

  // Cheerio doesn't have :eq selector
  $('div.play-item').each(function() {
    if (rand < 0) return;
    vidjeo.artist = $(this).find('.ptxt-artist a').text();
    vidjeo.track = $(this).find('.ptxt-track a').text();
    vidjeo.download = $(this).find('a.icn-arrow').attr('href');
    console.log(vidjeo);
    rand--;
  });

  // https://stackoverflow.com/questions/20132064/node-js-download-file-using-content-disposition-as-filename

  // Start the download
  var r = request(vidjeo.download);

  // RegExp to extract the filename from Content-Disposition
  var regexp = /filename="(.*)"/gi;

  r.on('response',  function (res) {
    vidjeo.mp3 = regexp.exec( res.headers['content-disposition'] )[1];
    res.pipe(fs.createWriteStream('./music/' + vidjeo.mp3));
  });

}, vidjeo);

function Random(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}