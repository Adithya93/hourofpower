var express = require('express');
var embed = require('embed-video');
var ejs = require('ejs');
var mongoDB = require('mongodb');
var bodyParser = require('body-parser');
var crypto = require('crypto');

var MongoClient = mongoDB.MongoClient;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }))

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

app.post("/videosConfirmed", function(req, res) {
	console.log("Post request received to videosConfirmed. Body is: ");
	console.log(JSON.stringify(req.body));
	// Generate a token
	var hashKey = getSHA256HexHash(JSON.stringify(req.body['videos']));
	console.log("Hash key is " + hashKey);
	// Save token to DB with videos and startTimes
	saveChallenge(hashKey, req.body['videos'], function(err, result) {
		if (err) {
			console.log("Error saving challenges to database: " + err);
			res.sendStatus(501);
		}
		else {
			// Send that token over to the client
			res.send(hashKey);
		}
	});
});

app.get("/start/:token", function(req, res) {
	// Authenticate token against DB and retrieve list of videos and startTimes
	console.log("Token is " + req.params.token);
	console.log("Verifying token against DB");
	retrieveChallenge(req.params.token, function(err, result) {
		if (err) {
			console.log("Error retrieving challenges for this token: " + err);
			// This means server/DB error
			res.sendStatus(501);
		}
		else if (result.length == 0) {
			console.log("No videos found for this token " + req.params.token);
			res.sendStatus(404); // Or 401 since it's not 'authorized' in a sense?
		}
		else {
			console.log("Successfully retrieved challenges for token " + req.params.token + " : " + JSON.stringify(result[0]['videos']));
			//res.json(result[0]['videos']); // TEMP, REPLACE WITH EJS RENDERING SOON
			// Send file	
			ejs.renderFile(__dirname + "/views/start.ejs", {videos: result[0]['videos']}, function(err, str) {
				if (err) {
					console.log("Error rendering startChallenge page: " + err);
					res.sendStatus(501);
				}
				else {
					console.log("Rendering successful");
					res.send(str);
				}
			});
		}
	});
	//res.sendFile(__dirname + "/views/start.html");
});

app.post("/start", function(req, res) {
	console.log("Post request received to /start : " + JSON.stringify(req.body));
	res.redirect("/start/" + req.body.token);
});

app.get("/startScript", function(req, res) {
	res.sendFile(__dirname + "/public/start.js");
});

// For hashing
function getSHA256HexHash(input) {
	var hash = crypto.createHash('sha256');
	hash.update(input);
	return hash.digest('hex');
}

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

function saveChallenge(hashKey, videos, callback) {
	var challenges = myDB.collection('challenges');
	challenges.insert({'token': hashKey, 'videos': videos}, function(err, reply) {
		if (err) {
			console.log("Error saving challenge token and videos to DB : " + err);
			callback(err, null);
		}
		else {
			console.log("Successfully saved token and videos to DB");
			callback(null, reply);
		}
	});
}

function retrieveChallenge(token, callback) {
	var challenges = myDB.collection('challenges');
	challenges.find({'token':token}).limit(1).toArray(function(err, result) {
		if (err) {
			console.log("Error retrieving challenge for token " + token + " : " + err);
			callback(err, null);
		}
		else {
			console.log("Successfully retrieved tokens from DB for token " + token + " : " + JSON.stringify(result));
			callback(null, result);
		}
	});
} 

