
$('button#startTimer').on('click', function() { 
	startTimer();
});

$('button#changeVideo').on('click', function() {
	changeVideo();
});

// Global timer of seconds since start of button-press
var seconds = 0; 
var YOUTUBE_WATCH_PREFIX = "https://www.youtube.com/watch?v=";
var YOUTUBE_EMBED_PREFIX = "//www.youtube.com/embed/";

function startTimer() {
	alert('TIMER STARTING');
	updateTime();
}

function updateTime() {
	seconds ++; 
	var secs = seconds % 60; 
	var mins = parseInt(seconds/60); 
	var timeStr = mins + ' mins ' + secs + ' secs';console.log('Time string is ' + timeStr); 
	$('p#time').text(timeStr); 
	if (secs == 0) {
		$('footer').text('DRINK!');
		beep(2000, 400, 3, 'square');
	} 
	else {
		$('footer').text('Brought to you by Manish Nair');
	}
	if (seconds < 3600) {
		setTimeout(updateTime, 1000);
	}
}

function changeVideo() {
	var videoURL = prompt("Please enter a valid YouTube URL");
	var videoID = videoURL.replace(YOUTUBE_WATCH_PREFIX, YOUTUBE_EMBED_PREFIX);
	var justID = videoURL.replace(YOUTUBE_WATCH_PREFIX, "");
	$('iframe')[0].src = videoID;
	// Make post request to server for saving to DB
	console.log("Posting videoID to server for updating of recentVideos");
	$.ajax({
	  type: "POST",
	  url: "/videoChosen/" + justID,
	  success: function(data, textStatus, jqXHR) {
	  	console.log("Successfully posted choice of videoID " + justID + " to server");
	  	console.log("Server returned data : " + data);
	  	console.log("Server returned statusCode of " + textStatus);
	  }
	});
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