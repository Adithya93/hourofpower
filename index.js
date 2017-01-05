var express = require("express");
var embed = require("embed-video");
var ejs = require("ejs");
var mongoDB = require('mongodb');
var MongoClient = mongoDB.MongoClient;

var app = express();

var production = process.env && process.env.NODE_ENV == 'PRODUCTION';

app.listen(production ? process.env.PORT : 3000);
var VIDEO_ID = "B3vqcbJwgCI";
var YOUTUBE_PREFIX = "//www.youtube.com/embed/";

var MONGO_URL = production ? process.env.MONGODB_URI : "mongodb://127.0.0.1:27017";

var myDB;

reconnectDB();

app.get("/", function(req, res) {
	console.log("Booyakasha");
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

app.get("/custom", function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// Retrieve most recent videos, default 3
app.get("/recent", function(req, res) {
	res.redirect("/recent/5");
});

// Retrieve custom number of most recent videos
app.get("/recent/:num", function(req, res) {
	if (isNaN(parseInt(req.params.num))) {
		console.log("Illegal non-numeric param of " + req.params.num + " received");
		res.sendStatus(401);
	}
	else {
		console.log("Request received to retrieve " + req.params.num + " most recent videos");
		retrieveVideos(req.params.num, function(err, result) {
			if (err) {
				console.log("Video retrieval failed: " + err);
				res.sendStatus(501);
			}
			else {
				console.log("Videos successfully retrieved: " + result);
				
				res.json(result);
				//res.sendFile(__dirname + '/views/recent.html');
			}
		});
	}
});

app.get("/recentVideos", function(req, res) {
	res.sendFile(__dirname + '/views/recent.html');
});

// Save ID of recently viewed to DB
app.post("/videoChosen/:videoID", function(req, res) {
	var videoID = req.params.videoID;
	saveVideo(videoID, function(err, result) {
		if (err) {
			console.log("Video saving failed: " + err);
			res.sendStatus(501);
		}
		else {
			console.log("Video of ID " + videoID + " successfully saved");
			res.sendStatus(200); // TO-DO : Redirect to root or navigate to some meaningful page
		}
	});
});

app.get("/recentDisplayScript", function(req, res) {
	res.sendFile(__dirname + "/public/recentDisplay.js");
});

app.get("/searchVideos", function(req, res) {
	res.sendFile(__dirname + '/views/search.html');
});

app.get("/videoSearchScript", function(req, res) {
	res.sendFile(__dirname + "/public/search.js");
});

// Should refactor all DB-related methods into db.js and require "/db.js"
function reconnectDB() {
	console.log("Attempting to reconnect to MongoDB at " + (new Date()).toString());
	MongoClient.connect(MONGO_URL, function(err, db) {
		if (err) console.log("Error connecting to MongoDB : " + err);
		else {
			console.log("Successfully re-connected to DB at " + (new Date()).toString());
			myDB = db;
			// Register close/disconnect event-handlers on global persistent DB handle to avoid inefficient re-opening/closing for each operation
	    	myDB.on('close', function() {
	    		console.log('MongoDB connection closing...');
	    		reconnectDB(dbHandle);
			});
			myDB.on('disconnect', function (error) {
			    console.log('MongoDB getting disconnected', error);
			    reconnectDB(dbHandle);
			});
			myDB.on('timeout', function (error) {
			    console.log('MongoDB connection about to timeout', error);
			    reconnectDB(dbHandle);
			});
		}
	});
}

function saveVideo(videoID, callback) {
	var recentVideos = myDB.collection('recentVideos');
	recentVideos.findOneAndUpdate({'videoID': videoID}, {'$set': {'lastVisited': (new Date()).toString()}}, {'returnOriginal': false, 'upsert': true}, function(err, res) {
		if (err) {
			console.log("Error updating video of ID " + videoID + " : " + err);
			callback(err, null);
		}
		else {
			console.log("Successfully updated video of ID " + videoID + " , response is " + res);
			callback(null, res)
		}
	});
	console.log("Saving videoID to DB...");
}

function retrieveVideos(numVideos, callback) {
	var recentVideos = myDB.collection('recentVideos');
	recentVideos.find().limit(parseInt(numVideos)).toArray(function(err, result) {
		if (err) {
			console.log("Error retrieving videoIDs from DB: " + err);
			callback(err, null);
		}
		else {
			console.log("Successfully retrieved " + numVideos + " videoIDs from DB : " + result);
			callback(null, result);
		}	
	});
	console.log("Retrieval of videoIDs in progress...");
}

