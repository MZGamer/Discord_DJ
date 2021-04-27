const { filterFormats } = require("ytdl-core");

module.exports = {
    const : pixiv = new PixivApi(),
    const : test = "ヴァジラ",
    const : searchQueue = [],
    const : maxsearch = 1000,
    var : picLibrary = null,
    test : async function(params) {
        this.psearch(test);
    },
    Pixiv_Msg_Chk : async function(msg){
        let Execute = msg.content.split(" ");
        for(i=0;i<Execute.length;i++)
            if(Execute[i] == " "){
                Execute.splice(i, 1);
                i--;
            }
        call = Execute[0].split("~")[1];
        if(call == "psearch"){
            var target = "";
            for(t=1;t<Execute.length;t++){
                if(t!= 1)
                    target+=" ";
                target+=Execute[t];
            }
            if(!tool.NullChk(target)){
                this.LibrarySearch(target)
            }
        }
    },
    LibrarySearch : async function(Exexute){
        for(lib=0;lib<picLibrary.pixivtemp.length;lib++){
            if(picLibrary.pixivtemp[lib].target == Exexute){
                update = new Date(picLibrary.pixivtemp[lib].date)
                dt = new Date()
                if(!(update.getFullYear() == dt.getFullYear()) || !(update.getMonth() == dt.getMonth()) ){
                    searchQueue.push({ type : "Update",whatup : lib, target:Exexute});
                    break;
                }
                this.MessageSetting(picLibrary.pixivtemp[lib].ls.length,picLibrary.pixivtemp[lib].ls);
                return;
            }
        }
        if((searchQueue.length!= 0 && searchQueue[searchQueue.length-1].target!= Exexute) || searchQueue.length == 0){
            searchQueue.push({ type : "Search",whatup : null,target:Exexute});
        }
        if(searchQueue.length == 1)
            this.psearch(Exexute);
    },
    loginAcc : async function(){
        await pixiv.refreshAccessToken(config.pixiv.refreshToken);
        if(picLibrary== null){
            fs.readFile("./pixivtemp.json", 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } 
                else {
                obj = JSON.parse(data); //now it an object
                picLibrary = obj
                }
            });
        }
    },
    psearch : async function (Exexute) {
        const piclist = [];
        var stopped = false;
        var searchCount = 0;
        await this.loginAcc();
        search = await pixiv.searchIllust(Exexute);
        while( (piclist.length == 0 || search.next_url || search.illusts.length>0) && searchCount<maxsearch){
            searchCount+= search.illusts.length;
            for(pic=0;pic < search.illusts.length;pic++){
                var now = search.illusts[pic];
                if(now.tags[0].name === 'R-18'|| now.tags[0].name ==='R-18G' || now.page_count!= 1 || now.type != 'illust'){
                    continue;
                }
                else{
                    if(searchQueue[0].type == "Update"){
                        if(search.illusts[pic].id == picLibrary.pixivtemp[lib].ls[0].id){
                            stopped = true;
                            break;
                        }
                    }
                    piclist.push(search.illusts[pic])
                }
            }
            if(search.next_url && !stopped)
                search = await pixiv.requestUrl(search.next_url);
        }
        this.Filter(Exexute,piclist)
        console.log(piclist);
    },
    Filter: function (name,piclist) {
        pTemp = {
            target : name,
            date:new Date(),
            ls:[],
            offset:0,
            killed:[]
        }
        for(pic=0;pic<piclist.length;pic++){
            var picdata = {id:"",reply:""};
            if(piclist[pic].total_bookmarks *5 >= piclist[pic].total_view){
                picdata.id = piclist[pic].id;
                picdata.reply = piclist[pic].image_urls.large
                pTemp.ls.push(picdata)
            }
        }
        if(searchQueue[0].whatup != null){
            whatup = searchQueue[0].whatup;
            pTemp.ls = pTemp.ls.concat(picLibrary.pixivtemp[whatup].ls);
            picLibrary.pixivtemp[whatup].ls = pTemp.ls;
            picLibrary.pixivtemp[whatup].date = new Date();
        }
        else{
            picLibrary.pixivtemp.push(pTemp);
        }
        this.LibraryFileWriting(picLibrary);
        searchQueue.shift();
        this.MessageSetting(pTemp.ls.length,pTemp.ls)
        if(searchQueue.length>0){
            setTimeout(()=>{psearch(searchQueue[0].Target)},10000)
        }
    },
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
        Target = client.channels.cache.find(channel => channel.name === config.FBPicSent);
        pic = new discord.MessageAttachment(url)
        await Target.send({
            content: "PixivID : "+ pid,
            files: [pic]
        })
    },
}
//bot = DJ デルミン