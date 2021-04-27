module.exports = {
    //p網登入資訊
    var : acc = null,
    const : pixiv = new PixivAppApi(process.env.NAME = config.pixiv.account, process.env.PASSWORD = config.pixiv.password, {
        camelcaseKeys: true,
    }),
    //機器人資料庫
    var : picLibrary = null,
    var : pTemp = null,
    var : Guessing = false,
    var:force = false,
    var :needup = false,
    var :whatup = 0,
    var :stoppoint = 0,
    //訊息發送
    var :url = null,
    var :pid = null,
    //圖片搜尋
    var:Tag = null,
    var :done = false,
    var :ls = null,
    var :max = false,
    var:NetErr = false,
    //搜尋中
    const : searching = [],
    //初始化
    pixiv_login : async function(){
        acc = await pixiv.login()
        fs.readFile("./pixivtemp.json", 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } 
            else {
            obj = JSON.parse(data); //now it an object
            picLibrary = obj
            }
        });
        tool.Userlog('Pixiv module is ready')
    },

    //訊息確認
    Pixiv_Msg_Chk : function(msg){
        let splitMessage = msg.content.split(" ");
        if(splitMessage[0] === "~psearch"){
            if(!tool.NullChk(splitMessage[1])&& splitMessage[1].length!=0){
                Tag = ""
                force = false
                for(i =1 ;i<splitMessage.length;i++){
                    if(i == splitMessage.length -1 && splitMessage[i] === "force"){
                        force = true
                    }
                    else{
                        Tag += splitMessage[i]
                        if(i!=1){
                            Tag += " "
                        }
                    }
                }
                this.Psearch(msg,Tag)
            }
        }
        else if(splitMessage[0] === "~premove"){
            if(!tool.NullChk(splitMessage[1]) && !tool.NullChk(splitMessage[2]))
                this.LibraryKill(msg,splitMessage[1],splitMessage[2])
        }
        else if(splitMessage[0] === "~padd"){
            if(!tool.NullChk(splitMessage[1]) && !tool.NullChk(splitMessage[2]))
                this.LibraryAdd(msg,splitMessage[1],splitMessage[2])
        }
    },

    //轉接站  搜圖庫 => 猜圖 => 找圖
    Psearch : async function(msg,Tag){
        max = false
        Guessing = false
        needup = false
        whatup = 0
        NetErr = false
        if(searching.indexOf(Tag) != -1){
            msg.reply("正在搜尋中喔 (,,・ω・,,)")
            return
        }
        else
            searching.push(Tag)
        try{
            await this.LibrarySearch(msg,Tag)
        }
        catch{
            try{
                if(force || needup)
                    throw "owo"
                await this.TagGuess(msg)
            }
            catch{
                try{
                    await this.SearchPicture(msg)
                    await this.PictureFilter()
                    await this.LibraryUpdate(msg)
                }
                catch{
                    console.log('err')
                }
            }    
        }
        searching.splice(searching.indexOf(Tag), 1)
    },

    //訊息發送
    MessageSetting:async function(LibSize,Lib,msg){
        num = tool.getRandomIntInclusive(0, LibSize)
        try{
            url = await pixivImg(Lib[num].imageUrls.large)
        }
        catch{
            try{
                url = await pixivImg(Lib[num].reply)
            }
            catch{
                throw "qwq"
            }
        }
        pid = Lib[num].id
        Meme_fct.MemePic(msg,url,pid)
    },

    //圖庫搜尋
    LibrarySearch:async function(msg,Tag){
        tool.Userlog("搜尋資料庫: " + Tag)
        var Target
        await pixiv.login()
        for(i = 0;i < picLibrary.pixivtemp.length;i++){
            update = new Date(picLibrary.pixivtemp[i].date)
            dt = new Date()
            if(picLibrary.pixivtemp[i].target == Tag && !needup){
                if(!(update.getFullYear() == dt.getFullYear()) || !(update.getMonth() == dt.getMonth()) ){
                    needup = true
                    whatup = i
                    throw "owo";
                }
                try{
                    Target = picLibrary.pixivtemp[i].ls
                    break
                }
                catch{
                    msg.reply("诶诶诶诶诶诶诶诶诶诶诶Σ(*ﾟдﾟﾉ)ﾉ (系統發生錯誤,請查閱後台)")
                    console.log('Json檔解析錯誤 ' + Tag)
                    return
                }
            }
        }
        if(Guessing == true){
            msg.reply("我猜你是要 " + Tag + " (,,・ω・,,)")
        }
        await this.MessageSetting(Target.length -1,Target,msg)
    },

    //猜圖
    TagGuess:async function(msg){
        tool.Userlog(" " + msg.author.username + " : ----------找不到資料庫: " + Tag + " 開始猜圖----------")
        const TagTry = []
        Guessing = true
        count = [];

        ls = await pixiv.searchIllust(Tag)
        for(i=0;i<5;i++){
            if(!pixiv.hasNext())
                break;
            ls+= pixiv.next()
        }
        for(u=0;u<ls.illusts.length;u++){
            if(ls.illusts[u].tags[0].name === 'R-18'|| ls.illusts[u].tags[0].name ==='R-18G'){
                ls.illusts.splice(u, 1)
                u = u-1
                continue
            }
            for(t=0;t<ls.illusts[u].tags.length;t++){
                if(ls.illusts[u].tags[t].translatedName != null){
                    if(TagTry.indexOf(ls.illusts[u].tags[t].translatedName) == -1){
                        TagTry.push(ls.illusts[u].tags[t].translatedName)
                        count.push({Name : ls.illusts[u].tags[t].translatedName,ct:1})
                    }
                    else
                        count[TagTry.indexOf(ls.illusts[u].tags[t].translatedName)]++;
                }
                if(TagTry.indexOf(ls.illusts[u].tags[t].name) == -1){
                    TagTry.push(ls.illusts[u].tags[t].name)
                    count.push({Name : ls.illusts[u].tags[t].name,ct:0})
                }
                else
                    count[TagTry.indexOf(ls.illusts[u].tags[t].name)]++;
            }
        }
        for(s=0;s<TagTry.length;s++){
            if(count[s] < 10)
                continue
            for(p = 0;p < picLibrary.pixivtemp.length;p++){
                if(picLibrary.pixivtemp[p].target == TagTry[s]){
                    try{
                        await this.LibrarySearch(msg,TagTry[s])
                        return
                    }
                    catch{
                        throw "owo"
                    }
                }
            }
        }
        Guessing = false
        throw "owo"
    },
    
    //找圖功能三步驟 找圖 =>篩圖 =>更新資料庫
    SearchPicture:async function(msg){
        msg.reply("了解しました  搜索中(≧∀≦)ゞ")
        tool.Userlog("----------開始建立資料庫: " + Tag + "----------")
        var total = 0;
        try{
            ls = await pixiv.searchIllust(Tag)
            total+=ls.illusts.length;
            for(u=0;u<ls.illusts.length;u++){
                if(ls.illusts[u].tags[0].name === 'R-18'|| ls.illusts[u].tags[0].name ==='R-18G'){
                    ls.illusts.splice(u, 1)
                    u = u-1
                    continue
                }
                if(needup && ls.illusts[u].id == picLibrary.pixivtemp[whatup].ls[0].id){
                    done = true
                    stoppoint = u
                    break
                }
            }

        }
        catch{
            msg.reply("诶诶诶诶诶诶诶诶诶诶诶Σ(*ﾟдﾟﾉ)ﾉ (系統發生錯誤,請查閱後台)")
            NetErr = true
            console.log('網路錯誤')
            return
        }
        var count = 1;
        while (pixiv.hasNext()&&!done) {
            try{
                cs = await pixiv.next()
                total+=ls.illusts.length
                for(u=0;u<cs.illusts.length;u++){
                    if(cs.illusts[u].tags[0].name === 'R-18'|| cs.illusts[u].tags[0].name ==='R-18G'){
                        cs.illusts.splice(u, 1)
                        u=u-1
                        continue
                    }
                    if(needup && cs.illusts[u].id == picLibrary.pixivtemp[whatup].ls[0].id){
                        done = true
                        stoppoint = ls.illusts.length+cs.illusts.length-1
                        break
                    }
                }
                ls.illusts = ls.illusts.concat(cs.illusts)
                if(total>=100*count){
                    tool.Userlog("已搜尋 "+ total + " 張圖")
                    count ++;
                }
            }
            
            catch{
                msg.reply("诶诶诶诶诶诶诶诶诶诶诶Σ(*ﾟдﾟﾉ)ﾉ (系統發生錯誤,請查閱後台)")
                console.log('網路錯誤')
                max = true
                break
            }
            if(total>=4500){
                max = true
                break
            }
        }
        tool.Userlog("有 "+ ls.illusts.length+" 張圖進入篩選")
    },
    //篩圖
    PictureFilter:async function(){
        pTemp = {target : Tag.split(" ")[0],
            date:new Date(),
            ls:[],
            offset:0,
            killed:[]
        }
        var offset = 150

        for(i = 0;i <ls.illusts.length;i++){
            var pass = false
            var target = ls.illusts[i]
            if(needup){
                offset = picLibrary.pixivtemp[whatup].offset
                pTemp.offset = offset
                if(i==stoppoint)
                    return
            }
            else if(max){
                offset = 1500
            }
            else if(ls.illusts.length/10 > offset)
                offset = ls.illusts.length/5
            pTemp.offset = offset
            if( (target.totalBookmarks>=offset || target.totalView<=target.totalBookmarks*8 )&& target.metaPages.length==0 && target.type != 'manga' ){
                if(needup){
                    for(d=0;d<picLibrary.pixivtemp[whatup].killed.length;d++){
                        if(target.id == picLibrary.pixivtemp[whatup].killed[d]){
                            pass = true
                        }
                    }
                }
                if(!pass&&target.tags[0].name != 'R-18'|| target.tags[0].name !='R-18G')
                    pTemp.ls.push({id:target.id,reply:target.imageUrls.large})
            }
        }
    },
    //更新資料庫
    LibraryUpdate:async function(msg){
        var addlib = true
        if(NetErr){
            return
        }
        try{
            await this.MessageSetting(pTemp.ls.length -1,pTemp.ls,msg)
            tool.Userlog("----------搜尋完畢 資料庫新增: " + pTemp.ls.length +" 張圖" + "----------")
            msg.reply("搜尋完畢 資料庫新增: " + pTemp.ls.length +" 張圖(≧∀≦)ゞ")
        }
        catch{
            if(!needup){
                msg.reply("沒有圖片符合篩選標準Σ(*ﾟдﾟﾉ)ﾉ")
                tool.Userlog('----------沒有圖片符合篩選標準 '+pTemp.target+" 標準 : "+pTemp.offset +"----------")
                addlib = false
            }
            else{
                var Target = picLibrary.pixivtemp[whatup].ls
                msg.reply("資料庫更新完畢 資料庫新增: " + pTemp.ls.length +" 張圖(≧∀≦)ゞ")
                tool.Userlog("----------資料庫更新完畢 資料庫新增: " + pTemp.ls.length +" 張圖" + "----------")
                this.MessageSetting(Target.length -1,Target,msg)
            }
        }
        if(needup){
            pTemp.ls = pTemp.ls.concat(picLibrary.pixivtemp[whatup].ls)
            picLibrary.pixivtemp[whatup].ls = pTemp.ls
            picLibrary.pixivtemp[whatup].date = new Date()
        }
        else if (addlib){
            picLibrary.pixivtemp.push(pTemp)
        }
        await this.LibraryFileWriting(picLibrary)
    },

    //資料庫寫入
    LibraryFileWriting(write){
        fs.readFile("./pixivtemp.json", 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            json = JSON.stringify(write,null,"\t"); //convert it back to json
            fs.writeFile("./pixivtemp.json", json, 'utf8', function(err){
                if(err)
                    console.log('err')
            }); // write it back */
        }});
    },

    //移除特定圖片
    LibraryKill:async function(msg,target,needkill){
        var haskill = false
        msg.reply("了解しました  (≧∀≦)ゞ")
        for(i = 0;i<picLibrary.pixivtemp.length;i++){
            if(picLibrary.pixivtemp[i].target == target){
                for(k=0;k<picLibrary.pixivtemp[i].ls.length;k++){
                    if(picLibrary.pixivtemp[i].ls[k].id == needkill){
                        picLibrary.pixivtemp[i].ls.splice(k, 1)
                        picLibrary.pixivtemp[i].killed.push(needkill)
                        haskill = true
                    }
                }
                if(!haskill){
                    msg.reply("該id不在資料庫內喔 (,,・ω・,,)")
                    break
                }
            }
        }
        if(!haskill){
            try{
                Tag = target
                this.TagGuess(msg)
                return
            }
            catch{
                msg.reply("資料庫內沒有這項資料喔 (,,・ω・,,)")
                return
            }
        }
        msg.reply("刪除完畢 (,,・ω・,,)")
        await this.LibraryFileWriting(picLibrary)
    },

    //加入特定圖片
    LibraryAdd:async function(msg,target,needadd){
        var finded = false
        var hadhave = false
        var whatadd = 0
        var count = 0 
        msg.reply("了解しました  (≧∀≦)ゞ")
        for(i = 0;i<picLibrary.pixivtemp.length;i++){
            if(picLibrary.pixivtemp[i].target == target){
                whatadd = i
                finded = true
                for(k=0;k<picLibrary.pixivtemp[i].ls.length;k++){
                    if(needadd<picLibrary.pixivtemp[i].ls[k].id){
                        count ++
                    }
                    if(needadd == picLibrary.pixivtemp[i].ls[k].id){
                        hadhave = true
                        break
                    }
                }
                if(hadhave){
                    try{
                        Tag = target
                        this.TagGuess(msg)
                    }
                    catch{
                        msg.reply("該圖已在資料庫內喔 (,,・ω・,,)")
                        return
                    }
                }
            }
        }
        if(!finded){
            try{
                Tag = target
                this.TagGuess(msg)
                return
            }
            catch{
                msg.reply("資料庫內沒有這個關鍵字的資料喔 (,,・ω・,,)")
                return
            }
        }
        else if(!hadhave){
            var add
            try{
                add = await pixiv.illustDetail(needadd)
                add = add.illust
            }
            catch{
                msg.reply("搜尋不到這張圖喔 (,,・ω・,,)")
            }
            if(count>0){
                picLibrary.pixivtemp[whatadd].ls.push({id:add.id,reply:add.imageUrls.large})
            }
            else{
                picLibrary.pixivtemp[whatadd].ls.unshift({id:add.id,reply:add.imageUrls.large})
            }
        }
        msg.reply("新增完畢 (,,・ω・,,)")
        url = await pixivImg(add.imageUrls.large)
        pid = add.id
        Meme_fct.MemePic(msg,url,pid)
        await this.LibraryFileWriting(picLibrary)
    },

    //廢棄
    MyFavoriteChk : async function(msg){
        ls = await pixiv.userBookmarksIllust(acc.user.id,{tag:Tag})
        if(ls.illusts.length!=0){
            while (pixiv.hasNext()) {
                cs = await pixiv.next()
                ls.illusts = ls.illusts.concat(cs.illusts)
            }
            this.MessageSetting(ls.illusts.length -1,ls.illusts,msg)
        }
        else{
            throw "myException"
        }
    }

}