
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
	challengeList.appendChild(tokenPara);
	var videoBullet;
	var thumbnail;
	var timeRange;
	videos.forEach(function(video) {
		videoBullet = document.createElement('li');
		videoBullet.id = token + video[0];
		// Offline at time of writing, use videoID para as placeholder for eventual thumbnail iframe
		thumbnail = document.createElement('p');
		// TEMP
		thumbnail.textContent = "VideoID: " + video[0];
		//
		timeRange = document.createElement('p');
		timeRange.textContent = "Time Range Played: " + video[1] + " secs - " + (parseInt(video[1]) + 60) + " secs";
		videoBullet.appendChild(thumbnail);
		videoBullet.appendChild(timeRange);
		challengeList.append(videoBullet);
	});
	$('ul#challenges')[0].append(challengeList);
	$('ul#challenges')[0].append(document.createElement('br'));
	console.log("Appended challenge " + token);
}