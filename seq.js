var math = require('mathjs'); //Lots of cool functions; can't quite make them work.

/******
CONSTANTS

Mostly constants from HSPF.  These are variables that
aren't recalculated during the entire sequence.

Comments are HSPF variable name | WWHM value (most common) | explanation

******/

var infiltRatio       = 2;   // INFILD | 2 | ratio of maximum to mean infiltration capacity
var interInflow       = 1;   // INTFW | 1 | interflow inflow parameter
var lowerZoneStore    = 3;   // LZS | 3 | lower zone storage
var lowerZoneStoreNom = 5;   // LZSN | 5 | nominal lower zone storage
var infilt            = 1.5; // INFILT | 1.5 | infiltration parameter (in/interval)
var infiltExp         = 2;   // INFEXP | 2 | exponent parameter greater than one 
var infiltFrozen      = 1;   // INFFAC | ? | probably computed considering frozen conditions in WWHM

/******
FUNCTIONS

Mostly hydrologic functions from HSPF, transcribed as accurately
as possible from the 12.2 documentation.

Some additional helper functions, such as a random sequence
generator.

******/

// Create a sequence of "rep" length of randomly
//  selected positive (floating point) numbers,
//  with an upper bound of "upper".
function randomPositiveSeq(rep, upper) {
    upper = (typeof upper === 'undefined') ? 1 : upper;
    
    var seq = [];
    for (var i=0; i<rep; i++) {
        seq[i] = Math.abs(Math.random()) * upper;
    }
    
    return seq;
};

// Equivalent to the IBAR parameter in HSPF
//  Mean infiltration capacity over a the land segment (inches/interval)
function infiltCapacityMean(infilt, lowerZoneStore, lowerZoneStoreNom, infiltExp, infiltFrozen) {
    return (infilt / Math.pow((lowerZoneStore/lowerZoneStoreNom), infiltExp)) * infiltFrozen;
}

// Equivalent to IMAX parameter in HSPF
//  Maximum infiltrative capacity (inches/interval)
//  infiltCapacityMean should be the result of the function by the same name
function infiltMaxCapacity(infiltRatio, infiltCapacityMean) {
    return infiltRatio*infiltCapacityMean;
}

function infiltMinCapacity(infiltMaxCapacity, infiltCapacityMean) {
    return infiltCapacityMean - (infiltMaxCapacity - infiltCapacityMean);
}

function ordinateRatio(interInflow, lowerZoneStore, lowerZoneStoreNom) {
    return interInflow * (Math.pow(2, (lowerZoneStore/lowerZoneStoreNom)));
}

/*****
CODE

Test out functions.

******/

var rep       = 3600000; // 3.6 million is 100 years of 15 minute increments (about)
var intercept = 0.01;    // Interception of precipitation in inches/time interval.

var rainfall = randomPositiveSeq(rep, 4); // Series of "rep" length of precipitation in inches/time interval.
var evap     = randomPositiveSeq(rep); // Series of "rep" length of evapotranspiration potential in inches/time interval.
var seq1     = [];

for (var i=0; i<rep; i++) {
    seq1[i] = infiltCapacityMean(infilt, lowerZoneStore, lowerZoneStoreNom, infiltExp, infiltFrozen);
}

console.log(rainfall[2031]);
console.log(evap[2031]);
console.log(seq1[2031]);
console.log(math.median(seq1));
