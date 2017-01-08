
//var videosPerRow = 3;
//var widthPercentage = parseInt(100/videosPerRow) - 1;
var YOUTUBE_EMBED_PREFIX = "//www.youtube.com/embed/";
var widthPercentage = 50;

getChallengesData();

function getChallengesData() {
	$.ajax({
	  url: "/recentChallenges",
	  success: function(data, textStatus, jqXHR) {
	  	console.log("Successfully retrieved challenges data:");
	  	console.log(data);
	  	console.log("Number of results : " + data.length);
	  	data.forEach(function(result) {
	  		appendChallengeThumbnail(result);
	  	});
	  	console.log("All challenge thumbnails appended!");
	  	//$('button#clearResults')[0].style.display = "";
		//registerSelectButtonEventHandler();
		//firstSearch = false;
		//console.log("Registered SelectButtonEventHandler");
	  },
	  dataType: "json"
	});
}

function appendChallengeThumbnail(challenge) {
	var token = challenge["token"];
	var videos = challenge["videos"];
	var challengeList = document.createElement('ul');
	challengeList.id = token;
	challengeList.class = "challenge";
	var tokenPara = document.createElement('p');
	tokenPara.id = token + "para";
	tokenPara.textContent = "Challenge token: " + token;
	tokenPara.style.display = "inline";
	challengeList.appendChild(tokenPara);
	var playListLink = document.createElement('a');
	playListLink.href = "/start/" + token;
	playListLink.textContent = "Use this playlist";
	var playListButton = document.createElement('button');
	playListButton.appendChild(playListLink);
	playListButton.style.display = "inline";
	playListButton.style['margin-left'] = 10;
	challengeList.appendChild(playListButton);
	var videoBullet;
	var thumbnail;
	var timeRange;
	videos.forEach(function(video) {
		videoBullet = document.createElement('li');
		videoBullet.id = token + video[0];
		/*
		// Offline at time of writing, use videoID para as placeholder for eventual thumbnail iframe
		thumbnail = document.createElement('p');
		// TEMP
		thumbnail.textContent = "VideoID: " + video[0];
		//
		*/
		thumbnail = getVideoThumbnail(video[0]);
		timeRange = document.createElement('p');
		timeRange.textContent = "Time Range Played: " + video[1] + " secs - " + (parseInt(video[1]) + 60) + " secs";
		timeRange.style.display = "block";
		videoBullet.appendChild(thumbnail);
		videoBullet.appendChild(timeRange);
		videoBullet.appendChild(document.createElement('br'));
		challengeList.append(videoBullet);
	});
	$('ul#challenges')[0].append(challengeList);
	$('ul#challenges')[0].append(document.createElement('br'));
	console.log("Appended challenge " + token);
}


function getVideoThumbnail(videoID) {
	console.log("Retrieving thumbnail for video " + videoID);
	var newIframe = document.createElement('iframe');
	newIframe.src = YOUTUBE_EMBED_PREFIX + videoID;
	newIframe.width = widthPercentage + "%";
	console.log("Successfully retrieved thumbnail for videoID " + videoID);
	return newIframe;
}