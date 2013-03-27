// entities.js
(function(Box2D, Class, app) {
	var b2Vec2 = Box2D.Common.Math.b2Vec2,
		b2Body = Box2D.Dynamics.b2Body;

	// this is a base class that can be extended from to create other types of entities.
	// every game object should inherit from this class so it will have an update and draw method.
	// this class doesn't require Box2D bodies, so feel free to use it for other things
	var EntityBase = Class.extend({
		name: 'unknown',
		init: function() {
			// has a transform to hold values about its physical state
			this.transform = new app.util.Transform();

			// since HTML5 canvas expects rotation in radians, we want the value in the transform
			// to be in radians, so we have another variable to keep track of the rotation in degrees
			this.rotationInDegrees = 0;

			this.visible = true;
		},

		update: function(time) {
		},

		draw: function(context) {
		},

		getPosition: function(){
			return this.transform.position;
		},

		setPosition: function(x, y){
			this.transform.position.x = x;
			this.transform.position.y = y;
		},

		getRotation: function(){
			return this.rotationInDegrees;
		},

		setRotation: function(rotation){
			this.rotationInDegrees = rotation;
			this.transform.rotation = Math.toRadians(rotation);
		},

		getScale: function(){
			return this.transform.scale;
		},

		setScale: function(x, y){
			this.transform.scale.x = x;
			this.transform.scale.y = y;
		},

		isVisible: function(){
			return this.visible;
		},

		setVisible: function(value){
			this.visible = value;
		},
	});

	// this class draws an image with the transformation specified by its transform
	var Sprite = EntityBase.extend({
		init: function(image){
			this._super();
			this.image = new app.util.Bitmap(image);
		},

		draw: function(context){
			this.image.draw(context, this.transform);
		},

		getAlpha: function(){
			return this.image.alpha;
		},

		setAlpha: function(value){
			this.image.alpha = value;
		},
	});

	// This is our base physics entity that wraps the interaction of a box2d body 
	// so we may interact with it in pixel coordinates.
	// It has been created so that some simple things (such as position and velocity)
	// can be set or received in pixel coordinates. For more complex interactions 
	// you will either have to override this class and add additional functionality or 
	// access the body variable.
	var PhysicsEntity = EntityBase.extend({
		// pass in a created box2d body
		init: function(body){
			this._super();

			// save reference to body
			this.body = body;

			// add a reference to this class as the body's user data, so if we get the body
			// we know who it belongs to
			this.body.SetUserData(this);


			this.linearVelocity = new b2Vec2();
			this.angularVelocity = 0;

			this.updatePosition();
			this.updateVelocity();
			this.updateRotation();

			// cached vectors that are used for unit conversions so we don't have to 
			// keep creating new objects, which is expensive in JS.
			this.conversionVector = new b2Vec2();
			this.conversionVector2 = new b2Vec2();
		},

		// Each time update is called, get new data from the body.
		update: function(time){
			this.updatePosition();
			this.updateVelocity();
			this.updateRotation();
		},

		updatePosition: function(){
			app.util.Box2dUtil.b2Vec2Copy(this.body.GetPosition(), this.transform.position);
			this.transform.position.Multiply(app.util.b2ToPxMultiplier);
		},

		updateVelocity: function(){
			app.util.Box2dUtil.b2Vec2Copy(this.body.GetLinearVelocity(), this.linearVelocity);
			this.linearVelocity.Multiply(app.util.b2ToPxMultiplier);
			this.angularVelocity = this.body.GetAngularVelocity();
		},

		updateRotation: function(){
			this.transform.rotation = this.body.GetAngle();
			this.rotationInDegrees = Math.toDegrees(this.transform.rotation);
		},

		setPosition: function(x, y){
			this._super(x, y);
			this.conversionVector.Set(x * app.util.pxToB2Multiplier, y * app.util.pxToB2Multiplier);
			this.body.SetPosition(this.conversionVector);
		},

		setRotation: function(rotation){
			this._super(rotation);
			this.body.SetAngle(this.transform.rotation)
		},

		getWorldCenter: function(){
			app.util.Box2dUtil.b2Vec2Copy(this.body.GetWorldCenter(), this.conversionVector);
			this.conversionVector.Multiply(app.util.b2ToPxMultiplier);
			return this.conversionVector;
		},

		getLinearVelocity: function(){
			return this.linearVelocity;
		},

		setLinearVelocity: function(velocity){
			app.util.Box2dUtil.b2Vec2Copy(velocity, this.linearVelocity);
			this.conversionVector.Set(velocity.x * app.util.pxToB2Multiplier, velocity.y * app.util.pxToB2Multiplier);
			this.body.SetLinearVelocity(this.conversionVector);
		},

		getAngularVelocity: function(){
			return this.angularVelocity;
		},

		setAngularVelocity: function(velocity){
			this.angularVelocity = velocity;
			this.body.SetAngularVelocity(this.angularVelocity * app.util.pxToB2Multiplier);
		},

		applyForce: function(force, point){
			this.conversionVector.Set(force.x * app.util.pxToB2Multiplier, force.y * app.util.pxToB2Multiplier);
			this.conversionVector2.Set(point.x * app.util.pxToB2Multiplier, point.y * app.util.pxToB2Multiplier);
			this.body.ApplyForce(this.conversionVector, this.conversionVector2);
		},

		applyImpulse: function(impulse, point){
			this.conversionVector.Set(impulse.x * app.util.pxToB2Multiplier, impulse.y * app.util.pxToB2Multiplier);
			this.conversionVector2.Set(point.x * app.util.pxToB2Multiplier, point.y * app.util.pxToB2Multiplier);
			this.body.ApplyImpulse(this.conversionVector, this.conversionVector2);
		},

		applyTorque: function(torque){
			this.body.ApplyTorque(torque * app.util.pxToB2Multiplier);
		},

		// Collision events, called when the body of this object collides with another object.
		// Because data comes from box2d, the contact is in box2d coordinates.
		onCollisionStart: function(collidingBody, contact) {
		},

		onCollisionEnd: function(collidingBody, contact) {
		},

		onCollision: function(collidingBody, contact) {
		},

		postSolve: function(collidingBody, contact, impulse) {
		},
	});

	// entity that combines the characteristics of both the physics entity and the sprite entity
	var GameEntity = PhysicsEntity.extend({
		init: function(body, image){
			this._super(body);
			this.image = new app.util.Bitmap(image);
		},

		draw: function(context){
			this.image.draw(context, this.transform);
		},

		getAlpha: function(){
			return this.image.alpha;
		},

		setAlpha: function(value){
			this.image.alpha = value;
		},
	});

	///////////////////////////////////////////////////////////////////////////////
	// Entities beyond this point were created strictly for demo purposes

	var Background = Sprite.extend({
		init: function(screenWidth, screenHeight){
			this._super(app.assets.images['bg']);
			this.setPosition(screenWidth / 2, screenHeight / 2);
		},
	});

	var WALL_IMPULSE_MULTIPLIER = 150;
	var TRIANGLE_BUMPER_IMPULSE_MULTIPLIER = 200;
	var CIRCLE_BUMPER_IMPULSE_MULTIPLIER = 250;
	var RECTANGLE_BUMPER_IMPULSE_MULTIPLIER = 300;

	var Pinball = GameEntity.extend({
		init: function(){
			var circle = app.util.Box2dUtil.createCircle(20, new b2Vec2(100,480), 45, 0.3, false);
			this._super(circle, app.assets.images['ball']);
			this.body.SetSleepingAllowed(false);

			// cached variables
			this.collisionImpulse = new b2Vec2();
		},

		update: function(time){
			this._super();

			// make sure ball always has a minimum velocity
			var vel = this.getLinearVelocity().Copy();
			var length = vel.Length();
			if (length < 100){
				vel.Normalize();
				vel.Multiply(100);
				this.setLinearVelocity(vel);
			}
			else if (length > 400){
				vel.Normalize();
				vel.Multiply(400);
				this.setLinearVelocity(vel);
			}
		},

		onCollision: function(collidingBody, contact) {
			var collidingEntity = collidingBody.GetUserData();

			// get point of contact
			app.util.Box2dUtil.b2Vec2Copy(app.util.Box2dUtil.getWorldPointFromContact(contact), this.collisionImpulse);

			// convert to pixels
			this.collisionImpulse.Multiply(app.util.b2ToPxMultiplier);

			// get vector pointing opposite from collision point
			app.util.Box2dUtil.b2Vec2Subtract(this.getPosition(), this.collisionImpulse, this.collisionImpulse);

			// normalize 
			this.collisionImpulse.Normalize();

			if (collidingEntity instanceof OuterWall){

				// multiply by impulse amount
				this.collisionImpulse.Multiply(WALL_IMPULSE_MULTIPLIER);			
			}

			else if (collidingEntity instanceof RectangleBumper){
				// play sound
				app.util.soundController.playSoundEffect('bumper1', 0.75);

				// multiply by impulse amount
				this.collisionImpulse.Multiply(RECTANGLE_BUMPER_IMPULSE_MULTIPLIER);
			}

			else if (collidingEntity instanceof CircleBumper){
				// play sound
				app.util.soundController.playSoundEffect('bumper2', 0.75);

				// multiply by impulse amount
				this.collisionImpulse.Multiply(CIRCLE_BUMPER_IMPULSE_MULTIPLIER);
			}

			else if (collidingEntity instanceof TriangleBumper){
				// play sound
				app.util.soundController.playSoundEffect('bumper3', 0.75);

				// multiply by impulse amount
				this.collisionImpulse.Multiply(TRIANGLE_BUMPER_IMPULSE_MULTIPLIER);
			}

			// apply impulse
			this.applyImpulse(this.collisionImpulse, this.getPosition());
		},
	})

	// just used to distinguish the wall from other entities
	var OuterWall = PhysicsEntity.extend({
		init: function(positionX, positionY, width, height){
			var box = app.util.Box2dUtil.createBox(new b2Vec2(positionX, positionY), width, height, 0, 1, true);
			this._super(box);
		},
	});

	var RectangleBumper = GameEntity.extend({
		init: function(positionX, positionY){
			var box = app.util.Box2dUtil.createBox(new b2Vec2(positionX, positionY), 200, 40, 0, 1, true);
			this._super(box, app.assets.images['rectangle']);
		},
	});

	var TriangleBumper = GameEntity.extend({
		init: function(positionX, positionY){
			// vertices in local coordinates
			var verts = [new b2Vec2(-27, 61), new b2Vec2(-28, -65), new b2Vec2(-17, -69), new b2Vec2(60, 30)];
			var triangle = app.util.Box2dUtil.createPolygon(new b2Vec2(positionX, positionY), verts, 0, 1, true);
			this._super(triangle, app.assets.images['polygon']);
		},
	});

	var CircleBumper = GameEntity.extend({
		init: function(positionX, positionY, scale){
			var circle = app.util.Box2dUtil.createCircle(60 * scale, new b2Vec2(positionX, positionY), 0, 1, true);
			this._super(circle, app.assets.images['circle']);
			this.setScale(scale, scale);
		}
	});

	app.entity.EntityBase = EntityBase;
	app.entity.Sprite = Sprite;
	app.entity.PhysicsEntity = PhysicsEntity;
	app.entity.GameEntity = GameEntity;

	// non generic
	app.entity.Background = Background;
	app.entity.Pinball = Pinball;
	app.entity.OuterWall = OuterWall;
	app.entity.RectangleBumper = RectangleBumper;
	app.entity.TriangleBumper = TriangleBumper;
	app.entity.CircleBumper = CircleBumper;

}(Box2D, Class, app));