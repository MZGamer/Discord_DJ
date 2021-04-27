module.exports = {
    var : waitingID = 0,
    var : bilimode = false,
    const : COOKIE = config.youtubecookie,
    const : downloading = [],
    const : downloadint = [],
    var :test = undefined,
    var : nowplaying = {},
    var : nowplayingMSG = null,
    DJMsgChk : function (msg){
        let splitMessage = msg.content.split(" ");
        //播放音樂
        if(splitMessage[0] === "~play"){
            if(tool.NullChk(splitMessage[1]))
                msg.reply("對不起，窩不知道你在說甚麼QwQ");
            else{
                if(msg.member.voice.channel!=state.voicechannel && state.voicechannel!=null){
                    msg.reply("對不起，我在工作中，不過歡迎您過來一起玩 (,,・ω・,,)");
                }
                else if (msg.member.voice.channel == null){
                    msg.reply("你要先進語音我才能幫你播歌喔 (,,・ω・,,)");
                }
                else{
                    var info = ""
                    for(i=1;i<splitMessage.length;i++){
                        info += splitMessage[i]
                    }
                    this.DJ(msg, info);
                }
            }
    
        }
        //meme控制
        else if(splitMessage[0] === "~nomeme"){
        msg.reply("了解しました (,,・ω・,,)");
             Nomeme = true;
        }    
        else if(splitMessage[0] === "~meme"){
            msg.reply("了解しました (,,・ω・,,)");
            Nomeme = false;
        }
        //顯示歌單
         else if(splitMessage[0] === "~queue"){
            if(!Checking){
                Checking = true;
                msg.reply("了解しました 請稍等  (,,・ω・,,)");
                this.queue(msg);
            }
            else{
                msg.reply("我......我在查惹  (๑´ㅁ`)")
                }
        }
        //幫助
        else if(splitMessage[0] === "~help"){
            this.help(msg);
        }
    
        else if(splitMessage[0] === "~clear"){
            this.clear(msg);
        }
    
        //需在頻道內動作
        if(state.voicechannel!=null){
    
            //跳過歌曲
            if(splitMessage[0] === "~skip"){
                if(splitMessage[1] === "to"){
                    chk = msg.content.split(" ")[2];
                    if(typeof chk != 'number' ||tool.NullChk(chk)){
                        return;
                    }
                    else{
                        this.skip(msg,msg.content.split(" ")[2]);
                    }
                }   
                else if (msg.content.split(" ")[1] === undefined)
                    this.skip(msg);
            }
    
            //移除歌曲
            else if (splitMessage[0] === "~remove"){
                var target
                    if(!tool.NullChk(splitMessage[1])){                
                        if(parseInt(splitMessage[1]))
                            target = parseInt(splitMessage[1]);
                            this.remove(msg,target);
                        }
                    }
    
            //暫停歌曲
            else if (splitMessage[0] === "~pause"){
                this.pause(msg);
            }
    
            //繼續播放
            else if (splitMessage[0] === "~resume"){
                this.resume(msg);
            }
    
            //離開
            else if(splitMessage[0] === "~exit"){
                this.exit();
            }
        }
    },

    join : async function(msg){
        tool.Userlog("Try to join a Voicechannel")
        nowplaying = {},
        nowplayingMSG = null,
        state.voicechannel = msg.member.voice.channel;
        state.textchannel = msg.channel;
        state.connection = await state.voicechannel.join();
    },

    //音樂播放設定
    DJ : async function(msg, info){
        let splitMessage = info.split("/");
        try{
            listid = await ytpl.getPlaylistID(info)
        }
        catch{
            listid = null
        }

        //B站
        if(splitMessage[2] == "www.bilibili.com"){
            var urlcut = splitMessage[4].split("?")
            var BV = urlcut[0]
            var pv
            try{
                pv = parseInt(urlcut[1].split("=")[1])
            }
            catch{
                pv = 1
            }
            if(isNaN(pv))
                pv = 1            
            let biliinfo = await biliAPI({ bvid: BV },['view'])
            var duration = biliinfo.view.data.pages[pv-1].duration
            //console.log(test.view.data.title)
            var filename = biliinfo.view.data.title
            QueueTemp.push(filename)
            state.songs.push({info:"./media/"+filename+".flv",Time:duration});
            downloading.push("./media/"+filename+".flv")
            if(state.songs.length == 1 && !Meme){
                msg.reply("了解しました  (≧∀≦)ゞ (bilibili影片需要下載 請稍等喔)");
                waiting = false
                if (state.voicechannel === null){
                    await this.join(msg);
                }
            }
            else{
                msg.reply("幫你加到歌單了喔 (*´∀`)~♥ (bilibili影片需要下載 請稍等喔)");
            }
            fs.access("./media/"+filename+".flv",async function(err){
                //    檔案和目錄不存在的情況下；
                if(err){
                    if(err.code == "ENOENT"){
                        tool.Userlog("Start Download " + filename)
                        test = ibili.downloadVideo({
                            av :biliinfo.view.data.aid,
                            filename:biliinfo.view.data.title,
                            sessdata:"26960ca0%2C1606401210%2C489a1*51",
                            P:pv,
                            oncomplete:function(){
                                tool.Userlog(filename + " is download complete")
                                downloading.splice(downloading.indexOf("./media/"+filename+".flv"),1)
                            }
                        }).then(()=>{
                            if(state.songs[0].info == "./media/"+filename+".flv"&&!Meme){
                                DJ_fct.play(state.songs[0],msg);
                            }
                        })
                    }
                }
            })          
            return
        }
            
        //YT播放清單
        else if(ytpl.validateID(listid)){
            msg.reply("了解しました  (ゝ∀･)");
            ytpl(info).then(async playlist=> {
                var Temp = playlist.items;
                var chk = 0;
                for(p=0;p<Temp.length;p++){
                    if(Temp[p].title!="[Deleted video]"){
                        state.songs.push(Temp[p].url_simple);
                        QueueTemp.push(Temp[p].title);
                        chk++;
                    }
                }
                if(!Meme && state.songs.length === chk){
                    msg.reply("歌單準備完成 (≧∀≦)ゞ");
                    DJ_fct.play(state.songs[0],msg);
                    return
                }
                else{
                    if(downloading.indexOf(state.songs[0].info) != -1){
                        msg.reply("下一首歌還在下載中 先跳至這首喔 (*´∀`)~♥");
                        state.songs.unshift(info);
                        await ytdl.getInfo(info,{ requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } },(err, info) =>{
                            QueueTemp.unshift(info.title);
                        });
                        this.play(state.songs[0],msg)                    
                    }
                    else{
                        msg.reply("幫你加到歌單了喔 (*´∀`)~♥");
                    }
                    return
                }
            });
            return
        }

        //YT單影片
        else if(ytdl.validateURL(info)){
            if(state.songs.length == 0 && !Meme){
                msg.reply("了解しました  (≧∀≦)ゞ");
                state.songs.push(info);
                var videodata = await ytdl.getInfo(info,{requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } });
                QueueTemp.push(videodata.videoDetails.title);
                this.play(info,msg);
                return
                }
            else{
                if(!Meme && downloading.indexOf(state.songs[0].info) != -1){
                    msg.reply("下一首歌還在下載中 先跳至這首喔 (*´∀`)~♥");
                    state.songs.unshift(info);
                    var videodata = await ytdl.getInfo(info,{requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } });
                    QueueTemp.unshift(videodata.videoDetails.title);
                    this.play(state.songs[0],msg)                    
                }
                else{
                    state.songs.push(info);
                    msg.reply("幫你加到歌單了喔 (*´∀`)~♥");
                    var videodata = await ytdl.getInfo(info,{requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } });
                    QueueTemp.push(videodata.videoDetails.title);
                    return
                }
                return
            }
        }
            
        //YT搜索
        
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
            
            
    },
    //YT搜索功能

    //播放音樂
    play : async function (info,msg){
        if (state.voicechannel === null){
            await this.join(msg);
        }
        if(!tool.NullChk(waitingID)){
            clearTimeout(waitingID)
        }
        waiting = false;
        if(typeof(info) == "object"){
            if(downloading.indexOf(info.info) != -1){
                if(state.songs.length>1){
                    for(s=0;s<state.songs.length;s++){
                        if(typeof(state.songs[s])!="object"){
                            msg.reply("下一首歌還在下載中 先跳至別首喔 (*´∀`)~♥");
                            removedItem = state.songs.splice(s, 1)
                            state.songs.unshift(removedItem)
                            this.play(state.songs[0],msg)
                        }
                    }
                }
                else{
                    msg.reply("下一首歌還在下載中 請稍後喔 (*´∀`)~♥");
                }
                return
            }
            state.StreamDispatcher = state.connection.play(info.info)
            if (!Meme){
                tool.Userlog("Playing " + QueueTemp[0] + "(Bilibili)")
                client.user.setActivity(QueueTemp[0],{ type: 'LISTENING' })
                nowplayingMSG = await state.textchannel.send("現正播放: " + QueueTemp[0]);
            }
            nowplaying = {url:info.info,Time:info.Time}
            waitingID = setTimeout(() => this.nextsong(msg),parseInt(info.Time)*1000)
        }
            
        else if (ytdl.validateURL(info)){
            state.StreamDispatcher = state.connection.play(ytdl(info,{filter:'audioonly',quality: 'highest',highWaterMark:40000000000 ,requestOptions:{headers:{cookie:COOKIE,'x-youtube-identity-token':"QUFFLUhqa3Q5azhVbkdGSlhoNUFZam1JQUJwRmR5aVdRQXw="} } })
            .on('info', async (info) => {
                if (!Meme){
                    tool.Userlog("Playing " + QueueTemp[0] + "(Youtube)")
                    client.user.setActivity(QueueTemp[0],{ type: 'LISTENING' })
                    nowplayingMSG = await state.textchannel.send("現正播放: " + QueueTemp[0]);
                }
                else{
                    client.user.setActivity("?????",{ type: 'LISTENING' })
                }
                nowplaying = {url:info,Time:info.videoDetails.lengthSeconds}
                waitingID = setTimeout(() => this.nextsong(msg), parseInt(info.videoDetails.lengthSeconds)*1000)
            })
        );
        }

    },

    nextsong(msg){
        if(nowplayingMSG!=null)
            msg.channel.messages.delete(nowplayingMSG)
        if(!Meme){
            state.songs.shift();
            QueueTemp.shift();
        }
        Meme = false;
        if(state.songs.length != 0)
            this.play(state.songs[0],msg)
        else if(!Meme){
            state.textchannel.send("えーと.......沒有下一首了喔(●´ω｀●)ゞ");
            waiting = true;
            this.gohome()
        }
    },
    //顯示歌單
    queue : async function (msg){
        if(state.songs.length === 0){
            msg.reply("現在沒有歌喔  (灬ºωº灬)");
        }
        else{
            var output ="";
            for(countp=0;countp<Math.ceil(state.songs.length/10);countp++){
                if(countp === 0){
                    output =  "\n目前歌單:\n";
                }
            else{
                output =""
            }
            for (k =20*countp;k<state.songs.length;k+=0){
                output = output + (k+1) +". " + QueueTemp[k] +"\n";
                k++
                if(k!=0 && k%20 === 0){
                    break;
                }
            }
            if(output!=""){
                msg.channel.send(output);
            }

        }
        
    }
    Checking = false;
    },

    //閒置離開
    gohome : async function(){
        var waitforsec = 0;
        for(w = 0;w <60;w++){
            if(!waiting){
                break;
            }
            else{
                await setTimeout(() => {
                    if(!waiting){
                        return;
                    }
                    else{
                        state.textchannel.send("我先去休息了喔 _(:3 」∠ )_");
                        this.exit();
                    }
                },30000);
            }
        }
    },

    //跳過歌曲
    skip : function (msg,target){
        if(target == undefined){
            if(!Meme)
                target = 1;
            else
                target = 0;
        }
        else if (target >state.songs.length){
            msg.reply("對不起......我找不到這首歌・゜・(PД`q｡)・゜・");
            return;
        }
        else if (target == 1 && !Meme){
            msg.reply("OwO?");
            return;
        }
        else{
            target --;
        }
        if(!Meme && state.songs.length ===0)
            return;
        msg.reply("了解しました 請稍等  (,,・ω・,,)");
        Meme = false;
        if(state.songs.length>target - 1){
            try{
                state.StreamDispatcher.pause();
            }
            catch{
                
            }
            for(i = 0;i<target;i++){
                if(typeof(state.songs[0]) == "object"){
                    obj = tool.stopPromise(test);
                    obj.resolve("Promise 请求被取消了！");
                    fs.unlink(state.songs[0].info, function () {
                    });
                }
                state.songs.shift();
                QueueTemp.shift();
                if(i == 0)
                    nowplayingMSG.delete()
            }
            if(state.songs.length != 0){
                Meme = false;
                clearTimeout(waitingID)
                this.play(state.songs[0],msg);
            }
            else{
                state.textchannel.send("えーと.......沒有下一首了喔(●´ω｀●)ゞ");
                waiting = true;
                this.gohome();
            }
        }
    },

    //移除歌曲
    remove : function (msg,target){
        if (target === 1 && !Meme){
            this.skip(msg);
            msg.reply("了解しました  (,,・ω・,,)");
        }
        else if(target>state.songs.length || target<0){
            msg.reply("對不起......我找不到這首歌・゜・(PД`q｡)・゜・")
        }
        else if (target === state.songs.length){
            state.songs.pop();
            QueueTemp.pop();
            msg.reply("了解しました 已移除歌曲  (,,・ω・,,)");
        }
        else if(target>0 && target<=state.songs.length){
            var newsonglist = [];
            var newQueueTemp = [];
            for(rem=0;rem<state.songs.length;rem++){
                if(rem === target-1){
                }
                else{
                    if(typeof(state.songs[rem]) == "object"){
                        obj = tool.stopPromise(test);
                        obj.resolve("Promise 请求被取消了！");
                        fs.unlink(state.songs[0].info, function () {
                        });
                    }
                    newsonglist.push(state.songs[rem]);
                    newQueueTemp.push(QueueTemp[rem]);
                }
            }
            state.songs = newsonglist;
            QueueTemp = newQueueTemp;
            msg.reply("了解しました 已移除歌曲  (,,・ω・,,)");
        }
    },

    //暫停播放
    pause : function (msg){
        if(stop ===false){
            stop = true;
            msg.reply("了解しました  (,,・ω・,,)")
            state.StreamDispatcher.pause();
            clearTimeout(waitingID)
        }
    },

    //繼續播放
    resume : function (msg){
        if(stop ===true){
            stop = false;
            msg.reply("了解しました  (,,・ω・,,)")
            state.StreamDispatcher.resume();
            waitingID = setTimeout(() => this.nextsong(msg), parseInt(nowplaying.Time)*1000 - state.StreamDispatcher.streamTime)
        }
    },

    //幫助
    help : function (msg){
        msg.reply(helptext);
    },

    //離開
    exit : function (){
        if(state.voicechannel!= null)
            state.voicechannel.leave();
        clearTimeout(waitingID)
        state.voicechannel = null;
        state.textchannel = null;
        state.songs = [];
        state.connection= null;
        state.StreamDispatcher = null;
        waiting = false;
        nowplaying = {};
        nowplayingMSG = null;
        QueueTemp = []
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
    }
}
//bot = DJ デルミン