// box2dUtil.js
(function (Box2D, app) {

    var Box2dUtil = {};
    //--------------------box2d Helpers  -----------------------//
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2AABB = Box2D.Collision.b2AABB,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2World = Box2D.Dynamics.b2World,
        b2MassData = Box2D.Collision.Shapes.b2MassData,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
        b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
        b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
        b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
        b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
        b2WorldManifold = Box2D.Collision.b2WorldManifold;

    // add to generic util scope for ease of access
    // converts coordinates from Box2d to pixel and vice versa
    app.util.b2ToPxMultiplier = 30.0;
    app.util.pxToB2Multiplier = 1.0 / app.util.b2ToPxMultiplier;

    // reference to world so once we create it the game doesn't have to keep track of it
    Box2dUtil.world = null;

    Box2dUtil.createWorld = function (gravity) {
        var g = gravity.Copy();
        g.Multiply(app.util.pxToB2Multiplier);
        this.world = new b2World(g, true);
        this.world.SetContinuousPhysics(true);
        Box2dUtil.initContactListener();
    };

    // Simple timestep
    Box2dUtil.updateWorld = function (dt) {
        this.world.Step(
        dt, //adaptive step rate
        16, //velocity iterations
        20 //position iterations
        );

        this.world.DrawDebugData();

        this.world.ClearForces();
    };

    // Init Box2D's debug draw
    Box2dUtil.toggleDebugDraw = function(context, toggle){

        if (toggle){
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(context);
            debugDraw.SetDrawScale(app.util.b2ToPxMultiplier);
            debugDraw.SetFillAlpha(0.3);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
            this.world.SetDebugDraw(debugDraw);
        }
        else{
            this.world.SetDebugDraw(null);
            context.clearRect(0, 0, 800, 480);
        }
    };

    // vector copy by reference
    Box2dUtil.b2Vec2Copy = function (inVec, outVec) {
        outVec.x = inVec.x;
        outVec.y = inVec.y;
    };

    // vector addition by reference
    Box2dUtil.b2Vec2Add = function (a, b, r) {
        r.x = a.x + b.x;
        r.y = a.y + b.y;
    };

    // vector subtraction by reference
    Box2dUtil.b2Vec2Subtract = function (a, b, r) {
        r.x = a.x - b.x;
        r.y = a.y - b.y;
    };

    // the following methods are for creating bodies and fixtures in Box2d. They are designed to take html5
    // pixel coordinates and degrees as parameters so you don't have to worry about the conversion yourself.

    Box2dUtil.createCircle = function (radius, position, rotation, density, isStatic) {
        var circle = new b2CircleShape(radius * app.util.pxToB2Multiplier);
        return this.bodyFromShape(circle, position, rotation, density, isStatic);
    };

    Box2dUtil.createPolygon = function (position, vertices, rotation, density, isStatic) {
        var polygon = new b2PolygonShape();
        var transformedVerts = [];
        var copiedVert;
        for (var i = 0; i < vertices.length; i++){
            copiedVert = vertices[i].Copy();
            copiedVert.Multiply(app.util.pxToB2Multiplier);
            transformedVerts.push(copiedVert);
        }
        polygon.SetAsArray(transformedVerts, transformedVerts.length);
        return this.bodyFromShape(polygon, position, rotation, density, isStatic);
    };

    Box2dUtil.createBox = function (position, width, height, rotation, density, isStatic) {
        var box = new b2PolygonShape();
        box.SetAsBox(width * app.util.pxToB2Multiplier / 2.0, height * app.util.pxToB2Multiplier / 2.0);
        return this.bodyFromShape(box, position, rotation, density, isStatic);
    };

    Box2dUtil.bodyFromShape = function (shape, position, rotation, density, isStatic) {
        var def = new b2BodyDef();
        def.type = isStatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
        def.position = position.Copy();
        def.position.Multiply(app.util.pxToB2Multiplier);
        def.angle = Math.toRadians(rotation);
        var returnBody = this.world.CreateBody(def);
        var fixture = Box2dUtil.addShape(shape, returnBody, density);
        return returnBody;
    };

    Box2dUtil.addShape = function (shape, body, density, friction) {
        var fixDef = new b2FixtureDef();
        fixDef.shape = shape;
        fixDef.density = density;
        fixDef.restitution = 0.0;
        fixDef.friction = friction || 1;
        return body.CreateFixture(fixDef);
    };

    // The following method creates a contact listener and applies it to the Box2d world. The four methods on
    // the listener are called by Box2d at various points in the physics simulation (see box2d documentation for more information).
    // The PhysicsEntity class sets the user data of a body to point to the entity that owns it, so we can 
    // notify an entity when it should handle a collision.
    Box2dUtil.initContactListener = function() {
        var contactListener = new Box2D.Dynamics.b2ContactListener();

        contactListener.BeginContact = function(contact) {
            var entity1 = contact.GetFixtureA().GetBody().GetUserData();
            var entity2 = contact.GetFixtureB().GetBody().GetUserData();

            if (entity1) {
                entity1.onCollisionStart(contact.GetFixtureB().GetBody(), contact);
            }

            if (entity2) {
                entity2.onCollisionStart(contact.GetFixtureA().GetBody(), contact);
            }
        }

        contactListener.EndContact = function(contact) {
            var entity1 = contact.GetFixtureA().GetBody().GetUserData();
            var entity2 = contact.GetFixtureB().GetBody().GetUserData();

            if (entity1) {
                entity1.onCollisionEnd(contact.GetFixtureB().GetBody(), contact);
            }

            if (entity2) {
                entity2.onCollisionEnd(contact.GetFixtureA().GetBody(), contact);
            }
        }

        contactListener.PreSolve = function(contact, oldManifold) {
            if (contact.IsTouching()) {
                var entity1 = contact.GetFixtureA().GetBody().GetUserData();
                var entity2 = contact.GetFixtureB().GetBody().GetUserData();

                if (entity1) {
                    entity1.onCollision(contact.GetFixtureB().GetBody(), contact);
                }

                if (entity2) {
                    entity2.onCollision(contact.GetFixtureA().GetBody(), contact);
                }
            }
        }

        contactListener.PostSolve = function(contact, impulse) {
            if (contact.IsTouching()) {
                var entity1 = contact.GetFixtureA().GetBody().GetUserData();
                var entity2 = contact.GetFixtureB().GetBody().GetUserData();

                if (entity1) {
                    entity1.postSolve(contact.GetFixtureB().GetBody(), contact, impulse);
                }

                if (entity2) {
                    entity2.postSolve(contact.GetFixtureA().GetBody(), contact, impulse);
                }
            }
        }

        this.world.SetContactListener(contactListener);
    };

    // helper method for getting the contact point out of a collision
    Box2dUtil.getWorldPointFromContact = function (contact) {
        var worldManifold = new b2WorldManifold();
        contact.GetWorldManifold(worldManifold);
        return worldManifold.m_points[0];
    };

    app.util.Box2dUtil = Box2dUtil;

}(Box2D, app));