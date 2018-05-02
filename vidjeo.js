var exec = require('child_process').execSync;
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var spider = require('./spider.js');

var vidjeo = {
  pointLength: 10,
  clipLength: 10,
  finalLength: 120,
  videos: [],
  duration: 0,
  filesDuration: 0
};

var vidDir = '/lacie/_Videos_/2017-11-11_Rifle/';
//var vidDir = '/lacie/_Videos_/2018-04-24_Wolf/';
//var vidDir = '/lacie/_Videos_/2018-04-14_Snowmass/';

// Number of clips needed to get finalLength
vidjeo.clips = Math.round(vidjeo.finalLength / vidjeo.clipLength);

// Look at some videos
var filenames = fs.readdirSync(vidDir);

var melt = [];

// Get duration of them
filenames.forEach(function(file) {
  var duration = exec('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' + vidDir + file);

  // Is the vid long enough to make a clip?
  if (duration <= vidjeo.clipLength) return;

  var vid = {filename: file, duration: parseInt(duration), clips: []};

  // Create points
  vid.points = new Array(Math.round(vid.duration / vidjeo.pointLength));

  // Add weight randomly
  RandomWeight(vid);

  vidjeo.filesDuration += vid.duration;
  vidjeo.videos.push(vid);

});

// qtblend requires X11
// movit.? requires QT environment
var transitions = ['composite',
  'luma', 'matte', 'region', 'affine'];

// Approx # of clips we ned to get finalLength
vidjeo.numClips = vidjeo.finalLength / vidjeo.clipLength;

vidjeo.clipPerDuration = vidjeo.filesDuration / vidjeo.numClips;

var j = 0;
vidjeo.videos.forEach(function(vid) {

  var lastMid = 0;

  for(var c=0; c<vid.duration / vidjeo.clipPerDuration; c++) {
    // Find the most weighted point of the ones that are unused
    var clip = {mid: getPoint(vid.points, lastMid)};

    // Didn't find a mid, maybe ran out of points?
    if (! clip.mid) continue;

    clip.midSeconds = clip.mid * vidjeo.pointLength;
    console.log(clip);
    // From mid point go back about 1/2 clip length
    clip.startSeconds = clip.midSeconds - (vidjeo.clipLength / 2) + PlusMinus();
    if (clip.startSeconds < 0) clip.startSeconds = 0;
    var date = new Date(null);
    date.setSeconds(clip.startSeconds); // specify value for SECONDS here
    clip.start = date.toISOString().substr(11, 8);

    // From mid point go forward about 1/2 clip length
    clip.endSeconds = clip.midSeconds + (vidjeo.clipLength / 2) + PlusMinus();
    if (clip.endSeconds < clip.startSeconds) {
      clip.endSeconds = clip.startSeconds;
    }
    date = new Date(null);
    date.setSeconds(clip.endSeconds);
    clip.end = date.toISOString().substr(11, 8);

    clip.duration = clip.endSeconds - clip.startSeconds;

    // Move point index past our current seletion
    lastMid = clip.mid + parseInt(clip.duration / vidjeo.pointLength) + 2;

    vidjeo.duration += clip.duration;

    clip.melt = vidDir + vid.filename + ' in=' + clip.start + '.00 out=' + clip.end + '.00';
    vid.clips.push(clip);
  }

  for(var i=0; i<vid.clips.length; i++) {
    melt.push(vid.clips[i].melt);
    if (j>0) {
      melt.push(' -mix 120 -mixer ' + transitions[Random(0, transitions.length - 1)]);
    }
    j++;
  }
});

date = new Date(null);
date.setSeconds(vidjeo.duration);

// End frame for audio, doesn't seem to support 00:23:15 type format.
// Subtracting some frames for transitions
var audioEnd = vidjeo.duration * 60 - (vidjeo.videos.length * 120); // 60 Frames per second;

var page = Random(1,240);
spider.getURL('http://freemusicarchive.org/search/?adv=1&quicksearch=&search-genre=Hip-Hop&duration_from=02%3A00&duration_to=04%3A00&sort=track_date_published&d=1&page=' + page, function(html) {
  var $ = cheerio.load(html);
  var rand = Random(0, $('div.play-item').length - 1);

  // Cheerio doesn't have :eq selector
  $('div.play-item').each(function() {
    if (rand < 0) return;
    vidjeo.artist = $(this).find('.ptxt-artist a').text();
    vidjeo.track = $(this).find('.ptxt-track a').text();
    vidjeo.download = $(this).find('a.icn-arrow').attr('href');
    rand--;
  });

  // https://stackoverflow.com/questions/20132064/node-js-download-file-using-content-disposition-as-filename

  // Start the download
  var r = request(vidjeo.download);

  // RegExp to extract the filename from Content-Disposition
  var regexp = /filename="(.*)"/gi;

  r.on('response',  function (res) {
    vidjeo.mp3 = regexp.exec( res.headers['content-disposition'] )[1];

    // Make a new filename
    var now = new Date();
    var outfile = './vidjeo-' + now.getTime() + "-" + vidjeo.mp3;

    // Keep original audio?
    melt.push('-audio-track ' + vidjeo.mp3 + ' out=' + audioEnd + ' -attach-track volume level=-10dB -transition mix a_track=0 b_track=1');
    melt.push(' -consumer avformat:' + outfile + '.mp4');

    vidjeo.melt = 'melt ' + melt.join(' ');

    let data = JSON.stringify(vidjeo);
    fs.writeFileSync(outfile + '.json', data);

    res.pipe(fs.createWriteStream('./' + vidjeo.mp3));
    console.log(vidjeo);
  });
});

function getPoint(points, start) {
  // Use slice to find the max in a section
  var max = Math.max(...points.slice(start));
  for(var i=start; i<points.length; i++) {
    if (points[i] == max) return i;
  }
  return false;
}

function Random(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}

// Plus or minus some value
function PlusMinus() {
  var mul = Math.random() > .5 ? 1 : -1;
  return parseInt(Random(0, 5) * mul);
}

function RandomWeight(vid, min, max) {
  if (typeof max == 'undefined') max = 100;
  if (typeof min == 'undefined') min = 0;

  for(var i=0; i < vid.points.length; i++) {
    vid.points[i] = Random(min, max);
  }
}
