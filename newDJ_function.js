module.exports = {
    var : waitForNext = 0,
    var : waitForExit = 0,
    const : COOKIE = config.youtubecookie,
    var : nowplayingMSG = null,
    var : nowplaying = null,
    var : CheckingQueue = false,
    const : ReadyForAdd = [],
    DJMsgChk : function (msg){
        let Execute = msg.content.split(" ");
        for(i=0;i<Execute.length;i++)
            if(Execute[i] == " "){
                Execute.splice(i, 1);
                i--;
            }
        call = Execute[0].split("~")[1];
        //播放音樂
        if(call.toLowerCase() === "play" || call.toLowerCase() === "p"){
            if(tool.NullChk(Execute[1]))
                msg.reply("對不起，窩不知道你在說甚麼QwQ");
            else{
                if(msg.member.voice.channel!=voicestate.voicechannel && voicestate.voicechannel!=null){
                    msg.reply("對不起，我在工作中，不過歡迎您過來一起玩 (,,・ω・,,)");
                }
                else if (msg.member.voice.channel == null){
                    msg.reply("你要先進語音我才能幫你播歌喔 (,,・ω・,,)");
                }
                else{
                    ReadyForAdd.push({url: Execute[1], who : msg, err : false})
                    if(ReadyForAdd.length == 1)
                        this.DJ();
                    else if (ReadyForAdd[0].err == true) {
                        ReadyForAdd.shift();
                        this.DJ();
                    }
                }
            }
        }
        //meme控制
        else if(call === "nomeme"){
        msg.reply("了解しました (,,・ω・,,)");
             Nomeme = true;
        }    
        else if(call === "meme"){
            msg.reply("了解しました (,,・ω・,,)");
            Nomeme = false;
        }
        //顯示歌單
        else if(call.toLowerCase() === "queue" || call.toLowerCase() === "q"){
            if(!CheckingQueue){
                CheckingQueue = true;
                msg.reply("了解しました 請稍等  (,,・ω・,,)");
                this.queue(msg);
            }
            else{
                msg.reply("我......我在查惹  (๑´ㅁ`)")
                }
        }
        //幫助
        else if(call.toLowerCase() === "help" || call.toLowerCase() === "h"){
            this.help(msg);
        }
    
        else if(call.toLowerCase() === "clear"){
            this.clear(msg);
        }
        //需進頻道才可動作
        if(voicestate.voicechannel!=null){
            //跳過歌曲
            if(call.toLowerCase() === "skip"){
                if(!tool.NullChk(Execute[1]) &&　Execute[1].toLowerCase() === "to"){
                    chk = Execute[2];
                    if(! parseInt(chk) ||tool.NullChk(chk)){
                        return;
                    }
                    else{
                        this.skip(msg,parseInt(Execute[2]));
                    }
                }   
                else if (Execute[1] === undefined)
                    this.skip(msg);
            }
    
            //移除歌曲
            else if (call.toLowerCase() === "remove"){
                var target;
                if(!tool.NullChk(Execute[1])){                
                    if(parseInt(Execute[1])){
                        target = parseInt(Execute[1]);
                        this.remove(msg,target);
                    }
                }
            }
            //暫停歌曲
            else if (call.toLowerCase() === "pause"){
                this.pause(msg);
            }
            //繼續播放
            else if (call.toLowerCase() === "resume"){
                this.resume(msg);
            }
    
            //離開
            else if(call.toLowerCase() === "exit"){
                this.exit();
            }
        }
    },

    join : async function(msg){
        tool.Userlog("Try to join a Voicechannel")
        nowplaying = null,
        nowplayingMSG = null,
        voicestate.voicechannel = msg.member.voice.channel;
        voicestate.textchannel = msg.channel;
        voicestate.connection = await voicestate.voicechannel.join();
    },

    //音樂播放設定
    DJ : async function(){
        var info = ReadyForAdd[0].url;
        var msg = ReadyForAdd[0].who;
        var added = false;
        audiodata = {
            type : "",
            title : "",
            url : "",
            length : ""
        };
        if(ytpl.validateID(info)){
            list = await ytpl.getPlaylistID(info);
            try{
            videoset = await ytpl(list);
            }
            catch{
                ReadyForAdd[0].err = true;
                tool.Userlog("Occurred an Error while getting the data of YT PlayList, Retrying......")
                if(!tool.IsRetry()){
                    async function ret(){
                        try{
                            await DJ_fct.DJ()
                        }
                        catch{
                            throw "Retry"
                        }
                    };
                    tool.Retry(ret,0);
                    return;
                }
                else{
                    throw "Retry";
                }
            }
            tool.Userlog(msg.author.username + " add a YT PlayList to queue");
            for(au=0;au<videoset.items.length;au++){
                audiodata = {
                    type : "YT",
                    title : videoset.items[au].title,
                    url : videoset.items[au].shortUrl,
                    length : videoset.items[au].durationSec
                };
                voicestate.songsqueue.push(audiodata);
            }
            added = true;
        }
        else if(ytdl.validateURL(info)){
            audiodata.type = "YT";
            audiodata.title = null;
            audiodata.url = info;
            audiodata.length = null;
            voicestate.songsqueue.push(audiodata);
            tool.Userlog(msg.author.username + " add a YT audio to queue");
            added = true;
        }
        if(added){
            ReadyForAdd.shift();
            if(voicestate.songsqueue.length == 1){
                msg.reply("了解しました  (≧∀≦)ゞ");
            }
            else{
                msg.reply("幫你加到歌單了喔 (*´∀`)~♥");
            }
            if(nowplaying == null)
                this.play(voicestate.songsqueue[0].url,msg);
            if(ReadyForAdd.length>0)
                this.DJ()
            this.getVideoData();
        }
    },
            
        //YT搜索
        /*
        await ytsr(info,{limit: 5},(err,result,mes = msg) => {
            if(err){
                throw err
            }
            else{
                try{
                    this.DJ(mes,result.items[0].link)
                }
                catch{
                    msg.reply("對不起，窩不知道你在說甚麼QwQ")
                }
            }
        })
            
            
    },*/
    //YT搜索功能

    //播放音樂
    play : async function (info,msg){
        clearTimeout(waitForExit);
        if (voicestate.voicechannel === null){
            try{
                await this.join(msg);
            }
            catch{
                tool.Userlog("Occurred an error while join an audio channel, Retrying......");
                if(!tool.IsRetry()){
                    async function ret(){
                        try{
                            await DJ_fct.play(info,msg);
                        }
                        catch{
                            throw "Retry"
                        }
                    };
                    tool.Retry(ret,0);
                    return;
                }
                else{
                    throw "Retry";
                }
            }
            
        }
        try{
            nowplaying = voicestate.songsqueue[0];
            voicestate.StreamDispatcher = voicestate.connection.play(ytdl(info,{filter:'audioonly',quality: 'highest',highWaterMark:40000000000 ,requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } })
                .on('info', async (info) => {
                    voicestate.StreamDispatcher.setVolumeDecibels(5);
                    if(nowplaying.length == null){}
                        nowplaying.length = info.videoDetails.lengthSeconds;
                    if(nowplaying.title == null)
                        nowplaying.title = info.videoDetails.title;
                    voicestate.songsqueue[0] = nowplaying;
                    tool.Userlog("Playing " + nowplaying.title + "(Youtube)")
                    client.user.setActivity(nowplaying.title,{ type: 'LISTENING' })
                    if(!Meme)
                        nowplayingMSG = await voicestate.textchannel.send("現正播放: " + nowplaying.title);

                    waitForNext = setTimeout(() => this.nextsong(msg), parseInt(nowplaying.length)*1000)
                })
            );
        }
        catch{
            tool.Userlog("Occurred an error while play an audio, Retrying......");
            if(!tool.IsRetry()){
                async function ret(){
                    try{
                        await DJ_fct.play(info,msg);
                    }
                    catch{
                        throw "Retry"
                    }
                };
                tool.Retry(ret,0);
                return;
            }
            else{
                throw "Retry";
            }
            
        }
    },
    nextsong(msg){
        if(nowplayingMSG!=null)
            msg.channel.messages.delete(nowplayingMSG);
        Meme = false;
        voicestate.songsqueue.shift();
        if(voicestate.songsqueue.length != 0)
            this.play(voicestate.songsqueue[0].url,msg);
        else if(!Meme){
            voicestate.textchannel.send("えーと.......沒有下一首了喔(●´ω｀●)ゞ");
            waiting = true;
            this.exitchannel();
        }
    },
    //顯示歌單
    queue : async function (msg){
        if(voicestate.songsqueue.length === 0){
            msg.reply("現在沒有歌喔  (灬ºωº灬)");
        }
        else{
            var output ="";
            for(queuesize=0;queuesize<Math.ceil(voicestate.songsqueue.length/10);queuesize++){
                if(queuesize === 0){
                    output =  "\n目前歌單:\n";
                }
                else{
                    output =""
                }
                for (k =20*queuesize;k<voicestate.songsqueue.length;k+=0){
                    output = output + (k+1) +". " + voicestate.songsqueue[k].title +"\n";
                    k++;
                    if(k!=0 && k%20 === 0){
                        break;
                    }
                }
                if(output!=""){
                    msg.channel.send(output);
                }
            }     
        }
        CheckingQueue = false;
    },

    //閒置離開
    exitchannel : async function(){
        waitForExit = setTimeout(() => {
            voicestate.textchannel.send("我先去休息了喔 _(:3 」∠ )_");
            this.exit();
        },60000);
    },

    //跳過歌曲
    skip : function (msg,target){
        if(target == undefined || target == 1){
            target = 1;
        }
        else if (target >voicestate.songsqueue.length){
            msg.reply("對不起......我找不到這首歌・゜・(PД`q｡)・゜・");
            return;
        }
        else{
            target --;
        }
        if(waitForExit)
            return;
        msg.reply("了解しました 請稍等  (,,・ω・,,)");
        Meme = false;
        try{
            voicestate.StreamDispatcher.pause();
	    clearTimeout(waitForNext);
        }
        catch{
        }
        for(i = 0;i<target;i++){
            voicestate.songsqueue.shift();
            if(i == 0)
                nowplayingMSG.delete();
        }
        if(voicestate.songsqueue.length != 0){
            Meme = false;
            this.play(voicestate.songsqueue[0].url,msg);
        }
        else{
            voicestate.textchannel.send("えーと.......沒有下一首了喔(●´ω｀●)ゞ");
            this.exitchannel();
        }
    },

    //移除歌曲
    remove : function (msg,target){
        if (target === 1){
            this.skip(msg);
            msg.reply("了解しました  (,,・ω・,,)");
        }
        else if(target>voicestate.songsqueue.length || target<0){
            msg.reply("對不起......我找不到這首歌・゜・(PД`q｡)・゜・")
        }
        else if(target>0 && target<=voicestate.songsqueue.length){
            voicestate.songsqueue.splice(target-1, 1);
            msg.reply("了解しました 已移除歌曲  (,,・ω・,,)");
        }
    },

    //暫停播放
    pause : function (msg){
        if(stop ===false){
            stop = true;
            msg.reply("了解しました  (,,・ω・,,)")
            voicestate.StreamDispatcher.pause();
            clearTimeout(waitForNext);
        }
    },

    //繼續播放
    resume : function (msg){
        if(stop ===true){
            stop = false;
            msg.reply("了解しました  (,,・ω・,,)")
            voicestate.StreamDispatcher.resume();
            waitForNext = setTimeout(() => this.nextsong(msg), parseInt(nowplaying.length)*1000 - voicestate.StreamDispatcher.streamTime)
        }
    },

    //幫助
    help : function (msg){
        msg.reply(helptext);
    },

    //離開
    exit : function (){
        if(voicestate.voicechannel!= null)
            voicestate.voicechannel.leave();
        clearTimeout(waitForNext);
        voicestate.voicechannel = null;
        voicestate.textchannel = null;
        voicestate.songsqueue = [];
        voicestate.connection= null;
        voicestate.StreamDispatcher = null;
        nowplayingMSG = null,
        nowplaying = null,
        client.user.setActivity('可愛的飯糰熊',{ type: 'PLAYING' })
        tool.Userlog("Try to exit the Voicechannel")
    },

    clear : async function (msg){
        var key
        var cl = await msg.channel.messages.fetch({ limit: 100 })
        key = cl.keyArray()
        var lastkill
        for(i = 0;i<key.length;i++){
            try{
                ready = cl.get(key[i])
                if(ready.content[0] === '~')
                    await msg.channel.messages.delete(ready)
                else if (ready.author.username == "DJ デルミン")
                    await msg.channel.messages.delete(ready)
                else{
                    if(ready.content === lastkill)
                        await msg.channel.messages.delete(ready)
                    else{
                        for(k =0;k<config.ReplyTarget.length;k++){
                            for(m =0;m<config.ReplyTarget[k].targetmsg.length;m++){
                                if(ready.content === config.ReplyTarget[k].targetmsg[m]){
                                    lastkill = ready.content
                                    await msg.channel.messages.delete(ready)
                                    break
                                }
                            }
                        }
                    }
                }
            }
            catch{
            }
        }
        msg.reply("清除完畢 (,,・ω・,,)");
    },

    getVideoData : async function(){
        for(chk=1;chk<voicestate.songsqueue.length;chk++){
            if(voicestate.songsqueue[chk].title == null && voicestate.songsqueue[chk].type == "YT"){
                try{
                    videodata = await ytdl.getInfo(voicestate.songsqueue[chk].url,{requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } });
                }
                catch{
                    tool.Userlog("Occurred an Error while getting the data of YT audio, Retrying......")
                    if(!tool.IsRetry()){
                        async function ret(){
                            try{
                                await DJ_fct.getVideoData()
                            }
                            catch{
                                throw "Retry"
                            }
                        };
                        tool.Retry(ret,0);
                        return;
                    }
                    else{
                        throw "Retry";
                    }
                }
                voicestate.songsqueue[chk].length = videodata.videoDetails.lengthSeconds;
                voicestate.songsqueue[chk].title = videodata.videoDetails.title;
            }
        }
    }
}
//bot = DJ デルミン