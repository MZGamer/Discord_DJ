const COOKIE = config.youtubecookie;
class MusicData {
    constructor(method, title, url) {
        this._method = method;
        this._title = title;
        this._url = url;
    }
    get method() {
        return this._method;
    }
    get title() {
        return this._title;
    }
    get url() {
        return this._url;
    }

}
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
    msgCheck(msg) {
        
    }
    
}
module.exports;