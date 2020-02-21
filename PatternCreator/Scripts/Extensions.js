// Declares if an object is NULL or not for easy comparisons sake.
function isNull(obj) {
	return !(obj !== null &&
			 obj !== '' &&
			 obj !== undefined &&
			 obj != NaN);
}