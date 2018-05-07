# Video Robot

Take a folder with some videos (maybe photos) in it, select some parts of them and add some music.  Here is sample, created randomly from 35 minutes of video.

https://www.youtube.com/watch?v=DQTqi8_A2sc

# Installation

Will need nodejs, ffmpeg, and the melt command

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

Create a vidjeo config file.  Works best if there are only videos in the directory.  At the least set `clipLength` and
`finalLength` in seconds.

```json
{
  "vidDir": "/lacie/_Videos_/2017-11-11_Rifle/",
  "pointLength": 20,
  "clipLength": 9,
  "finalLength": 120,
  "keepAudio": true,
  "audioLevel": "-5dB",
}
```

Run the robot

`node vidjeo`

Run the melt command that is output

`melt /lacie/_Videos_/2017-11-11_Rifle/FILE0028.MP4 in=00:01:13.00 out=00:01:24.00 /lacie/_Videos_/2017-11-11_Rifle/FILE0029.MP4 in=00:00:13.00 out=00:00:25.00  -mix 120 -mixer region /lacie/_Videos_/2017-11-11_Rifle/FILE0030.MP4 in=00:03:59.00 out=00:04:08.00  -mix 120 -mixer region /lacie/_Videos_/2017-11-11_Rifle/FILE0031.MP4 in=00:00:52.00 out=00:01:03.00  -mix 120 -mixer composite /lacie/_Videos_/2017-11-11_Rifle/FILE0032.MP4 in=00:05:53.00 out=00:06:06.00  -mix 120 -mixer region /lacie/_Videos_/2017-11-11_Rifle/FILE0032.MP4 in=00:07:35.00 out=00:07:43.00  -mix 120 -mixer composite /lacie/_Videos_/2017-11-11_Rifle/FILE0033.MP4 in=00:03:32.00 out=00:03:40.00  -mix 120 -mixer region /lacie/_Videos_/2017-11-11_Rifle/FILE0033.MP4 in=00:17:38.00 out=00:17:46.00  -mix 120 -mixer composite /lacie/_Videos_/2017-11-11_Rifle/FILE0033.MP4 in=00:18:18.00 out=00:18:24.00  -mix 120 -mixer matte /lacie/_Videos_/2017-11-11_Rifle/FILE0033.MP4 in=00:21:51.00 out=00:22:06.00  -mix 120 -mixer matte /lacie/_Videos_/2017-11-11_Rifle/FILE0034.MP4 in=00:02:31.00 out=00:02:40.00  -mix 120 -mixer composite /lacie/_Videos_/2017-11-11_Rifle/FILE0035.MP4 in=00:06:38.00 out=00:06:42.00  -mix 120 -mixer matte /lacie/_Videos_/2017-11-11_Rifle/FILE0035.MP4 in=00:07:37.00 out=00:07:44.00  -mix 120 -mixer composite /lacie/_Videos_/2017-11-11_Rifle/FILE0035.MP4 in=00:09:13.00 out=00:09:21.00  -mix 120 -mixer composite colour:black out=200 -mix 180 -mixer luma -audio-track Shuvoyoshi__Anitek_-_31_-_Negatives.mp3 out=6660 -attach-track volume level=-5dB -transition mix a_track=0 b_track=1  -consumer avformat:./vidjeo-1525732606267-Shuvoyoshi__Anitek_-_31_-_Negatives.mp3.mp4`

# Configuration

| Config      | Description                                        |
|-------------|----------------------------------------------------|   
| pointLength | Chop the video into parts of this length           |
| clipLength  | Preferred clip length between transitions          |
| finalLength | Approx. final video length in seconds              |
| _keepAudio_ | Keep the original audio track                      |
| audioLevel  | Audo level of the added music track 0dB is default | 

# MLT Framework

Uses [ffmpeg/ffprobe](https://www.ffmpeg.org/) for getting video information and the melt command from [MLT Framework](https://www.mltframework.org/) 
to do the video editing. 

# Free Music Archive

Music is downloaded from [Free Music Archive](http://freemusicarchive.org/) randomly.  Currently it's hard coded to use
Hip Hop genre.

# Clip Selection

Each video is cut into sections of `pointLength`.  These sections are weighted using proprietary formula (a random number).
The points with highest weight are used as mid points for clips of `clipLength` +/- some randomness.

Idea is to add weighting based on _speed_, _altitude change_, and _gyro_ data.  Something small and based on arduino like
[gpstag](https://github.com/dustinb/gpstag).

MLT provides other filers like speed up that can be used to add variety based on the data.

 
