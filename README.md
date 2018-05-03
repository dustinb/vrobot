# Video Robot

Take a folder with some videos (maybe photos) in it, select some parts of them and add some music.

# Installation

```
apt-get update
apt-get install git ffmpeg melt curl sudo

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone https://github.com/dustinb/vrobot.git
cd vrobot
npm install
```

# Make A Video

`node vidjeo [directory]`

# Configuration

| Config      | Description                              | Default |
|-------------|------------------------------------------|---------|   
| pointLength | Chop the video into parts of this length | 5       |
| clipLength  | Preferred clip length between transitions| 10      |
| finalLength | Approx. final video length in seconds    | 120     |
| _keepAudio_ | Keep the original audio track            | true    | 
| _genre_     | Type of music                            | Hip Hop |

# MLT Framework

Uses [ffmpeg/ffprobe](https://www.ffmpeg.org/) for getting video information and the melt command from [MLT Framework](https://www.mltframework.org/) 
to do the video editing. 

# Clip Selection

Each video is cut into sections of `pointLength`.  These sections are weighted using proprietary formula (a random number).
The points with highest weight are used as mid points for clips of `clipLength` +/- some randomness.

Idea is to add weighting based on _speed_, _altitude change_, and _gyro_ data.  Something small and based on arduino like
[gpstag](https://github.com/dustinb/gpstag).

MLT provides other filers like speed up that can be used to add variety based on the data.

# Various Commands

Cut part of video

`melt FILE0004.MP4 in=00:05:00.00 out=00:05:15.00 -consumer avformat:FILE0004.00.05.00-00.05.15.mp4`

Add 2 videos with transition and stabalize filter

`melt cut1.mp4 cut2.mp4 -mix 100 -mixer luma -filter videostab2 -consumer avformat:splice.mp4`

Video duration, remove -sexagesimal for seconds

`ffprobe -v error -show_entries format=duration -sexagesimal -of default=noprint_wrappers=1:nokey=1 cut1.mp4`

Number of frames

`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nokey=1:noprint_wrappers=1 FILE0028.MP4`

Adding audio track and keeping the original by mixing them

`melt FILE0004.00.05.00-00.05.15.mp4 -audio-track Justice_Little_League.mp3 out=900 -transition mix a_track=0 b_track=1 -consumer avformat:audiotest.mp4`


   