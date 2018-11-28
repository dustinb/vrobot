# Lazy Video Editor

Take a folder with some videos (maybe photos) in it, select some parts of them and add some music. 
 Here is sample, created randomly from 35 minutes of video.

https://www.youtube.com/watch?v=DQTqi8_A2sc

# Installation

Will need nodejs, ffmpeg, and the melt command

## Linux Dependencies
```
apt-get update
apt-get install git ffmpeg melt curl sudo

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Mac Dependencies
```
brew install mlt
brew install node?
brew install git?
```

## Get the code
```
git clone https://github.com/dustinb/lazyvid.git
cd vrobot
npm install
```

# Make A Video

Create a `lazy.yaml` config file.  Works best if there are only videos in the directory.  At the least 
set `clipLength` and `finalLength` in seconds.

```yaml
vidDir: /lacie/_Videos_/2017-11-11_Rifle/
pointLength": 20
clipLength": 9
finalLength": 120
keepAudio": true
audioLevel: 2dB,
spawn: true
```

Run the robot

`node lazyvid`

Wait for the video to be created.  If `spawn` is false the melt command will not be run but will be outout.  
A .json file is created with information and the melt command that was generated.

# Configuration

| Config      | Description                                         |
|-------------|-----------------------------------------------------|   
| pointLength | Chop the video into parts of this length            |
| clipLength  | Preferred clip length between transitions           |
| finalLength | Approx. final video length in seconds               |
| _keepAudio_ | Keep the original audio track                       |
| audioLevel  | Audio level of the original track. Must be > 0db to hear it | 

# MLT Framework

Uses [ffmpeg/ffprobe](https://www.ffmpeg.org/) for getting video information and the melt command 
from [MLT Framework](https://www.mltframework.org/) to do the video editing. 

# Free Music Archive

Music is downloaded from [Free Music Archive](http://freemusicarchive.org/) randomly.  Currently it's hard 
coded to use Hip Hop genre.

# Clip Selection

Each video is cut into sections of `pointLength`.  These sections are weighted using proprietary formula (a 
random number). The points with highest weight are used as mid points for clips of `clipLength` +/- some 
randomness.

Idea is to add weighting based on _speed_, _altitude change_, and _gyro_ data.  Something small and based on 
arduino like [gpstag](https://github.com/dustinb/gpstag).

MLT provides other filers like speed up that can be used to add variety based on the data.

 
