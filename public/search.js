// DELETE BEFORE PUSHING TO GITHUB
var YOUTUBE_SEARCH_PREFIX = "REDACTED";
var YOUTUBE_EMBED_PREFIX = "//www.youtube.com/embed/";
var NUM_RESULTS = 5;
//var VIDEO_LIMIT = 5;

var MAX_RESULTS_PER_ROW = 5;

var CONSTANT_INTERVAL = document.URL.indexOf("constantInterval") != -1;
console.log("Constant Interval? " + CONSTANT_INTERVAL);

var VIDEOS_SELECTED_PREFIX = "Videos Selected: ";
var VIDEOS_REMAINING_PREFIX = "Videos Remaining: ";
var SECONDS_USED_PREFIX = "Video Time Used (seconds): ";
var SECONDS_REMAINING_PREFIX = "Video Time Remaining (seconds): ";

var selectedVideos = [];
var appendTargets = [$('ul#thumbnails'), $('ul#nominee-thumbnails')];

var startToken;

// retrieve number of videos and total time

var totalVideos = parseInt($('p#numLeft')[0].getAttribute('data'));
var totalTime = parseInt($('p#secondsLeft')[0].getAttribute('data'));
var numSelected = parseInt($('p#numSelected')[0].getAttribute('data'));
var secondsUsed = parseInt($('p#secondsUsed')[0].getAttribute('data'));
var numLeft = totalVideos;
var secondsLeft = totalTime;

var VIDEO_LIMIT = totalVideos;

console.log("Total videos: " + totalVideos);
console.log("Total seconds: " + totalTime);

hideSelectedText(); // Needed when no videos have been selected yet

$('button#submitQuery').on('click', function() {
	var queryString = $('input#videoSearch')[0].value;
	if (queryString.length > 0) {
		console.log("User is submitting query string: " + queryString);
		launchQuery(queryString);
	}
	else {
		console.log("User trying to submit empty query, rejected");
		alert("Please enter a valid query before submitting");
	}
});

$('button#clearResults').on('click', function() {
	clearResults();
});

function registerSelectButtonEventHandler() {
	$('button.select').on('click', function() {
		console.log("Video of ID " + this.id + " selected");
		saveVideoToList(this.id);
	});
}

function registerRemoveButtonEventHandler() {
	$('button.remove-' + (selectedVideos.length - 1)).on('click', function() {
		console.log("Video of ID " + this.id + " removed");
		removeVideoFromList(this.id);
	});
}

$('button#confirm').on('click', function() {
	console.log("Confirming selection!");
	console.log("Confirmed videoIDs are " + JSON.stringify(selectedVideos));
	confirmSelection();
});

function launchQuery(queryString) {
	clearResults(); // CHOOSE TO CLEAR NON-SELECTED RESULTS FROM PREVIOUS SEARCH UPON NEW QUERY
	var urlEncodedQuery = queryString.split(" ").join("%20");
	var queryURL = YOUTUBE_SEARCH_PREFIX + urlEncodedQuery;
	console.log("queryURL is " + queryURL);
	$.ajax({
	  url: queryURL,
	  success: function(data, textStatus, jqXHR) {
	  	console.log("Successfully retrieved results for query:");
	  	console.log(data);
	  	var resultsList = data["items"];
	  	console.log("Number of results : " + resultsList.length);
	  	//widthPercentage = parseInt(100/NUM_RESULTS) - 1;
	  	widthPercentage = parseInt(100/MAX_RESULTS_PER_ROW) - 1;
	  	resultsList.forEach(function(result) {
	  		var videoID = result["id"]["videoId"];
	  		console.log("VideoID of search result is " + videoID);
	  		appendVideoThumbnail(videoID);
	  	});
	  	console.log("All search results appended!");
	  	$('button#clearResults')[0].style.display = "";
		registerSelectButtonEventHandler();
		firstSearch = false;
		console.log("Registered SelectButtonEventHandler");
	  },
	  dataType: "json"
	});
}

function appendVideoThumbnail(videoID) {
	appendVideo(videoID, 0);
}

function appendVideoToSelected(videoID) {
	appendVideo(videoID, 1);
	registerRemoveButtonEventHandler();
	console.log("Registered RemoveButtonEventHandler " + (selectedVideos.length - 1));
}

function appendVideo(videoID, targetIndex) {
	console.log("Attempting to append thumbnail for videoID " + videoID + " to targetIndex " + targetIndex);
	var newIframe = document.createElement('iframe');
	newIframe.src = YOUTUBE_EMBED_PREFIX + videoID;
	newIframe.width = widthPercentage + "%";
	var wrapper = document.createElement('li');
	wrapper.appendChild(newIframe);
	var button = document.createElement('button');
	button.id = videoID;
	//button.style.display = "inline-block"; // TO-DO : FIGURE OUT PROPER BUTTON CSS TO DISPLAY BELOW IFRAME WITHOUT TAKING WHOLE ROW
	//button.style.width = newIframe.width;
	if (targetIndex == 0) {
		button.setAttribute('class', 'select');
		button.textContent = "Add to list";
	}
	else {
		button.setAttribute('class', 'remove-' + (selectedVideos.length - 1));
		button.textContent = "Remove from list";
	}
	wrapper.appendChild(button);
	wrapper.id = "wrapper-" + videoID;
	wrapper.style.display = "inline";
	appendTargets[targetIndex].append(wrapper);
	console.log("Finished appending thumbnail for " + videoID + " to targetIndex " + targetIndex);
}


function clearResults() {
	$('ul#thumbnails li').each(function(index, child){child.parentNode.removeChild(child)});
	$('button#clearResults')[0].style.display = "none";
}

function saveVideoToList(videoID) {
	if (selectedVideos.length == VIDEO_LIMIT) alert("Video limit of " + VIDEO_LIMIT + " videos reached. Please remove some to add further.");
	else {

		var startTime;
		var endTime;
		if (numLeft == 1 && !CONSTANT_INTERVAL) {
			alert("This is the last video. Please be sure to choose a duration of " + secondsLeft);
		}
		while (isNaN(parseInt(startTime))) {
			startTime = prompt("At what time in seconds from the start of the video would you like to START playback?");
			console.log("User chose startTime of " + startTime + " for videoID " + videoID);
		}
		startTime = parseInt(startTime);
		if (!CONSTANT_INTERVAL) {
			while (isNaN(parseInt(endTime))) {
				endTime = prompt("At what time in seconds from the start of the video would you like to STOP playback?");
				console.log("User chose startTime of " + endTime + " for videoID " + videoID);
			}
			endTime = parseInt(endTime);
		}
		else {
			endTime = parseInt(totalTime/totalVideos) + startTime;
		}
		//endTime = parseInt(endTime);
		var duration = endTime - startTime;
		if (secondsUsed + duration > totalTime) {
			alert("That's too long. Total duration now exceeds your pre-specified total time. Maximum duration you can choose for this video is " + secondsLeft + ". Please select again with valid start and end times");	
			return;
		}
		//selectedVideos.push([videoID, parseInt(startTime)]);
		selectedVideos.push([videoID, startTime, endTime]);
		incrVideoCount(duration);

		console.log("Selected videos: " + JSON.stringify(selectedVideos));
		$('li#wrapper-' + videoID)[0].parentNode.removeChild($('li#wrapper-' + videoID)[0]);
		displaySelectedText();
		appendVideoToSelected(videoID);
		if (selectedVideos.length == VIDEO_LIMIT) {
			displayConfirmButton();
		}
	}
} 

function incrVideoCount(duration) {
	updateVideoCount(1, duration);
}

function decrVideoCount(duration) {
	updateVideoCount(-1, duration);
}

function updateVideoCount(sign, duration) {
	numSelected += sign;
	$('p#numSelected')[0].setAttribute('data', numSelected);
	$('p#numSelected').text(VIDEOS_SELECTED_PREFIX + numSelected);
	numLeft -= sign;
	$('p#numLeft')[0].setAttribute('data', numLeft);
	$('p#numLeft').text(VIDEOS_REMAINING_PREFIX +  numLeft);
	secondsUsed += sign * duration;
	$('p#secondsUsed')[0].setAttribute('data', secondsUsed);
	$('p#secondsUsed').text(SECONDS_USED_PREFIX + secondsUsed);
	secondsLeft -= sign * duration;
	$('p#secondsLeft')[0].setAttribute('data', secondsLeft);
	$('p#secondsLeft').text(SECONDS_REMAINING_PREFIX +  secondsLeft);
}

function removeVideoFromList(videoID) {
	var removeIndex = selectedVideos.findIndex(function(x){return x[0] == videoID});
	if (removeIndex == -1) {
		console.log("Trying to remove non-existent item from list, bug spotted!");
		return -1;
	}
	var removedVideo = selectedVideos.splice(removeIndex, 1)[0];
	console.log("Removed video is " + JSON.stringify(removedVideo));
	decrVideoCount(removedVideo[2] - removedVideo[1]);

	console.log("Selected videos: " + JSON.stringify(selectedVideos));
	$('li#wrapper-'+videoID)[0].parentNode.removeChild($('li#wrapper-' + videoID)[0]);
	if (selectedVideos.length < VIDEO_LIMIT) hideConfirmButton();
	if (selectedVideos.length == 0) hideSelectedText();
	return removeIndex;
}

function confirmSelection() {
	console.log("Making POST request for saving videos");
	console.log("Total videos: " + totalVideos);
	//console.log("TOTAL_VIDEOS: " + TOTAL_VIDEOS);
	$.ajax({
	  type: "POST",
	  url: "/videosConfirmed",
	  data: {'selection':{'videos': selectedVideos, 'numVideos': totalVideos, 'totalTime': totalTime}},
	  success: function(receivedData, textStatus, jqXHR) {
	  	console.log("Successfully posted videoIDs " + JSON.stringify(selectedVideos) + " to server");
	  	console.log("Server returned data : " + receivedData);
	  	console.log("Server returned statusCode of " + textStatus);
	  	startToken = receivedData;
	  	displayStartChallengeButton();
	  	// Add token to href of button
	  	$('input#tokenPayload')[0].value = startToken;
	  }
	});
}

function displaySelectedText() {
	console.log("DISPLAYING SELECTED TEXT PARA");
	$('p#selectedVideos')[0].style.display = "";
}

function hideSelectedText() {
	$('p#selectedVideos')[0].style.display = "none";
}

function displayConfirmButton() {
	$('button#confirm')[0].style.display = "block";
}

function hideConfirmButton() {
	$('button#confirm')[0].style.display = "none";	
}

function displayStartChallengeButton() {
	$('button#startChallenge')[0].style.display = "block";
	$('p#startLater')[0].style.display = "block";
	$('a#startLaterLink')[0].style.display = "block";
	$('a#startLaterLink')[0].href = "/start/" + startToken;
	//$('a#startLaterLink')[0].textContent = document.URL.replace("/searchVideos", "/start/" + startToken);
	$('a#startLaterLink')[0].textContent = (document.URL.substring(0, document.URL.indexOf("/search?")) + "/start/" + startToken);
}
