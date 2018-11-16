var music = require('./music.js');

music.randomSong(function(song) {
  console.log(song);
});