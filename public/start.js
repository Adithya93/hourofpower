 var videos = [];
 var eventTarget;

 var currentVideo;

 var seconds = 0;
 var TOTAL_VIDEOS = 5;
 var VIDEO_TIME = 30;


 var LAG_FACTOR = 2;
 var PLAY_TIME = VIDEO_TIME - LAG_FACTOR;

 var finishedCueing = 0;
 var currentVideoNumber = 0;

 var timerInProgress = false;

 loadVideos();
 var started = false;

 $('button#startTimer').on('click', function() {
  if (!started) {
    started = true;
    startFirstVideo();
    this.textContent = "Pause Timer";
  }
  if (timerInProgress) { 
    pauseTimer();
    this.textContent = "Resume Timer";
  }
  else {
    startTimer();
    this.textContent = "Pause Timer";
  }
 });
 // From YouTube Iframe Player API
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var thisScriptTag = document.getElementsByTagName('script')[1];
      thisScriptTag.parentNode.insertBefore(tag, thisScriptTag);

      // This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        console.log("IframeAPIReady! Yay!");
        player = new YT.Player('player', {
          videoId: videos[0][0],
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        $('iframe#player')[0].style.display = "block";
        console.log(JSON.stringify(player));
      }

      // The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        console.log("PlayerReady! Yayyy");
        eventTarget = event.target;
        prepareFirstVideo();
      }

      var done = false;
      // The API calls this function when the player's state changes.
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          console.log("Playing video " + currentVideo);
          alignTimings();
          updateCurrentVideoNumber();
        }
        else if (event.data == YT.PlayerState.ENDED && !done) { // current video has played for its allotted time
          if (finishedCueing == currentVideo + 1) {
            console.log("Finished playing video " + currentVideo);
            if (currentVideo == TOTAL_VIDEOS - 1) {
              done = true;
              stopVideo();
              stopTimer();
            }
            else {
              console.log("Current value of currentVideo: " + currentVideo + "; calling prepareVideo()");
              prepareNextVideo();
            }
          }
          else {
            console.log("Premature finish-reporting detected, ignoring. FinishedCueing: " + finishedCueing + "; currentVideo: " + currentVideo);
          }
        }
        else if (event.data == YT.PlayerState.CUED && !done) {
          finishedCueing ++;
          if (currentVideo == 0) {
            console.log("Finished cueing first video. About to display start button.");
            showStartButton();
          }
          else {
            console.log("Finished cueing video " + currentVideo);
            player.seekTo(parseInt(videos[currentVideo][1]));
          }
        }
        else {
          console.log("Different state change: " + event.data + "; currentVideo : " + currentVideo);
        }
      }

      function stopVideo() {
        console.log("Stopping video! Yayyyyyyyyyyyyyyy");
        player.stopVideo();
      }

      function loadVideos() {
        var infoNodes = $('ul#videos')[0].children;
        var videoInfo;
        var infoNode;
        console.log("Length of infoNodes: " + infoNodes.length);
        for (var index = 0; index < infoNodes.length; index ++) {
          videoInfo = [];
          infoNode = infoNodes[index].children;
          console.log("Length of infoNode: " + infoNode.length);
          for (var innerIndex = 0; innerIndex < infoNode.length; innerIndex ++) {
            console.log("Pushing value: " + infoNode[innerIndex].textContent);
            videoInfo.push(infoNode[innerIndex].textContent);
          }
          videos.push(videoInfo);
        }
        console.log("Loaded information, videos are " + JSON.stringify(videos));
      }

      function prepareFirstVideo() {
        currentVideo = 0;
        console.log("Cueing first video");
        player.cueVideoById({videoId:videos[0][0],
          startSeconds:parseInt(videos[0][1]),
          //endSeconds:parseInt(videos[0][1]) + VIDEO_TIME,
          endSeconds:parseInt(videos[0][1]) + PLAY_TIME,
          suggestedQuality:'large'});
      }

      function startFirstVideo() {
        console.log("Seeking to start of first video");
        player.seekTo(parseInt(videos[0][1]));
      }

      function prepareNextVideo() {
        currentVideo ++;
        console.log("Cueing video " + currentVideo);
        player.cueVideoById({videoId:videos[currentVideo][0],
          startSeconds:parseInt(videos[currentVideo][1]),
          //endSeconds:parseInt(videos[currentVideo][1]) + VIDEO_TIME,
          endSeconds:parseInt(videos[currentVideo][1]) + PLAY_TIME,

          suggestedQuality:'large'});
      }

      function updateCurrentVideoNumber() {
        currentVideoNumber ++;
        $('p#currentVideoNum').text("Now Playing Video No. " + currentVideoNumber);
      }

      function showStartButton() {
        $('button#startTimer')[0].style.display = "block";
      }

      function startTimer() {
        timerInProgress = true;
        //alert('TIMER STARTING');
        updateTime();
      }

      function pauseTimer() {
        timerInProgress = false;
        //alert('PAUSING TIMER');
      }

      function stopTimer() {
        console.log("Stopping timer!");
        pauseTimer();
        $('button#startTimer')[0].style.display = "none";
      }

      function updateTime() {
        if (!timerInProgress) return; // Check on both ends to avoid off-by-one increments
        seconds ++; 
        var secs = seconds % 60; 
        var mins = parseInt(seconds/60); 
        var timeStr = mins + ' mins ' + secs + ' secs';
        $('p#time').text(timeStr); 
        if (secs == 0) {
          $('footer').text('DRINK!');
          beep(2000, 400, 3, 'square');
        } 
        else {
          $('footer').text('Brought to you by Manish Nair');
        }
        if (seconds < 3600) {
          if (timerInProgress) {
            setTimeout(updateTime, 1000);
          }
        }
      }

      function alignTimings() {
        var idealTiming = currentVideoNumber  * VIDEO_TIME;
        var actualTiming = seconds;
        if (idealTiming > actualTiming) { // video ahead of timer
          // Pause video until timer catches up
          console.log("Pausing video until timer catches up");
          player.pauseVideo();
          setTimeout(function() {
            console.log("Timer has caught up, resuming video");
            player.playVideo();
          }, idealTiming - actualTiming);
        }
        else if (actualTiming > idealTiming) { // timer ahead of video
          // Pause timer until video catches up
          console.log("Pausing timer until video catches up");
          pauseTimer();
          setTimeout(startTimer, actualTiming - idealTiming);
        }
      }


      // Beep-Generation code from Stack Overflow
      var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext); 
      function beep(duration, frequency, volume, type, callback) {
        var oscillator = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        if (volume) { 
          gainNode.gain.value = volume; 
        }
        if (frequency) {
          oscillator.frequency.value = frequency;
        }
        if (type) {
          oscillator.type = type;
        }
        if (callback) {
          oscillator.onended = callback;
        }
        oscillator.start();
        setTimeout(function() {
          oscillator.stop()
        }, (duration ? duration : 500));
      }
