//套件跟設定檔載入的部分
module.exports = {
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
    const : helptext = ("我可以做到這些事喔OwO\n\
    *為可寫可不寫\n\
    \n\
    DJ功能\n\
    ~play youtubeurl : 播放或將音樂加入歌單\n\
    ~queue : 查看歌單\n\
    ~pause : 暫停播放\n\
    ~resume : 繼續播放\n\
    ~remove 歌曲ID : 移除指定ID歌曲\n\
    ~skip *(to 歌曲ID) : 跳至指定歌曲\n\
    ~exit : 讓我休息OwO\n\
    ~clear : 刪除訊息\n\
    \n\
    P網搜圖功能\n\
    ~premove (關鍵字) (p網id) : 將該圖從機器人資料庫刪除\n\
    ~padd (關鍵字) (p網id) : 將該圖新增至機器人資料庫\n\
    \n\
    \n\
    \n\
    測試中功能:\n\
    ~psearch (關鍵字) *(force): 在p網找圖並隨便挑一張圖po (輸入force則不猜別名)\n\
    ~play bilibiliurl : 播放或將音樂加入歌單\n\
"),

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
    const : tool = require("./tool_function.js"),
    const : discord = require("discord.js"),
    const : DJ_fct = require("./newDJ_function.js"),
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
        }*/
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
/*console.error = function(str){
    tool.Userlog("An Error Occurred!!!")
    originerr(str);
    fs.appendFile(tool.GetLogName(), "["+ new Date() + "] " +str+'\n', function readFileCallback(err, data){
    });
}*/
/*
request({
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
        'Cache-Control':' private, no-cache, no-store, must-revalidate',
        'content-security-policy': "default-src * data: blob: 'self';script-src *.facebook.com *.fbcdn.net *.facebook.net *.google-analytics.com *.virtualearth.net *.google.com 127.0.0.1:* *.spotilocal.com:* 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;connect-src *.facebook.com facebook.com *.fbcdn.net *.facebook.net *.spotilocal.com:* wss://*.facebook.com:* https://fb.scanandcleanlocal.com:* attachment.fbsbx.com ws://localhost:* blob: *.cdninstagram.com 'self' chrome-extension://boadgeojelhgndaghljhdicfkmllpafd chrome-extension://dliochdbjfkdbacpmhlcpmleaejidimm;block-all-mixed-content;upgrade-insecure-requests;",
        'Content-Encoding': 'gzip',
        'Strict-Transport-Security': 'max-age=15552000; preload',
        'Pragma': 'no-cache',
        'Vary': 'Sec-Fetch-Site, Sec-Fetch-Mode',
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '0',
        'Content-Type': 'text/html; charset="utf-8"',
        'X-FB-Debug': '/KwaKlYR24mOYGjKJpUEUqxnoU2K/PVpxw90Zivv6eysqD1YwvF9e3gPQdPij1dIUT7RiTiDdwAF9qoGFNP7uw==',
        'Date': 'Mon, 09 Nov 2020 15:48:06 GMT',
        'Alt-Svc': 'h3-29=":443"; ma=3600,h3-27=":443"; ma=3600',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive'
        
    },
    url: "https://www.facebook.com/pg/loli.iz.da.bezt.0/posts/?ref=page_internal",
    method: "GET",
},  function (error, response, body) {
        if (error || !body) {
            tool.Userlog("Occurr an error while getting Page data:\n" + error)
            return;
        }
        const $ = cheerio.load(body); // 載入 body
        fs.appendFile("test.html", $.html(), function readFileCallback(err, data){
        });
        //console.log($.html());
    })
*/



