document.addEventListener('DOMContentLoaded', onDOMReady, false);

var trackCount = 15;
var stepCount = 16;
var bpm = 120;
var currentStep = 0;
var eventTimeMs = (60000.0 / bpm) / 4;
var timer;
var isPlaying = false;
var wavs = ["kick.mp3", "clap.mp3", "snare.mp3", "hat_closed.mp3", "hat_open.mp3", "tom_low.mp3", "tom_mid.mp3", "tom_high.mp3", "conga_low.mp3", "conga_mid.mp3", "conga_high.mp3", "shaker.mp3", "bass.mp3", "eh.mp3", "cowbell.mp3"]
var names = ["kick", "clap", "snare", "hat closed", "hat open", "tom low", "tom mid", "tom high", "conga low", "conga mid", "conga high", "shaker", "bass", "eh", "cowbell"]
var gridElements;
var audioElementsLoaded = 0;

function create2dArray(rows, columns){
	var ret = []
	for(var r = 0; r < rows; r++){
		ret[r] = []
		for(var c = 0; c < columns; c++){
			ret[r][c] = false;
		}
	}
	return ret;
}

function onDOMReady(event){
	preloadAudio();
	gridElements = create2dArray(trackCount, stepCount);
	setupStepSequencer();
	setupSettings();
	resetPlayingMarker();
}

function setupSettings(){
	//enable submit form event handlers
	var form = document.getElementById("inputForm");
	form.addEventListener("input",
	function(e){

		e.preventDefault();
		bpm = document.getElementById("bpmInput").value;
		eventTimeMs = (60000.0 / bpm) / 4;
		if(isPlaying){
			window.clearInterval(timer);
			timer = window.setInterval(onStepEvent, eventTimeMs);
		}

	},
	false);

	var playButton = document.getElementById("playButton");
	playButton.addEventListener("click", playButtonPressed, false);

	var stopButton = document.getElementById("stopButton");
	stopButton.addEventListener("click", stopButtonPressed, false);
	
	document.getElementById("clearButton").addEventListener("click", clearGrid ,false);

	document.getElementById("randomButton").addEventListener("click", randomizeGrid, false);

	document.getElementById("saveButton").addEventListener("click", saveGrid ,false);

	document.getElementById("loadButton").addEventListener("click", loadGrid, false);

	stopButton.disabled = true;
}

function saveGrid(){
	var saveTextbox = document.getElementById("saveValue");
	saveTextbox.value = serialize();

}

function loadGrid(){
	var saveTextbox = document.getElementById("saveValue");
	var deserialized = JSON.parse(saveTextbox.value);
	gridElements = deserialized;
	for(var r = 0; r < trackCount; r++){
		for(var c = 0; c < stepCount; c++){
			if(gridElements[r][c] === true){
				document.getElementById("cell_" + r + "_" + c).dataset.enabled = "true";
			}
		}
	}

}

function randomizeGrid(){
	var cells = document.getElementsByClassName("cell");
	for(var c = 0; c < cells.length; c++){
		var cell = cells[c];
		if(Math.random() < 0.8 + Math.random() * 0.2){
			cell.dataset.enabled = "false";
		}
		else{
			cell.dataset.enabled = "true";
		}
		
	}
}

function clearGrid(){
	resetPlayingMarker();
	var cells = document.getElementsByClassName("cell");
	for(var c = 0; c < cells.length; c++){
		var cell = cells[c];
		cell.dataset.enabled = "false";
	}
}

function resetPlayingMarker(){
	var cells = document.getElementsByClassName("cell");
	for(var c = 0; c < cells.length; c++){
		var cell = cells[c];
		if(cell.dataset.step == 0){
			cell.dataset.playing = "true";
		}
		else{
			cell.dataset.playing = "false";
		}
	}

}

function playButtonPressed(){

	isPlaying = true;
	document.getElementById("playButton").disabled = true;
	timer = window.setInterval(onStepEvent, eventTimeMs);
	onStepEvent();
	document.getElementById("stopButton").disabled = false;
	

}

function stopButtonPressed(){
	window.clearInterval(timer);
	currentStep = 0;
	isPlaying = false;
	document.getElementById("playButton").disabled = false;
	resetPlayingMarker();

}

function onStepEvent(){
	var nextStep

	var cells = document.getElementsByClassName("cell");

	for(var c = 0; c < cells.length; c++){
		var cell = cells[c];
			if(cell.dataset.step == currentStep){
				cell.dataset.playing = "true";
				if(cell.dataset.enabled == "true"){
					playSound(wavs[cell.dataset.track])
				}
			}
			else{
				cell.dataset.playing = "false";
			}
	}
	currentStep = (currentStep + 1) % 16;
}

function playSound(path){
	var audio = new Audio(path);
	audio.play();
}
//plays each .mp3 file with an unhearable but non-zero volume 
//hacky but the easy way to consistently force browsers to cache 
function preloadAudio(){
	for(var i = 0; i < trackCount; i++){
		var audio = new Audio(wavs[i]);
		audio.preload = "auto";
		audio.volume = 0.000000001;
		audio.play();
	}
}

//fills the table used for the step sequencer
function setupStepSequencer(){
	var table = document.getElementById('stepSequencer');
	for(var track = 0; track < trackCount; track++){
		var row = document.createElement('tr');
		var title = document.createElement('td');
		title.appendChild(document.createElement("h2").appendChild(document.createTextNode(names[track])));
		title.onclick = function(){
			playSound(wavs[track])
		};
		row.appendChild(title);

		for(var step= 0; step < stepCount; step++){
			var cell = document.createElement('td');
			var div = document.createElement('div');
			div.onclick = cellOnClick;
			div.dataset.enabled = "false";
			div.dataset.playing = "false";
			div.dataset.track = track;
			div.dataset.step = step;
			div.className = "cell";
			div.id = "cell_" + track + "_" + step;
			if(step % 4 == 0){
				div.dataset.quarter = "true";
			}
			else{
				div.dataset.quarter = "false";
			}
			//div.appendChild(document.createElement("h2").appendChild(document.createTextNode(track + " - " + step)));
			cell.appendChild(div);
			row.appendChild(cell);	
		}
		table.appendChild(row);
	}

}

function serialize(){

	return JSON.stringify(gridElements);
}

function cellOnClick(){
	
	if(this.dataset.enabled === "false"){
		this.dataset.enabled = "true";
		gridElements[this.dataset.track][this.dataset.step] = true;

	}
	else{
		this.dataset.enabled = "false";
		gridElements[this.dataset.track][this.dataset.step] = false;
	}
}
