$('button#chooseCustom').on('click', function(ev) {
	displayForm();
	ev.preventDefault();	
});

function displayForm() {
	$('div#formWrapper')[0].style.display = "block";
}

function validateForm() {
	var totalVideos = $('input#totalVideos')[0].value;
	var totalTime = $('input#totalTime')[0].value;
	if (totalVideos.length == 0 || totalTime.length == 0) {
		console.log("Empty-string input detected, rejecting");
		alert("Both total videos and total time must be filled with numbers");
		return false;
	}
	if (isNaN(parseInt($('input#totalVideos')[0].value)) || isNaN(parseInt($('input#totalTime')[0].value))) {
		console.log("Non-numerical input detected, rejecting");
		alert("Both total videos and total time must be numbers");
		return false;
	}
	return true;
}

