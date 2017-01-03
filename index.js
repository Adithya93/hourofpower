var express = require("express");
var embed = require("embed-video");
var app = express();

//app.listen(3000);

app.listen(process.env && process.env.NODE_ENV == 'PRODUCTION'? process.env.PORT : 3000);
var VIDEO_ID = "B3vqcbJwgCI";

app.get("/", function(req, res) {
	console.log("Booyakasha");
	/*
	//var embedCode = embed.youtube(VIDEO_ID, {});
	var embedCode = '<iframe src="//www.youtube.com/embed/B3vqcbJwgCI" frameborder="100" style="display:block;margin:auto;width:90%;height:90%" allowfullscreen></iframe>';
	console.log("Embed code: " + embedCode);
	var openWrapper = "<html><title>Hour of Power</title><head><script src='https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script></head><body style='background-color:orange'><div id='video' style='margin:auto;width:95%;height:95%'>";
	var quote = "<p style='display:block;color:blue;margin:auto;width:50%;text-align:center'>All is fair in love and beer.</p>";
	var button = "<button id='startTimer' style='display:block;color:purple;margin:auto;width:50%'>Start Timer</button>";
	var timeDisplay = "<p id='time' style='display:block;margin:auto;width:50%;text-align:center'></p>";
	var drinkText = "<p id='drinkText' style='display:block;color:black;margin:auto;width:50%;text-align:center'></p>";
	var closeWrapper = "</div><script>var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext); function beep(duration, frequency, volume, type, callback){var oscillator = audioCtx.createOscillator();var gainNode = audioCtx.createGain();oscillator.connect(gainNode);gainNode.connect(audioCtx.destination);if (volume){gainNode.gain.value = volume;};if (frequency){oscillator.frequency.value = frequency;};if (type){oscillator.type = type;};if (callback){oscillator.onended = callback;};oscillator.start();setTimeout(function(){oscillator.stop()}, (duration ? duration : 500));};$('button#startTimer').on('click', function() {startTimer();});var seconds = 0; function startTimer(){alert('TIMER STARTING');updateTime();};function updateTime(){seconds ++; var secs = seconds % 60; var mins = parseInt(seconds/60); var timeStr = mins + ' mins ' + secs + ' secs';console.log('Time string is ' + timeStr); $('p#time').text(timeStr); if (secs == 0) {$('footer').text('DRINK!');beep(2000, 400, 3, 'square');} else{$('footer').text('Brought to you by Manish Nair');};if (seconds < 3600){setTimeout(updateTime, 1000);}}</script><footer style='float:bottom;margin:auto;width:50%;top:0;bottom:0;text-align:center;bottom:0;color:green'>Brought to you by Manish Nair</footer></body></html>";
	var result = openWrapper + quote + embedCode + button + timeDisplay + drinkText + closeWrapper;
	res.send(result);
	*/
	res.sendFile(__dirname + '/views/index.html');
});

app.get("/script", function(req, res) {
	res.sendFile(__dirname + '/public/app.js');
});