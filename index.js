var express = require("express");
var embed = require("embed-video");
var ejs = require("ejs");

var app = express();

app.listen(process.env && process.env.NODE_ENV == 'PRODUCTION'? process.env.PORT : 3000);
var VIDEO_ID = "B3vqcbJwgCI";
var YOUTUBE_PREFIX = "//www.youtube.com/embed/";

app.get("/", function(req, res) {
	console.log("Booyakasha");
	//res.sendFile(__dirname + '/views/index.html');
	//var iframe = embed.youtube(VIDEO_ID, {'display':'block', 'margin':'auto','width':'90%','height':'90%'});
	//ejs.renderFile(__dirname + "/views/index.ejs", {iframe: iframe}, function(err, str) {
	ejs.renderFile(__dirname + "/views/index.ejs", {videoID: YOUTUBE_PREFIX + VIDEO_ID}, function(err, str) {
		if (err) {
			console.log("Error rendering : " + err);
			res.sendStatus(501);
		}
		else {
			console.log("Rendering successful");
			res.send(str);
		}
	});
});

app.get("/script", function(req, res) {
	res.sendFile(__dirname + '/public/app.js');
});