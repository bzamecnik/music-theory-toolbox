// TODO:
// - use Backbone.js for the MVC pattern

$(document).ready(function() {
	var OCTAVE_SIZE = 12;
	var octave = [0,1,2,3,4,5,6,7,8,9,10,11];

	var setFromInt = function(bitset) {
		return _.filter(octave, function(i){
			return (bitset & (1 << i)) > 0;
		})
	};
	
	var setToInt = function(set) {
		var powersOfTwo = _.map(set, function(i) { return 1 << i; });
		var sum = _.reduce(powersOfTwo, function(sum, i){ return sum + i; }, 0);
		return sum;
	};

	var bitSetFromInt = function(bitset) {
		return _.map(octave, function(i){
			return (bitset & (1 << (octave.length - i - 1))) > 0 ? 1 : 0;
		}).join("")
	};
	
	var shiftBitSetIndex = function(bitSetIndex, offset) {
    var upper = bitSetIndex << offset;
    var lower = bitSetIndex >> (OCTAVE_SIZE - offset);
    var mask = (1 << OCTAVE_SIZE) - 1;
    return (upper | lower) & mask;
  }
	
	var canonicalize = function(bitSetIndex) {
		return _.min(_.map(octave, function(offset) {
			return shiftBitSetIndex(bitSetIndex, offset);
		}));
	};

	$("#pcCheckboxes button").each(function(){
		var button = $(this);
		var index = parseInt(button.data("index"));
		var angle = (OCTAVE_SIZE / 2 - index) * 2 * Math.PI / OCTAVE_SIZE;
		var radius = button.parent().width() / 2.5;
		button.css("top", (radius * (1 + Math.cos(angle))) + "px");
		button.css("left", (radius * (1 + Math.sin(angle))) + "px");
	});

	var parsePitchClasses = function(str) {
		if (str == "") {
			return [];
		}
		return _.map(str.split(","), function(i){ return parseInt(i);});
	}

	var getCanonicPitchClasses = function () {
		return setFromInt($("#canonic").val());
	};
	
	var getPitchClassesFromCheckboxes = function () {
		var values = $("#pcCheckboxes button.active").map(function(){return $(this).data('index')}).get();
		return parsePitchClasses(values.join(","));
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
		var sortedPitchClasses = _.sortBy(pitchClasses, function(i){return i});
		$("#pcNumbers").val(sortedPitchClasses.join());
		var bitSetIndex = setToInt(sortedPitchClasses);
		$("#pcBitSet").val(bitSetFromInt(bitSetIndex));
		$("#pcBitSetIndex").val(bitSetIndex);
		
		var canonicBitSetIndex = canonicalize(bitSetIndex);
		$("#canonicPcNumbers").val(setFromInt(canonicBitSetIndex).join());
		$("#canonicPcBitSet").val(bitSetFromInt(canonicBitSetIndex));
		$("#canonicPcBitSetIndex").val(canonicBitSetIndex);
		
		$("#canonic").val(canonicBitSetIndex);
	};
	
	var transpose = function(pitchClasses, offset) {
		return _.map(pitchClasses, function(pc) {
			return (pc + offset + OCTAVE_SIZE) % OCTAVE_SIZE;
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