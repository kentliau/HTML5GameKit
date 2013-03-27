<<<<<<< HEAD
HTML5GameKit
============

A HTML5 Game Kit/Framework from http://www.contrejour.ie/
=======
HTML5 Game Pack
What is it?
The HTML5 Game Pack is a lightweight Javascript library that provides some basic infrastructure game developers can use to jump start their development of HTML5 games. Features include:
-	Basic game infrastructure to periodically update and render game entities.
-	Physics engine integration.
-	Sound controller for playing sound effects and music tracks.
-	Asset loading.
This engine utilizes the following third party libraries:
-	Box2dWeb (http://code.google.com/p/box2dweb/).
-	PxLoader (http://thinkpixellab.com/pxloader/).
-	Modernizr (http://modernizr.com/).
-	Simple Javascript Inheritence (http://ejohn.org/blog/simple-javascript-inheritance/).
How can you use it?
There are infinite roads a developer can take to create a game. This framework merely tries to provide a structure that others can expand upon and make fit their own application. That being said, you can follow these basic instructions as a starting point.
1.)	Ready Your Assets:
-	Places all your game images in the “img” folder. The loader assumes all images are in png format, but if your assets are in a different format change the “imgExt” variable in the Assets.js file to the format extension.
-	All popular browsers support either mp3 or ogg file format, so make sure to duplicate any sound assets so you have both file types and place them in the appropriate sub folder in the “sound” directory.
-	In the Assets.js file, navigate to the “initializeAssets” function and add the appropriate files to the assets list using the addImage and addSound functions. Feel free to remove the images and sounds used in the pinball demo.
2.)	Create Your Entity Types:
-	Your game is most likely going to need more complex entity types than the base classes. To create different types, navigate to Entities.js and make new types that inherit from the base classes and implement your specific game logic. Use the pinball game entities as examples of what to do.

3.)	Implement Your Game Start Logic
-	The Game class provides a method called “initializeGame”. Inside this method you should add any game start logic your game needs to get going. You will probably need to create new entities and add them to the game, or maybe start some music. Use the pinball startup code as an example.
Other Details
This section provides technical details about the major portions of the library.
1.) Dispatcher.js
Unlike many other types of software, games are architected as a continuous loop that updates the game world. In this engine, the Dispatcher class takes care of notifying the browser to update the game. It looks to see if the browser implements the requestAnimationFrame API (http://msdn.microsoft.com/en-us/library/ie/hh773174(v=vs.85).aspx) and uses it if it exists. If the browser does not support this feature, it falls back to using setTimeout. On every callback, the game world is updated and then the game loop is reregistered with the browser.
2.) Assets.js
A good web game should make sure all of its assets have been received before the game starts. The Assets class is in charge of preloading all the sound and image assets that are needed for the game. When all the images and sounds have been loaded or a timeout is reached, it calls a user-specified callback function (in this case, the creation of the game).
3.) SoundController.js
Sound is very important to games, even though many developers consider audio design as an afterthought. The sound controller class (in tandem with the assets class) provides a lightweight method for playing sounds. It provides methods for playing both short audio effects and longer periods of background music. Just specify the type of sound in the Assets class and it will be ready for play.
4.) Game.js
The Game class is the object that the Dispatcher updates every time frame. It is the parent class of the game itself and contains a list of all the entities that make up our game world. On each update call from the dispatcher, the game keeps track of the total game time, calls the update method of each game entity, updates the Box2d physics engine, and draws the entities.

5.) Namespace.js
Namespace is the first non-third party file that the html page loads. Its purpose is to set up a global application object that encapsulates the game, thereby preventing pollution of the global javascript scope. The engine currently defines four namespaces: assets (that contains a single instance of our Assets class), game (that contains a single instance of our Game class), util (that holds various utility classes), and entity (which holds all the entity classes that can populate the game world).
6.) Entities.js
The Entities file defines some base classes that can be added to the game world and/or inherited from to create more complex game objects. Four main types are defined: 
a.)	EntityBase – This class contains all the base functions that every entity in our game should contain no matter what its purpose, because the methods are generic and can be called by many features of the engine. It contains an update and draw method, as well as getters and setters for its position, rotation, scale, and visibility properties.
b.)	Sprite – This class is simply an EntityBase with the addition of a Bitmap (our wrapper for an HTML image) that is drawn using the entity’s position, scale, and rotation coordinates.
c.)	The PhysicsEntity class is a helpful wrapper around a Box2d body that provides some useful properties. Box2d does its calculations in meters-kilograms-second units (http://www.box2d.org/manual.html#_Toc258082967), which does not exactly correspond to the pixel units of HTML5. Also, Box2d (as well as the HTML5 canvas) does its rotation calculations in radians, while most people intuitively think of rotations in degrees. On every update it takes the position, rotation, and velocity of the body it owns and translates them to pixel and degree coordinates for easy access by the programmer. It also lets you interact with the body (in ways such as setting position, setting rotation, setting velocity, or applying forces) in the same fashion, so you don’t have to worry about conversions yourself. Alternatively, you can access the body variable and interact with it using standard Box2d values. This entity type also sets the body’s user data to point to its parent entity and contains some collision methods that are called when its body is involved in a collision (see the Box2dUtil section for more information).
d.)	The GameEntity class simply combines the abilities of the Sprite and PhysicsEntity classes.

7.)  Box2dUtil.js
Box2dUtil is essentially a wrapper around Box2d that makes it easier for the game to use. It contains methods to create and update a Box2d world object and keeps this world logically separated from the game world. It also defines some helper methods for creating Box2d bodies in pixel – degree coordinates. Most importantly, this class sets up the game’s collision system in the initContactListener method (For more information about Box2d and contact listeners, see http://www.box2d.org/manual.html#_Toc258082975). If you recall, the PhysicsEntity class sets its body’s user data to point to the entity. Therefore, Box2dUtil tells Box2d that upon a body collision event to look at the user data. If the user data isn’t null, we know that this particular body has an entity attached to it and we should notify said entity that a collision has occurred by calling the appropriate collision method. Note that the values passed to the collision event are all Box2d values, and have not been wrapped.

>>>>>>> update readme.md
