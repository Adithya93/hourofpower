// DELETE BEFORE PUSHING TO GITHUB
var YOUTUBE_SEARCH_PREFIX = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyBzA98Lw9KXVYYMdCeOb5ylV2tp-o6AOTQ&part=snippet&maxResults=5&type=video&videoEmbeddable=true&q=";
var YOUTUBE_EMBED_PREFIX = "//www.youtube.com/embed/";
var NUM_RESULTS = 5;

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

function launchQuery(queryString) {
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
	  	widthPercentage = parseInt(100/NUM_RESULTS) - 1;
	  	resultsList.forEach(function(result) {
	  		var videoID = result["id"]["videoId"];
	  		console.log("VideoID of search result is " + videoID);
	  		appendVideoThumbnail(videoID);
	  	});
	  	console.log("All search results appended!");
	  },
	  dataType: "json"
	});
	$('button#clearResults')[0].style.display = "";
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

function clearResults() {
	$('ul#thumbnails li').each(function(index, child){child.parentNode.removeChild(child)});
	$('button#clearResults')[0].style.display = "none";
}