
//套件跟設定檔載入的部分
/*module.exports = {
    //常數
    var : Meme = false,
    var : waiting = false,
    var : Nomeme= false,
    var : Checking = false,
    var : botsleeping = false,
    const : QueueTemp = [],
    var : stop = false,
    const : voicestate = {
        voicechannel: null,
        textchannel: null,
        connection: null,
        songsqueue: [],
        volume: 1,
        StreamDispatcher: null
    },
    //help
    const : helptext,

    //設定檔與資料庫
    const : config = require("./config.json"),
    const : pixivTemp = require("./pixivtemp.json"),

    //P網模組
    //const : PixivAppApi  = require("pixiv-app-api"),
    const : pixivImg = require("pixiv-img"),
    const : PixivApi = require('pixiv-api-client'),

    //DJ用模組
    const : ytdl = require('ytdl-core'),
    const : ytpl = require('ytpl'),
    const : ytsr = require('ytsr'),
    const : ibili = require('ibili'),
    const : biliAPI = require('bili-api'),

    //FB自動推文模組
    const : request = require("request"),
    const : cheerio = require("cheerio"),

    //系統支援
    const : fs = require('fs'),
    const : url = require('url'),

    //模組載入
    const : tool = require("./modulePackage/tool_module.js"),
    const : discord = require("discord.js"),
    const : DJ_Moduel,
    const : Meme_fct = require("./Meme_function.js"),
   // const : pixiv_fct = require("./pixiv_function.js"),
    const : fb_fct = require("./fb_function.js"),
    const : newpixiv = require("./newPixiv.js"),

    const : client = new discord.Client()

}

//登入通知(顯示於下方小黑框)
client.on("ready",async()=>{
    ytsr.do_warn_deprecate = false;
    tool.emptyDir("./media/")
    newpixiv.loginAcc()
    client.user.setActivity('可愛的飯糰熊',{ type: 'PLAYING' })
    //tool.sleeping()
    tool.Userlog(`${client.user.tag} 開始工作!`);
    
    //fb_fct.FBPicUpdate()
    //setInterval(()=>fb_fct.FBPicUpdate(),450000)
});

//訊息偵測
client.on("message",msg=>{   
    if(!botsleeping || (botsleeping && msg.member.hasPermission("ADMINISTRATOR"))){
        //自動回覆區
        //Meme_fct.CheckIfMeme(msg)
        //指令偵測區
        /*if(msg.content.split(" ")[0] === "-play" && tool.VoiceChk(msg) && state.voicechannel === null){
            return msg.channel.send('我.......我失業了嗎  ・゜・(PД`q｡)・゜・')
        }
        if(msg.content[0] === "~"){
            newpixiv.Pixiv_Msg_Chk(msg)
            if (!tool.VoiceChk) {
                return msg.channel.send('OwO?')
            }
            else{
                DJ_fct.DJMsgChk(msg)
            }
        }
    }
    
})

//機器人登入
client.login(config.token);
var originerr = console.error;
*/

var test = "~play https://www.youtube.com/watch?v=AUrPtFR7hiU&ab_channel=%E5%BF%85%E8%97%8D%E8%92%B8%E6%B0%A3-%E6%B3%95%E5%AD%90";
var reg = /^~play /;
console.log(test.split(reg));

