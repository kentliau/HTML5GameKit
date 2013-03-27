// assets.js
(function (window, PxLoader, Modernizr, app) {
    var AssetTags = {
        GAMEIMAGE: 'game-image'
    };

    // this class loads all the necessary game assets
    var Assets = function () {
        // px loader for loading images
        this.loader = new PxLoader({
            'noProgressTimeout': 10000
        });

        // directory that contains your images
        this.imgDir = 'img/';
        this.imgExt = '.png';

        // sound type supported (using Modernizr)
        this.soundExt = Modernizr.audio.mp3 ? '.mp3' : '.ogg';
        this.soundDirExt = Modernizr.audio.mp3 ? 'mp3/' : 'ogg/';

        // directory that contains your sounds
        this.soundDir = 'sound/' + this.soundDirExt;

        // array to hold all images
        this.images = [];

        // array to hold all the sounds
        this.sounds = [];

        // array for unloaded sounds;
        this.unloadedSounds = []
    };

    // this method stores the image element in an array
    // however, the image has not yet been downloaded
    Assets.prototype.addImage = function (asset, priority) {
        var url = this.imgDir + asset + this.imgExt;
        this.images[asset] = this.loader.addImage(url, [AssetTags.GAMEIMAGE], priority);
    };

    // this method stores the sound element in an array
    // however, the sound has not yet been downloaded
    Assets.prototype.addSound = function(asset, isTrack){
        var url = this.soundDir + asset + this.soundExt;
        var audioTag = new Audio();
        this.sounds[asset] = audioTag;
        this.unloadedSounds[asset] = audioTag;

        // mark if this is a background track
        audioTag["isTrack"] = isTrack || false;
        if (audioTag["isTrack"]) {
            audioTag.loop = "loop";
        }

        audioTag.loadComplete = false;
        audioTag.preload = "auto";
        audioTag.src = url;
        audioTag.load();
    };

    // this function starts the loading process and when complete calls the completeCallback function
    Assets.prototype.load = function(completeCallback){
        this.initializeAssets();

        // flags to tell us when both sounds and images are loading
        var imagesLoaded = false;
        var soundsLoaded = false;
        var callBackCalled = false;


        this.loader.addCompletionListener(function(){ 
            imagesLoaded = true;
            if (soundsLoaded && !callBackCalled){
                completeCallback();
                callBackCalled = true;
            }
        }, [AssetTags.GAMEIMAGE]);

        this.loader.start([AssetTags.GAMEIMAGE]);

        // set up an interval to check when sounds are done
        var self = this;
        var soundLoaderInterval = window.setInterval(function () {

            var soundLoadComplete = true;
            var sound;
            for (var i = self.unloadedSounds.length - 1; i >= 0; i--) {
                sound = self.unloadedSounds[i]
                if (!sound.loadComplete) {
                    // mark as complete if done downloading
                    if (sound.readyState === 4) {
                        sound.loadComplete = true;
                    }
                    // signal that the sounds aren't done loading
                    else {
                        soundLoadComplete = false;
                        break;
                    }
                }
            }

            // if done, clear interval and call the callback if images are done loading
            if (soundLoadComplete) {
                window.clearInterval(soundLoaderInterval);
                soundsLoaded = true;
                if (imagesLoaded && !callBackCalled){
                    completeCallback();
                    callBackCalled = true;
                }
            }
        }, 300);

        window.setTimeout(function () {
            if (!soundsLoaded || !imagesLoaded) {
                window.clearInterval(soundLoaderInterval);
                completeCallback();
                callBackCalled = true;
            }
        }, 10000);
    };

    // this function is where you want to load your game specific assets
    Assets.prototype.initializeAssets = function(){
        //images
        this.addImage('ball');
        this.addImage('circle');
        this.addImage('polygon');
        this.addImage('rectangle');
        this.addImage('bg');

        //sounds
        this.addSound('bumper1');
        this.addSound('bumper2');
        this.addSound('bumper3');
        this.addSound('background', true);
    };

    app.assets = new Assets();

}(window, PxLoader, Modernizr, app));