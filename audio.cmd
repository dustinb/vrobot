melt splice.mp4 colour:black in=1300 out=1450 -mix 200 -mixer luma -group -track Justice_Little_League.mp3 out=1400 -audio-track -blank out=1400 -transition luma in=1200 out=1400 a_track=3 b_track=4 -consumer avformat:audio.mp4 acodec=libmp3lame an=0 ab=320k