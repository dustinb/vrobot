var exec = require('child_process').execSync;
var fs = require('fs');

var vidjeo = {
  pointLength: 10,
  clipLength: 15,
  finalLength: 180,
  videos: []
};

// Number of clips needed to get finalLength
vidjeo.clips = Math.round(vidjeo.finalLength / vidjeo.clipLength);

// Look at some videos
var filenames = fs.readdirSync('videos');

// Number of clips on avg from each file
vidjeo.clipsPer = Math.round(vidjeo.clips / filenames.length);

var melt = [];

// Get duration of them
filenames.forEach(function(file) {
  var duration = exec('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 videos/' + file);
  var vid = {filename: file, duration: parseInt(duration), clips: []};

  // Create points
  vid.points = new Array(Math.round(vid.duration / vidjeo.pointLength));

  // Add weight randomly
  Random(vid);

  // Is the vid long enough to make a clip?
  if (vid.duration <= vidjeo.clipLength) return;

  // Find the most weighted points, these are mid points
  var max = Math.max(...vid.points);
  var clip = {mid: vid.points.indexOf(max)};
  clip.midSeconds = clip.mid * vidjeo.pointLength;

  // From mid point go back about 1/2 clip length
  var date = new Date(null);
  date.setSeconds(clip.midSeconds - (vidjeo.clipLength / 2) + PlusMinus()); // specify value for SECONDS here
  clip.start  = date.toISOString().substr(11, 8);

  // From mid point go forward about 1/2 clip length
  var date = new Date(null);
  date.setSeconds(clip.midSeconds + (vidjeo.clipLength / 2) + PlusMinus());
  clip.end = date.toISOString().substr(11, 8);

  vid.clips.push({mid: vid.points.indexOf(max)});

  vidjeo.videos.push(vid);

  melt.push(file + ' in=' + clip.start + '.00 out=' + clip.end + '.00');
});

console.log(melt.join(' '));
console.log(vidjeo);

// Plus or minus some value
function PlusMinus() {
  var mul = Math.random() > .5 ? 1 : -1;
  return parseInt(Math.random() * 5 * mul);
}

function Random(vid, min, max) {
  if (typeof max == 'undefined') max = 100;
  if (typeof min == 'undefined') min = 0;

  for(var i=0; i < vid.points.length; i++) {
    vid.points[i] = Math.round(Math.random() * (max - min) + min);
  }
}
