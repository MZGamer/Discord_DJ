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

module.exports = MusicData;