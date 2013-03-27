// game.js
(function (window, document, app) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;

    function Game() {
        // get the drawing canvas and context of the game
        this.canvas = document.getElementById('surface');
        this.context = this.canvas.getContext('2d');

        // initialize some basic information about the game world
        this.screenWidth = this.canvas.width;
        this.screenHeight = this.canvas.height;
        this.totalGameTime = 0;

        // create a list of entities to be updated and drawn
        this.entities = [];

        // create a Box2d world that will handle the physics
        app.util.Box2dUtil.createWorld(new b2Vec2(0, 0));

        // set up debug checkbox
        var debugContext = document.getElementById('debug').getContext('2d');
        var checkbox = document.getElementById('debugToggle');
        checkbox.addEventListener('click', function(e){
            app.util.Box2dUtil.toggleDebugDraw(debugContext, checkbox.checked);
        });

        // create entities
        this.initializeGame();

        // after initialization, hook up to and start the dispatcher to begin calling updates
        app.util.dispatcher.register(this);
        app.util.dispatcher.start();
    }

    // This method is where we create all the entities for the demo.
    // For your game you may have a more complicated creation structure.
    // Also note that the order that elements are in the array corresponds 
    // to the order in which they are drawn.
    Game.prototype.initializeGame = function(){

        // walls
        this.addEntity(new app.entity.OuterWall(-5, this.screenHeight / 2, 10, this.screenHeight / 1.5));
        this.addEntity(new app.entity.OuterWall(this.screenWidth + 5, this.screenHeight / 2, 10, this.screenHeight / 1.5));
        this.addEntity(new app.entity.OuterWall(this.screenWidth / 2, -5, this.screenWidth / 2, 10));
        this.addEntity(new app.entity.OuterWall(this.screenWidth / 2, this.screenHeight + 5, this.screenWidth / 2, 10));

        var w = new app.entity.OuterWall(120, 45, 265, 10);
        w.setRotation(-23);
        this.addEntity(w);
        var w = new app.entity.OuterWall(120, 435, 265, 10);
        w.setRotation(23);
        this.addEntity(w);
        var w = new app.entity.OuterWall(680, 45, 265, 10);
        w.setRotation(23);
        this.addEntity(w);
        var w = new app.entity.OuterWall(680, 435, 265, 10);
        w.setRotation(-23);
        this.addEntity(w);

        // background
        var b = new app.entity.Background(this.screenWidth, this.screenHeight);
        this.addEntity(b);

        // bumpers
        var s1 = new app.entity.RectangleBumper(675, 100);
        s1.setRotation(23);
        this.addEntity(s1);

        var t1 = new app.entity.TriangleBumper(575, 250);
        t1.setRotation(25);
        this.addEntity(t1);

        var t2 = new app.entity.TriangleBumper(200, 350);
        this.addEntity(t2);

        var c1 = new app.entity.CircleBumper(240, 175, 1);
        this.addEntity(c1);

        var c2 = new app.entity.CircleBumper(400, 350, 1);
        this.addEntity(c2);

        var c3 = new app.entity.CircleBumper(450, 150, 0.6);
        this.addEntity(c3);

        // pinball, and apply impulse to start moving
        var p = new app.entity.Pinball();
        p.setPosition(650, 400);
        p.applyImpulse(new b2Vec2(0, -300), p.getPosition());
        this.addEntity(p);

        // start some background music
        app.util.soundController.playSoundTrack('background');
    };

    Game.prototype.addEntity = function(entity){
        this.entities.push(entity);
    };

    Game.prototype.removeEntity = function(entity) {
        var index = this.entities.indexOf(entity);
        if (index >= 0) {
            this.entities.splice(index, 1);
        }
    };

    // called by the dispatcher
    Game.prototype.update = function(time) {
        // update total game time
        this.totalGameTime += time.delta;

        // update the Box2d physics
        app.util.Box2dUtil.updateWorld(time.delta);

        // update each entity, passing in a time object that holds the delta time since last update,
        // the current time, and the previous update time
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update(time);
        }

        // after update, draw everything
        this.draw();
    };

    Game.prototype.draw = function() {
        // clear our drawing context for a new draw
        this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);

        var entity;
        for (var i = 0; i < this.entities.length; i++) {
            entity = this.entities[i];
            if (entity.isVisible()) entity.draw(this.context);
        }
    };

    // app entry point: load assets, then on completion create a global instance of the game
    app.assets.load(function(){
        app.game = new Game();
    });

}(window, document, app));
