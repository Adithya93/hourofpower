// DELETE BEFORE PUSHING TO GITHUB
var YOUTUBE_SEARCH_PREFIX = "REDACTED";
var YOUTUBE_EMBED_PREFIX = "//www.youtube.com/embed/";
var NUM_RESULTS = 10;
var VIDEO_LIMIT = 5;

var MAX_RESULTS_PER_ROW = 5;

var selectedVideos = [];
var appendTargets = [$('ul#thumbnails'), $('ul#nominee-thumbnails')];

var startToken;

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
		while (isNaN(parseInt(startTime))) {
			startTime = prompt("At what time in seconds from the start of the video would you like to commence playback of this video?");
			console.log("User chose startTime of " + startTime + " for videoID " + videoID);
		}

		selectedVideos.push([videoID, parseInt(startTime)]);

		console.log("Selected videos: " + JSON.stringify(selectedVideos));
		$('li#wrapper-' + videoID)[0].parentNode.removeChild($('li#wrapper-' + videoID)[0]);
		displaySelectedText();
		appendVideoToSelected(videoID);
		if (selectedVideos.length == VIDEO_LIMIT) {
			displayConfirmButton();
		}
	}
} 

function removeVideoFromList(videoID) {
	var removeIndex = selectedVideos.findIndex(function(x){return x[0] == videoID});
	if (removeIndex == -1) {
		console.log("Trying to remove non-existent item from list, bug spotted!");
		return -1;
	}
	selectedVideos.splice(removeIndex, 1);
	console.log("Selected videos: " + JSON.stringify(selectedVideos));
	$('li#wrapper-'+videoID)[0].parentNode.removeChild($('li#wrapper-' + videoID)[0]);
	if (selectedVideos.length < VIDEO_LIMIT) hideConfirmButton();
	if (selectedVideos.length == 0) hideSelectedText();
	return removeIndex;
}

function confirmSelection() {
	console.log("Making POST request for saving videos");
	$.ajax({
	  type: "POST",
	  url: "/videosConfirmed",
	  data: {'videos': selectedVideos},
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
}
