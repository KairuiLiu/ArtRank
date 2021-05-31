var mysql=require("./mysql")
var Spider = require("./spider")
var Author = require("./author")
var sql=mysql.sql;

function Artical(){
    // url of Art Page ==> Object
    // deep-深度
    // fa-引用他的文章(Obj)
    // Title-题名
    // Author-作者
    // Organ-机构
    // Source-刊名
    // year-时间
    // Keyword-关键词
    // Summary-摘要
    // Link-链接: 
    // spider.ArtUrl=url;
    this.refList=new Array();
    this.refNmLk=new Array();
    this.link="";
    this.title="";
    this.author=new Array();
    this.organ=new Array();
    this.Source="";
    this.year="";
    this.keyword=new Array();
    this.summary="";
    this.deep;
    this.fa;
    this.ArtID=null;
    this.nopair=null;
}

Artical.prototype.getArtID= async function(){
    if(!this.link)return false;
    var art=this,res=true;
    var sqlCmd='select distinct ArticalID from `ARTICAL` where link = '+sql.cnnt.escape(this.link);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            if(err || !result.length)res=false;
            else {art.ArtID=result[0].ArticalID;res=art.ArtID=result[0].ArticalID;resolve()} 
            resolve();
        })
    })
    return res;
}

Artical.prototype.getArtbyLink= async function(arturl,resolve,reject){
    var spider=new Spider();
    var getSOK = await spider.getSrc(arturl,resolve,reject)
    if(!getSOK)return getSOK;
    await spider.findMainArt(this)
    await spider.findRef(this)
    return true;
};

// * 增
Artical.prototype.insertArt= async function(allowNull=false){
    if(!(this.title && this.link))return;
    var sqlCmd='insert into `ARTICAL` SET ',res;
    sqlCmd+=sql.sqlGener({'Title':this.title,'Source':this.Source,'Summary':this.summary,'link':this.link},',',allowNull);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=false;
            else res=result;
            resolve();
        });
    })
    return res;
};

Artical.prototype.insertKey=async function(allowNull=false){
    if(!this.keyword.length)return true;
    var art = this;
    if(!this.ArtID)await this.getArtID();
    await this.keyword.forEach(async (ele,idx)=>{
        var sqlCmd='insert into `KEYWORDS` set '+sql.sqlGener({'ArticalID':art.ArtID,'Keyword':ele},',',allowNull);
        await new Promise((resolve,reject)=>{
            sql.cnnt.query(sqlCmd,(err, result)=>{resolve()});
        })
    })
    return true;
};

Artical.prototype.insertRef=async function(allowNull=false){
    if(!this.refNmLk.length)return true;
    var art = this;
    if(!this.ArtID)await this.getArtID();
    await this.refNmLk.forEach(async (ele,idx)=>{
        var id;
        {let rart=new Artical();rart.link=ele.Link;id = await rart.getArtID();}
        id=id?id:null;
        var sqlCmd='insert into `REFERENCE` set '+sql.sqlGener({'ArticalID':art.ArtID,'RefTitle':ele.Title,'RefLink':ele.Link,'RefID':id},',',false);
        await new Promise((resolve,reject)=>{
            sql.cnnt.query(sqlCmd,(err, result)=>{resolve()});
        })
    })
    return true;
};

Artical.prototype.makeNopair=function(){
    var nameList=this.author;
    if(!nameList.length)nameList.push(null);
    var orgList=this.organ;
    if(!orgList.length)orgList.push(null);
    var lenName = nameList.length;
    var lenOrg = orgList.length;
    var len=Math.max(lenName,lenOrg);
    this.nopair=new Array();
    for(var i=0;i<len;i++)
        this.nopair.push({'name':nameList[i%lenName],'organize':orgList[i%lenOrg]});
}

Artical.prototype.insertAth=async function(){
    if(!this.nopair)this.makeNopair();
    this.nopair.forEach(async (ele,idx)=>{
        author = new Author(ele.name,ele.organize);
        await author.insertDB();
    });
    return true;
};

Artical.prototype.insertAthMap=async function(){
    if(!this.nopair || !this.nopair.length)return true;
    if(!this.ArtID)await this.getArtID()
    var art = this;
    await new Promise((resolve,reject)=>{
        if(!this.nopair.length>0)resolve();
        this.nopair.forEach(async (ele,idx)=>{
            var author=new Author(ele.name,ele.organize);
            var nid=await author.queryID();
            var sqlCmd='insert into `AUTHORMAP` set '+sql.sqlGener({'ArticalID':art.ArtID,'AUID':nid},',',false);
            await new Promise((resolve2,reject2)=>{
                sql.cnnt.query(sqlCmd,(err, result)=>{resolve2()});
            })
            if(idx==this.nopair.length-1)resolve();
        })
    })
    return true;
};

Artical.prototype.pushDB=async function(url){
    await this.insertArt();
    if(!this.ArtID)SI = await this.getArtID();
    if(this.ArtID==null) return false;
    var SK = await this.insertKey();
    var SR = await this.insertRef();
    var ST = await this.insertAth();
    var SM = await this.insertAthMap();
    return SK&&SR&&ST&&SM;
}

// * 删除

Artical.prototype.removeDB=async function(){
    if(!this.ArtID)await this.getArtID();
    var sqlCmdK = 'delete from KEYWORDS where ArticalID = '+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmdK,(err, result)=>{resolve();});
    })
    var sqlCmdR = 'delete from REFERENCE where ArticalID = '+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmdR,(err, result)=>{resolve();});
    })
    var sqlCmdAM = 'delete from AUTHORMAP where ArticalID = '+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmdAM,(err, result)=>{resolve();});
    })
    var sqlCmdA = 'delete from ARTICAL where ArticalID = '+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmdA,(err, result)=>{resolve();});
    })
};

// * 查 => List

Artical.prototype.queryDB=async function(uid,qys){
    if(!(uid||Object.getOwnPropertyNames(qys).length))return false;
    var res,sqlCmd="select * from `USERDB`,`ARTICAL`,`KEYWORDS`,`AUTHORMAP`,`AUTHOR`,`REFERENCE` "
    sqlCmd+=" where uid = "+sql.cnnt.escape(uid)
    if(Object.getOwnPropertyNames(qys).length)sqlCmd+=" and (";
    sqlCmd+=sql.sqlGener(qys," or ",false," like ");
    if(Object.getOwnPropertyNames(qys).length)sqlCmd+=" )";
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:result;
            resolve();
        })
    })
    return res;
}

Artical.prototype.getKey=async function(){
    if(!this.ArtID)await this.getArtID()
    var klist=new Array(),res,sqlCmd="select * from `KEYWORDS` where `ArticalID`= "+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:result;
            resolve();
        })
    })
    if(!res)return res;
    res.forEach((d,i)=>{klist.push(d.Keyword)})
    this.keyword=klist;
    return true;
}

Artical.prototype.getRef=async function(){
    if(!this.ArtID)await this.getArtID()
    this.refNmLk=new Array();
    var flist=new Array(),res,sqlCmd="select * from `REFERENCE` where `ArticalID`= "+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:result;
            resolve();
        })
    })
    if(!res)return res;
    res.forEach((d,i)=>{flist.push({'ArticalID':this.ArtID,'Title':d.RefTitle,'Link':d.RefLink,'RefID':d.RefID})})
    this.refNmLk=flist;
    return true;
}

Artical.prototype.getAth=async function(){
    if(!this.ArtID)await this.getArtID()
    var tlist=new Array(),res,sqlCmd="select * from AUTHORMAP m INNER JOIN AUTHOR a on m.AUID=a.AUID where `ArticalID`= "+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:result;
            resolve();
        })
    })
    if(!res)return res;
    res.forEach((d,i)=>{tlist.push({'name':d.Author,'organize':d.Organize})})
    this.nopair=tlist;
    return true;
}

Artical.prototype.getBase=async function(){
    if(!this.ArtID)await this.getArtID()
    var robj,res,sqlCmd="select * from ARTICAL where `ArticalID`= "+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=(err||result.length<=0)?false:result[0];
            resolve();
        })
    })
    if(!res)return res;
    this.title=res.Title;
    this.Source=res.Source;
    this.summary=res.Summary;
    this.link=res.link;
    return true; 
}

Artical.prototype.getArtFull=async function(){
    var GA = await this.getAth();
    var GR = await this.getRef();
    var GK = await this.getKey();
    var GS = await this.getBase();
    return GA&&GR&&GK&&GS;
}

Artical.prototype.getUserArts=async function(ID,show=false){
    if(!ID)return false;
    var art=new Artical();
    var artsObj=new Array();
    var artLst = await art.getArtList(ID);
    if(artLst===false)return false;
    await new Promise((resolve,reject)=>{
        if(artLst.length==0)resolve();
        artLst.forEach(async(d,i)=>{
            if(artLst.length==0)resolve();
            var tmp = new Artical();
            tmp.ArtID=d;
            if(!await tmp.getArtFull())return true;
            if(show)tmp.toShow();
            artsObj.push(tmp);
            if(i==artLst.length-1)resolve()
        });
    })
    return artsObj;
}

Artical.prototype.getArtList=async function(UID=null){
    if(!UID)return false;
    var res,lst=new Array(),sqlCmd="select * from USERDB where UID = "+sql.cnnt.escape(UID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:result;
            resolve();
        })
    })
    if(res===false)return false;
    res.forEach((d,i)=>{lst.push(d.ArticalID);})
    return lst;
}

// * 修改

Artical.prototype.updateDB = async function(nobj){
    var artN={"Title":nobj.title,"Source":nobj.Source,"Summary":nobj.summary,"link":nobj.link};
    await this.updateArt(artN);
    return;
}


Artical.prototype.updateArt = async function(nart){
    if(!Object.getOwnPropertyNames(nart).length)return false;
    var res,sqlCmd = 'update `ARTICAL` set '+sql.sqlGener(nart,',',false)+' where ArticalID = '+sql.cnnt.escape(this.ArtID);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:true;
            resolve();
        })
    })
    return res;
}

Artical.prototype.updateKey = async function(okey,nkey){
    if(!(this.ArtID||Object.getOwnPropertyNames(testObj).length))return false;
    var res,sqlCmd = 'update `KEYWORDS` set '+sql.sqlGener({'Keyword':nkey},',',false)+' where ArticalID = '+sql.cnnt.escape(this.ArtID)+' and Keyword = '+sql.cnnt.escape(okey);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:true;
            resolve();
        })
    })
    return res;
}

Artical.prototype.updateRef = async function(olink,obj){
    if(!(olink&&Object.getOwnPropertyNames(obj).length))return false;
    var res,sqlCmd = 'update `REFERENCE` set '+sql.sqlGener(obj,',',false)+' where ArticalID = '+sql.cnnt.escape(this.ArtID)+' and Reflink = "'+olink+'"';
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:true;
            resolve();
        })
    })
    return res;
}

Artical.prototype.updateAthMap = async function(oathID=null,athID=null){
    if(!(athID||oathID))return false;
    // quert
    var res,sqlCmd = 'update `AUTHORMAP` set `AUID = `'+sql.cnnt.escape(athID)+' where '+sql.sqlGener({'ArticalID':this.ArtID,'AUID':oathID},',',false)
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            res=err?false:true;
            resolve();
        })
    })
    return res;
}

Artical.prototype.toShow=function(){
    var tmpauthor="";
    var tmpkey="";
    var tmpref="";
    if(this.nopair!=null)this.nopair.forEach((d,i)=>{tmpauthor+=d.name+"/"+d.organize+"\n"})
    if(this.keyword!=null)this.keyword.forEach((d,i)=>{tmpkey+=d+"\n";})
    if(this.refNmLk!=null)this.refNmLk.forEach((d,i)=>{tmpref+=d.Title+"/\n"})
    if(tmpauthor=="")tmpauthor="暂无";this.showAth=tmpauthor;
    if(tmpkey=="")tmpkey="暂无";this.showKey=tmpkey;
    if(tmpref=="")tmpref="暂无";this.showRef=tmpref;
    if(this.Source===null||this.Source=="")this.Source="暂无";
    if(this.summary===null||this.summary=="")this.summary="暂无";
    if(this.title=="")this.title="暂无";
    return;
}

Artical.prototype.toDetile=function(){
    if(!this.nopair)this.makeNopair();
    if(!this.nopair.length)this.nopair.push({"name":"暂无","organize":"暂无"});
    if(!this.keyword.length)this.keyword.push("暂无");
    if(!this.refNmLk.length)this.refNmLk.push({"Title":"暂无","Link":"暂无"});
    if(this.Source===null||this.Source=="")this.Source="暂无";
    if(this.title=="")this.title="暂无";
    if(this.summary===null||this.summary==="")this.summary="暂无"
    return;
}

module.exports=Artical;
