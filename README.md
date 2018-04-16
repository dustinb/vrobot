## Node JS

On Debian systems need the latest (or later) Node JS version

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Cutting Video

    ffmpeg -ss 120 -i FILE0004.MP4 -t 15 -c copy cut1.mp4
    ffmpeg -ss 180 -i FILE0004.MP4 -t 8 -c copy cut1.mp4

## Debian Packages

```
apt-get install ffmpeg Xvfb mesa-utils
```

## Headless 

    export DISPLAY=:0
    Xvfb :0 -screen 0 1280x1024x16
    
    glxinfo | grep "OpenGL version"
    OpenGL version string: 3.0 Mesa 13.0.6
    
    
- libxi-devel
- xserver-xorg-dev
- ? libxext-dev
- libvips


