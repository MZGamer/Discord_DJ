
module.exports = {
    bool : cooldown = false,
    var : FBTarget = config.FBPicUpdate,
    var : Target = config.FBPicSent,
    var : retrycount = 0,
    var : NextTarget = 0,
    var : NowTarget = 0,
    FBPicUpdate: async function(){
        if(!cooldown){
            Target = client.channels.cache.find(channel => channel.name === config.FBPicSent)
            var updated = false;
            const result = [];
            try{
                await this.FBPictureGET(result);
                this.FBPicturesend(result,updated);
            }
            catch{
                if(retrycount<5 && !cooldown){
                    tool.Userlog("Connection error while getting page data, Retrying......")
                    this.FBPicUpdate();
                    retrycount ++;
                }
                else if (!cooldown){
                    retrycount = 0;
                    tool.Userlog("Occurr Error while get page too many time, Retrying After cooldown")
                    cooldown = true;
                    setTimeout(()=>{
                        cooldown = false;
                        tool.Userlog("FB request was cooled down")
                    },600000)
                }
            }
        }
    },
    FBPictureGET : async function(result){
        await this.FBSentRequest(FBTarget[NextTarget].url,result)
    },
    FBPicturesend :async function(result,updated){
        const Temp = []
        const pic = []
        for(f=0;f<result.length;f++){
            if(result[f] == undefined)
                continue
            var chk = result[f].split("/")
            chk = chk[5].split("?")
            chk = chk[0]
            Temp.push(chk)
            if(FBTarget[NowTarget].lastupdate.indexOf(chk) == -1){
                pic.push(new discord.MessageAttachment(result[f]));
                updated= true;
            }
        }
        if(updated){
            try{
                await Target.send({
                    content: "Posted by : "+ FBTarget[NowTarget].Name+"\n",
                    files: pic
                })
                tool.Userlog("Post a picture to discord (Updated from " + FBTarget[NowTarget].Name + " )")
                FBTarget[NowTarget].lastupdate = Temp;
            }
            catch{
                if(!cooldown)
                    tool.Userlog("An error occurred while sending a piceture to discord\n in case " + NowTarget )
            }
            config.FBPicUpdate = FBTarget;
            fs.writeFile("./config.json", JSON.stringify(config,null,"\t"), 'utf8', function(err){
                if(err)
                    console.log('err')
            });
        }
    },
    FBSentRequest : function(url,result){
        return new Promise(function (resolve, reject) {
            request({
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36'             
                },
                url: url,
                method: "GET",
            },  function (error, response, body) {
                    if (error || !body) {
                        tool.Userlog("Occurr an error while getting Page data:\n" + error)
                        reject();
                    }
                    else{
                        const $ = cheerio.load(body); // 載入 body
                        var data = $('._2a2q').children()
                        for(i =0;i<3;i++){
                            if(data.attr("data-ploi") == undefined){
                                NextTarget = 0;
                                cooldown = true;
                                tool.Userlog("Occurr an error while getting Page data:\n" +"IP has banned by FB, resend request after cooldown")
                                setTimeout(()=>{
                                    cooldown = false;
                                    tool.Userlog("FB request was cooled down")
                                },3600000)
                                reject()
                                break
                            }
                            result.push(data.attr("data-ploi"))
                            if(i != 2)
                                data = data.next()
                        }
                        /*fs.appendFile("test.html", $.html(), function readFileCallback(err, data){
                        });*/
                        NowTarget = NextTarget
                        if(NextTarget == FBTarget.length-1 )
                            NextTarget = 0;
                        else{
                            NextTarget+=1;
                            setTimeout(() =>fb_fct.FBPicUpdate(),60000);
                        }
                        resolve();
                    }
                }
            )
        })
    },
    Cooling:function(){
        console.log("test")
        cooldown = false;
    }

    /*ChannelSet:function(msg){
        config.FBPicSent = msg.channel;
        console.log(config)
        fs.writeFile("./config.json", JSON.stringify(config,null,"\t"), 'utf8', function(err){
            if(err)
                console.log('err')
        });
    }*/
}

//bot = DJ デルミン