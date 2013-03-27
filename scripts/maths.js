// maths.js
// this file adds some extra math methods to the global math object
(function(Box2D, app) {

	Math.toDegrees = function(radians) {
		return radians * 57.2957795;
	};

	Math.toRadians = function(degrees) {
		return degrees * 0.0174532925;
	};

	Math.lerp = function(a, b, f) {
		return a + f * (b - a);
	};

}(Box2D, app));