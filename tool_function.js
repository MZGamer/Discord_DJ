module.exports = {
    var : sleepwait = 0,
    var : logname = "",
    var : retrying = false,
    NullChk : function (chk){
        if(chk === null || chk === NaN ||chk === undefined)
            return true
        else
            return false
    },
    VoiceChk : function (chk){
        if(chk.member.voice.channel === null)
            return false
        else
            return true
    },
    getRandomIntInclusive :function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    emptyDir : function(fileUrl){

        var files = fs.readdirSync(fileUrl);//讀取該文件夾
        
        files.forEach(function(file){
        
        var stats = fs.statSync(fileUrl+'/'+file);
        
        if(stats.isDirectory()){
        
        emptyDir(fileUrl+'/'+file);
        
        }else{
        
        fs.unlinkSync(fileUrl+'/'+file);
        
        }
        
        });
        
    },
    stopPromise :function (stopP) {
        let proObj = {};
        let promise = new Promise((resolve, reject) => {
            proObj.resolve = resolve;
            proObj.reject = reject;
        })
        proObj.promise = Promise.race([stopP, promise])
        return proObj
    },
    sleeping : function(){
        logname = "./log/" + new Date().getFullYear()+'_' + (new Date().getMonth()+1) + '_' +new Date().getDate()+".txt";
        sleepwait = setInterval(() => {
            nowtime = new Date()
            nowhour = nowtime.getHours()
            if(nowhour<=8 || nowhour >= 24){
                if(pixiv_fct.const.length == 0 && state.songs.length == 0 && botsleeping == false){
                    client.user.setStatus("invisible")
                    botsleeping = true
                    tool.Userlog("Bot is sleeping")
                    logname = "./log/" + new Date().getFullYear()+'_' + (new Date().getMonth()+1) + '_' +new Date().getDate()+".txt"
                }
            }
            else{
                if(botsleeping == true){
                    logname = "./log/" + new Date().getFullYear()+'_' + (new Date().getMonth()+1) + '_' +new Date().getDate()+".txt"
                    client.user.setStatus("online")
                    tool.Userlog("Bot is waking up")
                    botsleeping = false
                }
            }
        },60000)
    },
    GetLogName:function(){
        return logname
    },
    Userlog : function(msg){
        console.log("["+ new Date() + "] " +msg);
        //(client.channels.cache.find(channel => channel.name === "機器人log")).send("["+ new Date() + "] "+msg)
        //fs.appendFile(tool.GetLogName(), "["+ new Date() + "] " + msg +'\n', function readFileCallback(err, data){
        //});
    },
    HtmlDecode : function() {
        return this.replace(/\&amp\;/g, '\&').replace(/\&gt\;/g, '\>').replace(
              /\&lt\;/g, '\<').replace(/\&quot\;/g, '\'').replace(/\&\#39\;/g,
              '\'');/*from w  w  w.  j  ava2 s.c o m*/
    },
    Retry : async function(rt,count){
        try{
            retrying = true;
            try{
                await rt();
                retrying = false;
            }
            catch{
                count++;
                throw "Tryagain"
            }
            
        }
        catch{
            if(count == 5){
                this.Userlog("Occurred an fatal Error(Code 1)");
                retrying = false;
                return;
            }
            this.Retry(rt,count++);
        }

    },
    IsRetry : function(){
        return retrying;
    }

}

