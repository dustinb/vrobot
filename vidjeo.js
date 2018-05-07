var execSync    = require('child_process').execSync;
var exec = require('child_process').exec;
var fs      = require('fs');
var vidjeo  = require('./vidjeo.json');
var async   = require('async');
var music   = require('./music.js');

vidjeo.videos = [];
vidjeo.duration = 0;
vidjeo.filesDuration = 0;

// Number of clips needed to get finalLength
vidjeo.clips = Math.round(vidjeo.finalLength / vidjeo.clipLength);

// Look at some videos
var filenames = fs.readdirSync(vidjeo.vidDir);

var melt = [];

// Get duration of them
filenames.forEach(function(file) {
  console.log(file);
  try {
    var duration = execSync('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' + vidjeo.vidDir + file);
  } catch(e) {
    return;
  }

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

  // TODO: May want 1 clip per video?
  if (vidjeo.duration > vidjeo.finalLength) return;

  for(var c=0; c<vid.duration / vidjeo.clipPerDuration; c++) {
    // Find the most weighted point of the ones that are unused
    var clip = {mid: getPoint(vid.points, lastMid)};

    // Didn't find a mid, maybe ran out of points?
    if (! clip.mid) continue;

    clip.midSeconds = clip.mid * vidjeo.pointLength;

    // From mid point go back about 1/2 clip length
    clip.startSeconds = clip.midSeconds - (vidjeo.clipLength / 2) + PlusMinus();
    if (clip.startSeconds < 0) clip.startSeconds = 0;
    var date = new Date(null);
    date.setSeconds(clip.startSeconds); // specify value for SECONDS here
    clip.start = date.toISOString().substr(11, 8);

    // From mid point go forward about 1/2 clip length
    clip.endSeconds = clip.midSeconds + (vidjeo.clipLength / 2) + PlusMinus();
    if (clip.endSeconds <= clip.startSeconds) {
      clip.endSeconds = clip.startSeconds + vidjeo.clipLength;
    }
    date = new Date(null);
    date.setSeconds(clip.endSeconds);
    clip.end = date.toISOString().substr(11, 8);

    clip.duration = clip.endSeconds - clip.startSeconds;

    // Move point index past our current seletion
    lastMid = clip.mid + parseInt(clip.duration / vidjeo.pointLength) + 2;

    vidjeo.duration += clip.duration;

    clip.melt = vidjeo.vidDir + vid.filename + ' in=' + clip.start + '.00 out=' + clip.end + '.00';
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

// Get the audio track then finish up the command
async.series([function(callback) {
  music.randomSong(function(song) {
    vidjeo.mp3 = song.filename;
    callback();
  })
}, function(callback) {
  // Make a new filename
  var now = new Date();
  var outfile = './vidjeo-' + now.getTime() + "-" + vidjeo.mp3;

  // Fade to black
  melt.push('colour:black out=200 -mix 180 -mixer luma');

  // Keep original audio?
  if (vidjeo.keepAudio) {
    melt.push('-audio-track ' + vidjeo.mp3 + ' out=' + audioEnd + ' -attach-track volume level=' + vidjeo.audioLevel + ' -transition mix a_track=0 b_track=1');
  } else {
    melt.push('-audio-track ' + vidjeo.mp3 + ' out=' + audioEnd + ' -attach-track volume level=' + vidjeo.audioLevel);
  }
  melt.push(' -consumer avformat:' + outfile + '.mp4');

  vidjeo.melt = 'melt ' + melt.join(' ');

  let data = JSON.stringify(vidjeo, null, 2);
  fs.writeFileSync(outfile + '.json', data);

  console.log(vidjeo);

  //exec('melt', melt, function() {
  //  console.log('done');
  //});

  callback();
}]);


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
