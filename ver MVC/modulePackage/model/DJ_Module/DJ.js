class DJ {
    constructor() {
        this.MusicList = [];
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
    
}
module.exports = DJ;