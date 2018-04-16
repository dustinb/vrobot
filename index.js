const concat = require('ffmpeg-concat')

// concat 3 mp4s together using 2 500ms directionalWipe transitions
concat({
  output: 'test.mp4',
  videos: [
    'cut1.mp4',
    'cut22mp4'
  ],
  transition: {
    name: 'directionalWipe',
    duration: 500
  }
})

