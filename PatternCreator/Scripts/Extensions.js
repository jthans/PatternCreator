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
		(points[1] == p1 && points[0] == [2]);
}