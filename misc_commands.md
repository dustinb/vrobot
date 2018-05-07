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
