## Headless Server Test

```
apt-get install ffmpeg Xvfb mesa-utils screen git

# Node JS 
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# A test script and package.json
git clone https://github.com/dustinb/vrobot.git
npm install

# Run display in background using screen
screen
Xvfb :0 -screen 0 1280x1024x16
    
# Detach
(CTRL-A d)
  
# Test OpenGL works  
export DISPLAY=:0
glxinfo | grep "OpenGL version"
OpenGL version string: 3.0 Mesa 13.0.6

# Try it
node ffmpeg-concat.js
{ cmd: 'ffmpeg -i cut2.mp4 -y -pix_fmt rgba -start_number 0 /tmp/638b43fa0389f1e380c55a774fc10f42/scene-1-%012d.raw' }
{ cmd: 'ffmpeg -i cut1.mp4 -y -pix_fmt rgba -start_number 0 /tmp/638b43fa0389f1e380c55a774fc10f42/scene-0-%012d.raw' }
init-frames: 9637.808ms
```

## Cutting Video

    ffmpeg -ss 120 -i FILE0004.MP4 -t 15 -c copy cut1.mp4
    ffmpeg -ss 180 -i FILE0004.MP4 -t 8 -c copy cut2.mp4



