
var YOUTUBE_EMBED_PREFIX = "//www.youtube.com/embed/";
var numVideos;
var widthPercentage;

console.log("Commencing recentDisplay.js script");
appendAllThumbnails();

function appendAllThumbnails() {
	console.log("Trying to retrieve list of videoIDs");
	$.ajax({
	  url: "/recent",
	  success: function(data, textStatus, jqXHR) {
	  	console.log("Successfully retrieved IDs of recent videos: " + data);
	  	numVideos = data.length;
	  	widthPercentage = parseInt(100/numVideos) - 1;
	  	data.forEach(function(obj) {
	  		appendVideoThumbnail(obj['videoID']);
	  	});
	  	console.log("All videos appended!");
	  },
	  dataType: "json"
	});
}

function appendVideoThumbnail(videoID) {
	console.log("Attempting to append thumbnail for videoID " + videoID);
	var newIframe = document.createElement('iframe');
	newIframe.src = YOUTUBE_EMBED_PREFIX + videoID;
	newIframe.width = widthPercentage + "%";
	var wrapper = document.createElement('li');
	wrapper.appendChild(newIframe);
	wrapper.style.display="inline";
	$('ul#thumbnails').append(wrapper);
	console.log("Finished appending thumbnail for " + videoID);
}