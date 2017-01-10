 var videos = [];
 var eventTarget;

 var currentVideo;

 var seconds = 0;
 
 var totalVideos;
 var cumulativeTimes = [];

 var LAG_FACTOR = 2;
 var TOLERANCE_FACTOR = 0;
 var ERRATIC_STOP_BUFFER = 4;

 var finishedCueing = 0;
 var currentVideoNumber = 0;
 var timerInProgress = false;
 var inTheMiddleOfVideo = false;

 loadInfo();
 var started = false;

 var aligned = false;
 var timeOfLastUpdate = 0;

 $('button#startTimer').on('click', function() {
  if (!started) {
    started = true;
    startFirstVideo();
    this.textContent = "Pause Timer";
  }
  else {
    if (timerInProgress) { 
      pauseTimer();
      this.textContent = "Resume Timer";
    }
    else {
      startTimer();
      this.textContent = "Pause Timer";
    }
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
          console.log("currentVideoNumber: " + currentVideoNumber);
          inTheMiddleOfVideo = true;
          restoreFooter();
          if (currentVideoNumber == 0) setTimeout(startTimer, 1000);
          if (!aligned) {
            alignTimings();
            displayTimeOfNextTransition();
          }
          else {
            console.log("Return from pause/buffering/crash detected at " + seconds + " seconds, not incrementing video number.");
            console.log("Setting aligned to false");
            aligned = false;
          }
        }
        else if (event.data == YT.PlayerState.ENDED && !done) { // current video has played for its allotted time
          if (finishedCueing == currentVideo + 1) {
            // Check for erratic stops
            var idealEndTime = cumulativeTimes[currentVideo];
            console.log("Verifying stop... Video should end when cumulative time is " + idealEndTime);
            if (idealEndTime - seconds > ERRATIC_STOP_BUFFER) {
              console.log("ERRATIC PREMATURE STOP DETECTED at time of " + seconds + " when end should be at " + idealEndTime + "; IGNORING and REPLAYING");
              aligned = true;
              var videoStartTime = currentVideo == 0 ? 0 : cumulativeTimes[currentVideo - 1];
              var recoveryPosition = parseInt(videos[currentVideo][1]) + seconds - videoStartTime; // the time into this video that the playing should resume 
              console.log("Seeking to " + recoveryPosition + " seconds into video");
              //player.playVideo();
              player.seekTo(recoveryPosition);
              return;
            }
            inTheMiddleOfVideo = false;
            console.log("Finished playing video " + currentVideo);
            if (currentVideo == totalVideos - 1) {
              done = true;
              stopVideo();
              stopTimer();
              displayCompletion();
            }
            else {
              console.log("Current value of currentVideo: " + currentVideo + "; calling prepareVideo()");
              markTransition();
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

        else if (event.data == YT.PlayerState.BUFFERING) {
          if (inTheMiddleOfVideo) {
            console.log("PLAYER IS BUFFERING MID-VIDEO. If returning to playing state from here, should not update video number");
            aligned = true;
          }
          else {
            console.log("Player is buffering before/in-between videos");
          }
        }
        // TO-DO : Can use autoPause flag + YT.PlayerState.PAUSED to pause timer on manual (user-triggered) pauses
        else {
          console.log("Different state change: " + event.data + "; currentVideo : " + currentVideo);
        }
      }

      function stopVideo() {
        console.log("Stopping video! Yayyyyyyyyyyyyyyy");
        player.stopVideo();
      }

      //function loadVideos() {
      function loadInfo() {  
        totalVideos = parseInt($('p#totalVideos')[0].textContent);
        console.log("Total videos : " + totalVideos);
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
          var duration = parseInt(videoInfo[2]) - parseInt(videoInfo[1]);
          cumulativeTimes.push(cumulativeTimes.length == 0 ? duration : duration + cumulativeTimes[cumulativeTimes.length - 1]);
        }
        console.log("Loaded information, videos are " + JSON.stringify(videos));
        console.log("cumulativeTimes are " + JSON.stringify(cumulativeTimes));
      }

      function prepareFirstVideo() {
        currentVideo = 0;
        console.log("Cueing first video");
        var chosenEndTime = parseInt(videos[0][2]) - LAG_FACTOR;
        player.cueVideoById({videoId:videos[0][0],
          startSeconds:parseInt(videos[0][1]),
          endSeconds: chosenEndTime,
          suggestedQuality:'large'});
      }

      function startFirstVideo() {
        console.log("Seeking to start of first video");
        player.seekTo(parseInt(videos[0][1]));
      }

      function prepareNextVideo() {
        currentVideo ++;
        console.log("Cueing video " + currentVideo);
        var startTime = parseInt(videos[currentVideo][1]);
        var endTime = parseInt(videos[currentVideo][2]);
        var bufferedEndTime = endTime - LAG_FACTOR;
        var chosenEndTime = currentVideo == totalVideos - 1 ? endTime : bufferedEndTime;
        console.log("Video's own startTime: " + startTime);
        console.log("Video's own endTime: " + chosenEndTime);
        console.log("Chosen play time for video " + (currentVideoNumber + 1) + ": " + (chosenEndTime - startTime));
        player.cueVideoById({videoId:videos[currentVideo][0],
          startSeconds:startTime,
          endSeconds:chosenEndTime,
          suggestedQuality:'large'});
      }

      function updateCurrentVideoNumber() {
        console.log("Updating current video number");
        currentVideoNumber ++;
        $('p#currentVideoNum').text("Now Playing Video No. " + currentVideoNumber);
      }

      function showStartButton() {
        $('button#startTimer')[0].style.display = "block";
      }

      function startTimer() {
        if (timerInProgress) return;
        timerInProgress = true;
        updateTime();
      }

      function pauseTimer() {
        timerInProgress = false;
      }

      function stopTimer() {
        console.log("Stopping timer!");
        pauseTimer();
        $('button#startTimer')[0].style.display = "none";
      }

      function updateTime() {
        if (!timerInProgress) {
          console.log("Paused timer detected, skipping update");
          return; // Check on both ends to avoid off-by-one increments
        }
        if (Date.now() - timeOfLastUpdate < 900) {
          console.log("Double updating edge effect detected, skipping update");
          return;
        }
        seconds ++;
        timeOfLastUpdate = Date.now(); 
        var secs = seconds % 60; 
        var mins = parseInt(seconds/60); 
        var timeStr = mins + ' mins ' + secs + ' secs';
        $('p#time').text(timeStr); 
        if (seconds < cumulativeTimes[cumulativeTimes.length - 1]) {
          if (timerInProgress) {
            setTimeout(updateTime, 1000);
          }
        }
      }

      function alignTimings() {
        idealTiming = currentVideoNumber == 0 ? 0 : cumulativeTimes[currentVideoNumber - 1];
        var actualTiming = seconds;
        updateCurrentVideoNumber();
        var delayInSeconds;
        if (idealTiming > actualTiming + TOLERANCE_FACTOR) { // video ahead of timer
          // Pause video until timer catches up
          delayInSeconds = idealTiming - actualTiming;
          console.log("Pausing video for " + delayInSeconds + " seconds at " + Date.now() + " until timer catches up");
          player.pauseVideo();
          console.log("Setting aligned to true");
          aligned = true;
          console.log("Delay in seconds: " + delayInSeconds);
          setTimeout(function() {
            console.log("Timer has caught up at " + Date.now() + ", resuming video");
            player.playVideo();
          }, delayInSeconds * 1000);
        }
        else if (actualTiming > idealTiming + TOLERANCE_FACTOR) { // timer ahead of video
          // Pause timer until video catches up
          delayInSeconds = actualTiming - idealTiming;
          console.log("Delay in seconds: " + delayInSeconds);
          console.log("Pausing timer for " + delayInSeconds + " seconds at " + Date.now() + " until video catches up");
          pauseTimer();
          setTimeout(function() {
            console.log("Resuming timer at " + Date.now());
            startTimer();
          }, delayInSeconds * 1000);
        }
        else {
          console.log("Already aligned, not adjusting");
        }
      }

      function flashFooter() {
        $('footer').text('DO IT!');
      }

      function restoreFooter() {
        $('footer')[0].innerHTML = '<p>Inspired by <a href="/manishNair">Manish Nair</a></p><p>Built by <a href="https://adithya93.github.io/">Adithya Raghunathan</a></p>';
      }

      function markTransition() {
        flashFooter();
        beep(2000, 400, 3, 'square');
      }

      function displayTimeOfNextTransition() {
        var nextTransition = cumulativeTimes[currentVideo];
        var transMins = parseInt(nextTransition / 60);
        var transSecs = nextTransition % 60;
        var transText = transMins + " mins " + transSecs + " secs";
        $('p#nextTransition').text("Next Transition : " + transText);
      }

      function displayCompletion() {
        $('p#nextTransition').text("Challenge complete! Congratulations!");
        $('p#currentVideoNum').text("All " + currentVideoNumber + " videos have been played");
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
