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

- libxi-devel
- xserver-xorg-dev
- ? libxext-dev
- libvips


