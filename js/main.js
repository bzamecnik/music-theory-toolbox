var OCTAVE_SIZE = 12;
var octave = _.range(OCTAVE_SIZE);

var setFromInt = function(bitset) {
  return normalizePitchClasses(_.filter(octave, function(i){
    return (bitset & (1 << i)) > 0;
  }))
};

var setToInt = function(set) {
  var powersOfTwo = _.map(set, function(i) { return 1 << i; });
  var sum = _.reduce(powersOfTwo, function(sum, i){ return sum + i; }, 0);
  return sum;
};

var bitSetFromInt = function(index) {
  return _.map(octave, function(i){
    return (index & (1 << (octave.length - i - 1))) > 0 ? 1 : 0;
  }).join("")
};

var bitSetToInt = function(bitset) {
  if (!bitset || !/^[01]{12}$/.test(bitset)) {
    return undefined;
  }
  var index = 0;
  var size = bitset.length;
  for (i in bitset) {
    if (bitset[i] == "1") {
      index += 1 << (size - i - 1);
    }
  }
  return index;
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

var getRoot = function(bitSetIndex, canonicBitSetIndex) {
  for (var i = 0; i < OCTAVE_SIZE; i++) {
      if (shiftBitSetIndex(canonicBitSetIndex, i) == bitSetIndex) {
        return i;
      }
  }
};

var pitchNames = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

var pcSetNames = {
  "145": {chord: "X", root: 0},
  "137": {chord: "Xm", root: 0},
  "291": {chord: "Xmaj7", root: 1},
  "329": {chord: "X7", root: 8},
  "73": {chord: "Xm b5", root: 0},
  "585": {chord: "Xdim", root: 0, scale: "X symmetric 4-tone"},
  "273": {chord: "Xaug", root: 0, scale: "X symmetric 3-tone"},
  "293": {chord: "Xm7b5", root: 2},
  "297": {chord: "Xm7", root: 5},
  "275": {chord: "XmMaj7", root: 1},
  "133": {chord: "X2", root: 0},
  "165": {chord: "X2,4", root: 0},
  //"597": {chord: "X9", root: 2},
  "589": {chord: "X7 b9", root: 2},
  "613": {chord: "X7 #9", root: 2},
  "725": {chord: "X11", root: 2},
  //"1387": {chord: "X13", root: 8, scale: "X diatonic (major)"},
  "1387": {scale: "X diatonic (major)", root: 1},
  "1371": {scale: "X melodic minor", root: 1},
  "859": {scale: "X harmonic minor", root: 1},
  "875": {scale: "X harmonic major", root: 1},
  "871": {scale: "X double harmonic major", root: 1},
  "1365": {scale: "X symmetric hexatonic", root: 0},
  "1755": {scale: "X symmetric octatonic", root: 0},
  "597":  {scale: "pentatonic, complement to X melodic minor", root: 8},
  "661":  {scale: "pentatonic, complement to X diatonic", root: 6},
  "1367": {scale: "X major locrian", root: 8},
};

var getName = function(bitSetIndex) {
  var canonic = canonicalize(bitSetIndex);
  var offset = getRoot(bitSetIndex, canonic);
  var template = pcSetNames[canonic];
  var result = {chord:"", scale: ""};
  if (template) {
    var root = (offset + template.root + OCTAVE_SIZE) % OCTAVE_SIZE;
    var rootName = pitchNames[root];
    if (template.chord) {
      result.chord = template.chord.replace("X", rootName);
    }
    if (template.scale) {
      result.scale = template.scale.replace("X", rootName);
    }
  }
  return result;
};

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

var parsePitchClasses = function(value) {
  if (typeof value === 'string') {
    if (!/^[0-9]+(,[0-9]+){0,11}$/.test(value)) {
      return undefined;
    }
    var values = value.split(",").filter(_.identity).map(v => parseInt(v))
  } else {
    var values = value;
  }
  return normalizePitchClasses(values);
}

var normalizePitchClasses = function(values) {
  return _.sortBy(_.uniq(_.filter(values, v => v >= 0 && v < OCTAVE_SIZE)), _.identity);
}

var transpose = function(pitchClasses, offset) {
  return normalizePitchClasses(_.map(pitchClasses, function(pc) {
    return (pc + offset + OCTAVE_SIZE) % OCTAVE_SIZE;
  }));
};

var invert = function(pitchClasses, offset) {
  return normalizePitchClasses(_.map(pitchClasses, function(pc) {
    return (offset - pc + OCTAVE_SIZE) % OCTAVE_SIZE;
  }));
};

var complement = function(pitchClasses) {
  return setFromInt((2 << (OCTAVE_SIZE - 1)) - 1 - setToInt(pitchClasses));
};

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function getInitialPitchClasses() {
  var pcs = getURLParameter("pcs");
  if (pcs && pcs != "null") {
    return parsePitchClasses(pcs);
  }
  return [0, 4, 7] // C major chord;
}

var app = new Vue({
  el: '#app',
  data: {
    // This is the place to store the master data.
    // NOTE: v-model of checkbox buttons doesn't work with computed set(),
    // (why?), so we bind to the array of numeric pitch classes here.
    pitchClasses: getInitialPitchClasses(),
    pitchClassNames: pitchNames,
    canonicBitSets: _.sortBy(canonicBitSetIndexes, _.identity).map(function(setIndex) {
      return {'index': setIndex, 'pitchClasses': "[" + setFromInt(setIndex) + "]"};
    })
  },
  computed: {
    // set of pitch classes (array of numbers)
    pitchClassesStr: {
      get: function() {
        return this.pitchClasses;
      },
      set: function(value) {
        var parsedPitchClasses = parsePitchClasses(value);
        if (parsedPitchClasses) {
          this.setPitchClasses(parsedPitchClasses);
        }
      }
    },
    bitSetIndex: {
      get: function() {
        return setToInt(this.pitchClasses);
      },
      set: function(value) {
        this.setPitchClasses(setFromInt(value));
      }
    },
    bitSet: {
      get: function() {
        return bitSetFromInt(this.bitSetIndex);
      },
      set: function(value) {
        var bitSetIndex = bitSetToInt(value);
        if (bitSetIndex !== undefined) {
          this.pitchClasses = setFromInt(bitSetIndex);
        }
      }
    },
    name: function() {
      return getName(this.bitSetIndex);
    },
    canonicBitSetIndex: {
      get: function() {
        return canonicalize(this.bitSetIndex);
      },
      set: function(value) {
        // keep the canonic offset
        this.bitSetIndex = shiftBitSetIndex(value, this.offsetToCanonic);
      }
    },
    canonicPitchClasses: function() {
      return setFromInt(this.canonicBitSetIndex);
    },
    canonicBitSet: function() {
      return bitSetFromInt(this.canonicBitSetIndex);
    },
    offsetToCanonic: function() {
      return getRoot(this.bitSetIndex, this.canonicBitSetIndex);
    }
  },
  methods: {
    setPitchClasses: function(values) {
      this.pitchClasses = normalizePitchClasses(values);
    },
    transpose: function(offset) {
      this.setPitchClasses(transpose(this.pitchClasses, offset));
    },
    // offset in scale degrees
    transposeInScale: function(steps) {
      var setSize = this.pitchClasses.length;
      var index = (setSize + (-steps % setSize)) % setSize;
      var pcOffset = OCTAVE_SIZE - (this.pitchClasses[index] || 0);
      this.transpose(pcOffset);
    },
    invert: function() {
      this.setPitchClasses(invert(this.pitchClasses, 0));
    },
    complement: function() {
      var mask = (2 << (OCTAVE_SIZE - 1)) - 1;
      this.bitSetIndex = mask - this.bitSetIndex;
    },
    clear: function() {
      this.pitchClasses = [];
    }
  },
  mounted: function() {
    // make buttons the same size and arrange them into a circle
    var circle = $("#pcCheckboxes");
    var buttons = $(".btn", circle);
    var maxWidth = _.max(buttons.map(function(){return $(this).outerWidth()}));
    var maxHeight = _.max(buttons.map(function(){return $(this).outerHeight()}));
    var center = circle.width() / 2;
    var buttonDiameter = Math.max(maxWidth, maxHeight);
    var radius = center - buttonDiameter / 2;
    buttons.each(function(){
      var button = $(this);
      var index = parseInt(button.data("index"));
      // from bottom counter-clockwise (WTF?)
      var angle = (OCTAVE_SIZE / 2 - index) * 2 * Math.PI / OCTAVE_SIZE;
      button.css("top", (center + radius * Math.cos(angle)) + "px");
      button.css("left", (center + radius * Math.sin(angle)) + "px");
    });
  }
});

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-40015611-2', 'bzamecnik.github.io');
ga('send', 'pageview');
