

// Look at some videos

// Get duration of them

// Create points

// Add weight
const exec = require('child_process').exec;
exec('cat *.js bad_file | wc -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

var vidjeo = {
  points: []
}

function Random(vijeo, min, max) {
  if (typeof max == 'undefined') max = 100;
  if (typeof min == 'undefined') min = 0;

  foreach(let i=0; i<vijeo.points.length; i++) {
    vijeo.points[i] += Math.random() * (max - min) + min;
  }
}



