class DJ {
    constructor() {
        this._MusicList = [];
        this._voicestate = {
            voicechannel: null,
            textchannel: null,
            connection: null,
            songsqueue: [],
            volume: 1,
            StreamDispatcher: null
        };
        this.progressCache;
        this.nowPlayingMsg;
    }
    msgCheck(action,msg) {
        action(msg);
    }

    @this.msgCheck
    addSong(msg) {
        if(/^~play /.test(msg)) {
            var music;
            if(/c/)
            this._voicestate.songsqueue.push();
        }
    }

    removeSong() {

    }

    play() {

    }

    pause () {

    }

    exitChannel() {

    }

    joinChannel() {

    }
    
}

module.exports = DJ;