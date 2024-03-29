execSync = require('child_process').execSync;
spawn = require('child_process').spawn;
yaml = require('js-yaml');
fs = require('fs');

// If the lazyvid.yaml exists use that, otherwise assume running from docker
// and use the /videos directory
if (fs.existsSync('lazy.yaml')) {
  vidjeo = yaml.safeLoad(fs.readFileSync('lazy.yaml', 'utf8'));
} else {
  // Copy our default settings
  if (! fs.existsSync('/videos/lazy.yaml')) {
    vidjeo = yaml.safeLoad(fs.readFileSync('defaults.yaml'));
  } else {
    vidjeo = yaml.safeLoad(fs.readFileSync('/videos/lazy.yaml', 'utf8'));
  }
}

async   = require('async');
music   = require('./free-music-archive.js');

vidjeo.videos = [];
vidjeo.duration = 0;
vidjeo.filesDuration = 0;

// Number of clips needed to get finalLength
vidjeo.clips = Math.round(vidjeo.finalLength / vidjeo.clipLength);

// If sftp is used sync down the video files first

// Look at some videos
console.log("Reading video files:", vidjeo.vidDir)
var filenames = fs.readdirSync(vidjeo.vidDir);

var melt = [];

// Get duration of them
// Get the frame per second.  Assuming all source video are the same
filenames.forEach(function(file) {
  console.log(file);
  try {
    var duration = execSync('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' + vidjeo.vidDir + file);
    // var vidjeo.fps = execSync('ffprobe -v 0 -of csv=p=0 -select_streams 0 -show_entries stream=r_frame_rate ' + vidjeo.vidDir + file);
  } catch(e) {
    return;
  }

  // Is the vid long enough to make a clip?
  if (duration <= vidjeo.clipLength) return;

  var vid = {filename: file, duration: parseInt(duration), clips: []};

  // Create points
  vid.points = new Array(vid.duration);

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
vidjeo.numClips = Math.round(vidjeo.finalLength / vidjeo.clipLength);

// Need a clip for every X amount of seconds
vidjeo.clipEvery = Math.round(vidjeo.filesDuration / vidjeo.numClips);

var j = 0;
vidjeo.clips = 0;
vidjeo.videos.forEach(function(vid) {

  var lastMid = 0;

  if (vid.duration < vidjeo.minVideoDuration) return;

  // TODO: May want 1 clip per video?
  if (vidjeo.duration > vidjeo.finalLength) return;

  for(var c=0; c<vid.duration; c+=vidjeo.clipEvery) {
    // Find the most weighted point of the ones that are unused
    // TODO: If we know we need x clips find one in each section of the video
    // TODO: Which means getPoint needs a start and end point and should look for max
    // Possibly set points to zero so they don't get used again
    var clip = {midSeconds: getPoint(vid.points, c)};

    // Didn't find a mid, maybe ran out of points?
    if (! clip.midSeconds) continue;

    //clip.midSeconds = clip.mid * vidjeo.pointLength;

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
    //lastMid = clip.mid + parseInt(clip.duration / vidjeo.pointLength) + 2;

    vidjeo.duration += clip.duration;

    clip.melt = vidjeo.vidDir + vid.filename + ' in=' + clip.start + '.00 out=' + clip.end + '.00';
    // clip.melt = vidjeo.vidDir + vid.filename + ' volume gain=' + vidjeo.audioLevel + 'in=' + clip.start + '.00 out=' + clip.end + '.00';
    vid.clips.push(clip);
    vidjeo.clips++;
  }

  for(var i=0; i<vid.clips.length; i++) {
    melt.push(vid.clips[i].melt);
    if (j>0) {
      melt.push('-mix 120');
      melt.push('-mixer ' + transitions[Random(0, transitions.length - 1)]);
    }
    j++;
  }
});

date = new Date(null);
date.setSeconds(vidjeo.duration);

// Trying to calculate the actual length of the video in frames. Audio doesn't seem to support 00:23:15 type format for
// in and out. Take length minus some frames, 2-3 seconds of mixing.
// @todo get frames from video
vidjeo.fps = 60;
var audioEnd = vidjeo.duration * vidjeo.fps - (vidjeo.clips * (2 * vidjeo.fps)); // 3 second mix
//var audioEnd = vidjeo.duration * 60; // 60 Frames per second;

// Get the audio track then finish up the command
async.series([function(callback) {
  // Manual audio file specified
  if (vidjeo.mp3) {
    callback();

    return;
  }
  music.randomSong(function(song) {
    vidjeo.mp3 = song.filename;
    callback();
  })
}, function(callback) {
  // Make a new filename
  var now = new Date();
  var outfile = vidjeo.vidDir + '/vidjeo-' + now.getTime() + "-" + vidjeo.mp3;

  // Fade to black
  melt.push('colour:black out=200 -mix 180 -mixer luma');

  // Keep original audio?
  if (vidjeo.keepAudio) {
    melt.push('-audio-track ' + vidjeo.mp3 + ' in=0 out=' + audioEnd + ' -attach-track volume level=' + vidjeo.audioLevel + ' -transition mix a_track=0 b_track=1');
    //melt.push('-audio-track ' + vidjeo.mp3 + ' out=' + audioEnd + ' -attach-track  -transition mix a_track=0 b_track=1');
  } else {
    melt.push('-audio-track ' + vidjeo.mp3 + ' in=0 out=' + audioEnd + ' -attach-track volume level=' + vidjeo.audioLevel);
    //melt.push('-audio-track ' + vidjeo.mp3 + ' out=' + audioEnd + ' -attach-track');
  }
  melt.push(' -consumer avformat:' + outfile + '.mp4');

  vidjeo.meltCommand = 'melt ' + melt.join(' ');

  let data = JSON.stringify(vidjeo, null, 2);
  fs.writeFileSync(outfile + '.json', data);

  if (typeof vidjeo.spawn == 'undefined' || vidjeo.spawn) {
    var process = spawn('melt', melt, {shell: '/bin/bash'});

    process.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

  } else {
    console.log(vidjeo.meltCommand);
  }

  callback();
}]);


function getPoint(points, start) {
  // Use slice to find the max in a section
  var max = Math.max(...points.slice(start, start + vidjeo.clipEvery))

  // Return the index of max location
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
    if (i % vidjeo.pointLength == 0) {
      vid.points[i] = Random(min, max);
    } else {
      vid.points[i] = 0;
    }
  }
}
