// transform.js
(function(Box2D, app) {
	var b2Vec2 = Box2D.Common.Math.b2Vec2;

	// collection of rotation, scale, and position values
	function Transform(posX, posY, scaleX, scaleY, rotation) {
		this.position = new b2Vec2(posX || 0, posY || 0);
		this.scale = new b2Vec2(scaleX || 1, scaleY || 1);
		this.rotation = rotation || 0;
	};

	Transform.prototype.copy = function(transform){
		app.util.Box2dUtil.b2Vec2Copy(transform.position, this.position);
		app.util.Box2dUtil.b2Vec2Copy(transform.scale, this.scale);
		this.rotation = transform.rotation;
	};

	app.util.Transform = Transform;

}(Box2D, app));