var music = require('./free-music-archive.js');

music.randomSong(function(song) {
  console.log(song);
});