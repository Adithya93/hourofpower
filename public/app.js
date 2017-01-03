
$('button#startTimer').on('click', function() { 
	startTimer();
});

// Global timer of seconds since start of button-press
var seconds = 0; 

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