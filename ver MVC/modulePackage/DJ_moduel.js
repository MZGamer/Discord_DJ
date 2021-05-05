const DJ_MODEUL = require("./model/DJ_Module/DJ.js");
const DJ_VIEW = require("./view/");
const DJ_CONTROLLER = require("./controller/DJ_Controller.js");

class DJ_Moduel{
    constructor() {
        this._moduel = DJ_MODEUL;
        this._view = DJ_VIEW;
        this._controller = DJ_CONTROLLER;
    }

}
module.exports = DJ_Moduel;