module.exports = {
    CheckIfMeme : function(msg){
        ReplyTarget = config.ReplyTarget
        var multisol
        var reply
        var url
        for(i = 0;i < ReplyTarget.length;i++){
            for(k = 0;k<ReplyTarget[i].targetmsg.length;k++){
                if(ReplyTarget[i].targetmsg[k] === msg.content){
                    if(ReplyTarget[i].targetmsg.length>1||ReplyTarget[i].reply.length>1||ReplyTarget[i].url.length>1){
                        if(tool.NullChk(ReplyTarget[i].multisol)){
                            multisol = null
                            msg.reply("诶诶诶诶诶诶诶诶诶诶诶Σ(*ﾟдﾟﾉ)ﾉ (系統發生錯誤,請查閱後台)")
                            console.log("該設定檔缺少multisol" + " "  + ReplyTarget[i].targetmsg )
                            break;
                        }
                        else{
                            multisol = ReplyTarget[i].multisol
                        }         
                    }
                    var num
                    if(multisol === "oneByone"){
                        num = k
                    }
                    else if(multisol === "random"){ 
                        if(ReplyTarget[i].class === "video"){
                            num = tool.getRandomIntInclusive(0,ReplyTarget[i].url.length-1)
                        }
                        else{
                            num = tool.getRandomIntInclusive(0,ReplyTarget[i].reply.length-1)
                        }

                    }
                    if(!tool.NullChk(ReplyTarget[i].url[num])){
                        url = ReplyTarget[i].url[num]
                    }
                    else{
                        url = ReplyTarget[i].url[0]
                    }
                    if(!tool.NullChk(ReplyTarget[i].reply[num])){
                        reply = ReplyTarget[i].reply[num]
                    }
                    else{
                        reply = ReplyTarget[i].reply[0]
                    }
                    if(ReplyTarget[i].class == "video")
                        this.MemeSongMsgChk(msg,reply,url)
                    else
                        this.MemePic(msg,reply)
                }
            }
        }
    },

    //Meme音樂
    MemeSongMsgChk : function(msg,reply,url){
        if(!Meme&&!Nomeme &&　tool.VoiceChk(msg)){
            if(msg.member.voice.channel!=voicestate.voicechannel && voicestate.voicechannel!=null){
                msg.reply("對不起，我在工作中，不過歡迎您過來一起玩 (,,・ω・,,)");
            }
            else{
                tool.Userlog()
                Meme = true;
                this.MemeDJ(msg,url);
                tool.Userlog(msg.author.username + " add a Meme to queue");
                msg.reply(reply);
                waiting = false;
            }
        }
        else if (Meme&&!Nomeme){
            msg.reply("要素過多我承受不了  。･ﾟ･(つд`ﾟ)･ﾟ･");
        }
        
    },

    MemeDJ : async function(msg, info){
        audiodata = {
            type : "Meme",
            title : "???",
            url : info,
            length : null
        };
        voicestate.songsqueue.unshift(audiodata)
        DJ_fct.play(info,msg);
        
    },

    //Meme圖片
    MemePic : async function(msg,reply,pid){
        pic = new discord.MessageAttachment(reply);
        if(!tool.NullChk(pid)){
            await msg.channel.send({
                files: [pic],
                content: "PixivID : "+ pid,
              })
              fs.unlink(reply, function () {
            });
        }
        else
            msg.channel.send(pic)
    }
}