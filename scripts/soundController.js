//soundController.js
(function (window, app) {


    function SoundController() {
        this.sounds = app.assets.sounds;
        this.lastTrack = null;
        this.currentlyMutedTracks = false;
        this.currentlyMutedEffects = false;
        this.lastMutedAt = 0;
        this.playedMutedTrackAt = 0;
    }


    SoundController.prototype.playSoundEffect = function (effect, volume) {
        if (this.currentlyMutedEffects){
            return;
        }
        else {
            var sound = this.sounds[effect];
            sound.volume = volume > 1 ? volume / 100 : volume;
            sound.play();
        }
    };

    SoundController.prototype.playSoundTrack = function (newtrackId) {
        var self = this;
        var sound = this.sounds[newtrackId];
        if (this.lastTrack === sound) {
            return;
        }
        if (this.lastTrack != undefined) {
            this.lastTrack.pause();
            (function () {
                var trackToReset = self.lastTrack;
                window.setTimeout(function () {
                        trackToReset.currentTime = 0;
                }, 1500);
            }());
        }
        this.lastTrack = sound;
        if (!this.currentlyMutedTracks) {
            sound.play();
        }
        else {
            this.playedMutedTrackAt = Date.now();
        }
    };

    SoundController.prototype.muteTracks = function (mute) {
        var sound;
        if (mute) {
            for (var m = 0; m < this.sounds.length; m++) {
                sound = this.sounds[m];
                if (sound["isTrack"] === true) {
                    sound.muted = true;
                }
            }
            this.lastMutedAt = Date.now();
        }
        else {
            for (var m = 0; m < this.sounds.length; m++) {
                var sound = this.sounds[m];
                sound.muted = false;
            }
            if (this.lastMutedAt !== 0) {
                if (this.playedMutedTrackAt !== 0) {
                    var timeDifference = Date.now() - this.playedMutedTrackAt;
                    this.lastTrack.currentTime = (timeDifference % (this.lastTrack.duration * 1000)) / 1000;

                }
                else if (this.lastTrack.currentTime === 0) {
                    var timeDifference = Date.now() - this.lastMutedAt;
                    this.lastTrack.currentTime += (timeDifference % (this.lastTrack.duration * 1000)) / 1000;
                }
            }
            this.playedMutedTrackAt = 0;
            this.lastMutedAt = 0;
            this.lastTrack.play();
        }
            
        this.currentlyMutedTracks = mute;
    };

    SoundController.prototype.muteEffects = function (mute) {
        var sound;
        if (mute) {
            for (var m = 0; m < this.sounds.length; m++) {
                sound = this.sounds[m];
                if (sound["isTrack"] === false) {
                    sound.muted = true;
                }
            }
        }
        else {
            for (var m = 0; m < this.sounds.length; m++) {
                sound = this.sounds[m];
                if (sound["isTrack"] === false) {
                    sound.muted = false;
                }
            }
        }
        this.currentlyMutedEffects = mute;
    }

    SoundController.prototype.isMutedTracks = function () {
        return this.currentlyMutedTracks;
    };

    SoundController.prototype.isMutedEffects = function () {
        return this.currentlyMutedEffects;
    };

    app.util.soundController = new SoundController();

}(window, app));