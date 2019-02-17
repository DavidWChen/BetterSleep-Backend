var express = require('express');
var app = express();
var Houndify = require('houndify');
var wav = require('wav');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');



//config file
var configFile = 'config.json';
var config = require(path.join(__dirname, configFile));
let command;

app.get('/', function (req, res) {
  res.send('Hello World!');
});


//app.use(bodyParser());


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.raw({ type: 'audio/wav', limit: '50mb' }));

app.post('/', async function(request, response){
    //get wav from request 
    var audioFile = path.join('sleep16.wav');
	var audioFilePath = path.join(__dirname, audioFile);
	//
	//var audioFilePath = request.body.uri;
	//var audioFile = request.files.wav;
	//fs.writeFile('sample.wav', req.body,
	// console.log(audioFile);
	var file = fs.createReadStream(audioFilePath);
	let res = await streamAudioFile(file);
	//res = "start_app"
	//console.log(res);
	response.status(200).json(res);
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});



function streamAudioFile(file) {
	return new Promise((resolve, reject) => {


  var voiceRequest = new Houndify.VoiceRequest({
      clientId:  config.clientId, 
      clientKey: config.clientKey,
      convertAudioToSpeex: false,
      enableVAD: true,
      requestInfo: {
        UserID: "test_user",
        Latitude: 37.388309, 
        Longitude: -121.973968
      },
      onResponse: function(response, info) {
        console.log(response);
        if (response.AllResults && response.AllResults.length) {
      		console.log(response.AllResults[0].WrittenResponse);
      		resolve(response.AllResults[0].WrittenResponse);
      		// return response.AllResults[0].WrittenResponse;
    	}
      },

      onTranscriptionUpdate: function(trObj) {
        console.log("Partial Transcript:", trObj.PartialTranscript);
      },

      onError: function(err, info) {
        console.log(err);
        reject(err);
      }
  });

  file.on('data', function (chunk) {
    voiceRequest.write(chunk);
  });

  file.on('end', function() { 
    voiceRequest.end(); 
  });
  })
}