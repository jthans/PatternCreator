// Determines if a set of two arrays are equivalent or not, no matter the order.
function areArraysEqual(arrayOne, arrayTwo) {
	if (arrayOne === arrayTwo) { return true; }
	if (isNull(arrayOne) || isNull(arrayTwo)) { return false; }
	if (arrayOne.length !== arrayTwo.length) { return false; }

	var arrOneCopy = arrayOne.slice().sort();
	var arrTwoCopy = arrayTwo.slice().sort();

	for (var a = 0; a < arrOneCopy.length; a++) {
		if (arrOneCopy[a] !== arrTwoCopy[a]) {
			return false;
		}
	}

	return true;
}

// Declares if an object is NULL or not for easy comparisons sake.
function isNull(obj) {
	return !(obj !== null &&
			 obj !== '' &&
			 obj !== undefined &&
			 obj != NaN &&
			 (!Array.isArray(obj) || obj.length > 0)); // Array Handling.
}

// Determines if a pair of points is the same as two coordinates passed.  This allows for
//  transposal of the coordinates and still being recognized the same.  (Storage not in X, Y.)
function isPair(points, p1, p2) {
	return (points[0] == p1 && points[1] == p2) ||
		(points[1] == p1 && points[0] == p2);
}

// Calculates the slope of a line. Pretty 8th grade stuff.
function lineSlope(p1, p2) {
	return (p2.yLoc - p1.yLoc) / (p2.xLoc - p1.xLoc);
}