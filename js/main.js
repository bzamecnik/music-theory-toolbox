// TODO:
// - use Backbone.js for the MVC pattern

$(document).ready(function() {
	var OCTAVE_SIZE = 12;
	var octave = _.range(OCTAVE_SIZE);

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

	(function() {
		var canonicBitSetIndexes = [0,4095,1365,585,1755,273,819,1911,65,195,325,455,
		715,845,975,1495,2015,1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,
		41,43,45,47,49,51,53,55,57,59,61,63,67,69,71,73,75,77,79,81,83,85,87,89,91,
		93,95,97,99,101,103,105,107,109,111,113,115,117,119,121,123,125,127,133,135,
		137,139,141,143,145,147,149,151,153,155,157,159,163,165,167,169,171,173,175,
		177,179,181,183,185,187,189,191,197,199,201,203,205,207,209,211,213,215,217,
		219,221,223,227,229,231,233,235,237,239,241,243,245,247,249,251,253,255,275,
		277,279,281,283,285,287,291,293,295,297,299,301,303,307,309,311,313,315,317,
		319,327,329,331,333,335,339,341,343,345,347,349,351,355,357,359,361,363,365,
		367,371,373,375,377,379,381,383,397,399,403,405,407,409,411,413,415,421,423,
		425,427,429,431,435,437,439,441,443,445,447,457,459,461,463,467,469,471,473,
		475,477,479,485,487,489,491,493,495,499,501,503,505,507,509,511,587,589,591,
		595,597,599,603,605,607,613,615,619,621,623,627,629,631,635,637,639,661,663,
		667,669,671,679,683,685,687,691,693,695,699,701,703,717,719,723,725,727,731,
		733,735,743,747,749,751,755,757,759,763,765,767,821,823,827,829,831,847,853,
		855,859,861,863,871,875,877,879,885,887,891,893,895,925,927,939,941,943,949,
		951,955,957,959,981,983,987,989,991,1003,1005,1007,1013,1015,1019,1021,1023,
		1367,1371,1375,1387,1391,1399,1403,1407,1455,1463,1467,1471,1499,1503,1519,
		1527,1531,1535,1759,1775,1783,1791,1919,1983,2047];
		var select = $("#canonic");
		_.each(_.sortBy(canonicBitSetIndexes, _.identity), function(index) {
			select.append("<option value='"+index+"'>["+setFromInt(index)+"]</option>");
		});
		
		var pitchNames = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
		var circle = $("#pcCheckboxes");
		for (i in pitchNames) {
			var name = pitchNames[i];
			circle.append('<button type="button" class="btn btn-large" name="pc-'+i+'" data-index="'+i+'">'+name+'</button>');
		};
		var maxWidth = _.max($("#pcCheckboxes button").map(function(){return $(this).width()}));
		var maxHeight = _.max($("#pcCheckboxes button").map(function(){return $(this).height()}));
		var halfWidth = maxWidth / 2;
		var halfHeight = maxHeight / 2;
		var radius = circle.width() / 2.5;
		$("#pcCheckboxes button").each(function(){
			var button = $(this);
			var index = parseInt(button.data("index"));
			var angle = (OCTAVE_SIZE / 2 - index) * 2 * Math.PI / OCTAVE_SIZE;
			button.width(maxWidth);
			button.css("top", (radius * (1 + Math.cos(angle)) - halfWidth) + "px");
			button.css("left", (radius * (1 + Math.sin(angle)) - halfHeight) + "px");
		});
	})();

	var parsePitchClasses = function(str) {
		if (str == "") {
			return [];
		}
		return _.map(str.split(","), function(i){ return parseInt(i);});
	}
	
	var getSelectedBitSetIndex = function() {
		return $("#pcCheckboxes").data("bitsetindex");
	};
	
	var setSelectedBitSetIndex = function(bitSetIndex) {
		$("#pcCheckboxes").data("bitsetindex", bitSetIndex);
	};
	
	var getPitchClassesFromCheckboxes = function () {
		var values = $("#pcCheckboxes button.active").map(function(){return $(this).data('index')}).get();
		return parsePitchClasses(values.join(","));
	};
	
	$("#pcCheckboxes button").click(function(){
		_.defer(function(){
			var pitchClasses = getPitchClassesFromCheckboxes();
			setSelectedBitSetIndex(setToInt(pitchClasses));
			modifyModel(_.identity);
		});
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
		var model = setFromInt(getSelectedBitSetIndex());
		var modifiedModel = modify(model);
		setSelectedBitSetIndex(setToInt(modifiedModel));
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
	
	$("#next-scale-degree").click(function(){
		modifyModel(function(pitchClasses) {
			var step = OCTAVE_SIZE - (pitchClasses[pitchClasses.length - 1] || 0);
			return transpose(pitchClasses, step);
		});
	});
	
	$("#prev-scale-degree").click(function(){
		modifyModel(function(pitchClasses) {
			var step = OCTAVE_SIZE - (pitchClasses[1] || 0);
			return transpose(pitchClasses, step);
		});
	});
	
	$("#canonic").change(function(){
		setSelectedBitSetIndex($("#canonic").val());
		modifyModel(_.identity);
	});
});