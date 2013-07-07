// TODO:
// - use Backbone.js for the MVC pattern

$(document).ready(function() {
	var octave = [0,1,2,3,4,5,6,7,8,9,10,11];

	$("#pcCheckboxes button").each(function(){
		var button = $(this);
		var index = parseInt(button.data("index"));
		var angle = (6 - index) * 2 * Math.PI / 12;
		var radius = button.parent().width() / 2.5;
		button.css("top", (radius * (1 + Math.cos(angle))) + "px");
		button.css("left", (radius * (1 + Math.sin(angle))) + "px");
	});

	var parsePitchClasses = function(str) {
		if (!str || (str.length == 1 && !str[0])) {
			return [];
		}
		return _.map(str, function(i){ return parseInt(i);});
	}

	var getCanonicPitchClasses = function () {
		return parsePitchClasses($("#canonic").val().split(","));
	};
	
	var getPitchClassesFromCheckboxes = function () {
		return parsePitchClasses($("#pcCheckboxes button.active").map(function(){return $(this).data('index')}).get());
	};
	
	$("#pcCheckboxes button").click(function(){
		window.setTimeout(function(){
			var pitchClasses = getPitchClassesFromCheckboxes();
			updateViews(pitchClasses);
		}, 100);
	});
	
	var updateViews = function(pitchClasses) {
		for (i in octave) {
			var pc = octave[i];
			var active = _.contains(pitchClasses, pc);
			
			$("#pcCheckboxes button[name=pc-"+pc+"]").toggleClass("active btn-success", active);
		}
		$("#pcNumbers").text(_.sortBy(pitchClasses, function(i){return i}).join());
	};
	
	var transpose = function(pitchClasses, offset) {
		return _.map(pitchClasses, function(pc) {
			return (pc + offset + 12) % 12;
		});
	};
	
	var modifyModel = function(modify) {
		var model = getPitchClassesFromCheckboxes();
		var modifiedModel = modify(model);
		updateViews(modifiedModel);
	}
	
	$("#transpose-up").click(function(){
		modifyModel(function(pitchClasses) {
			return transpose(pitchClasses, 1);
		});
	});
	
	$("#transpose-down").click(function(){
		modifyModel(function(pitchClasses) {
			return transpose(pitchClasses, -1);
		});
	});
	
	$("#canonic").change(function(){
		var pcs = getCanonicPitchClasses();
		updateViews(pcs);
	});
});