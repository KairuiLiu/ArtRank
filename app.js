var fs=require("fs");
const express = require('express');
const Author = require("./js/author");
const Userlg = require("./js/userlg");
const Artical = require("./js/artical");
const mysql = require("./js/mysql")
var bodyParser = require('body-parser');
const querystring = require("querystring");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const Account = require('./js/account');
const User = require("./js/account");
const Prcnki = require("./js/prcnki");
const Spider = require("./js/spider");

const app = express();
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
var sql=mysql.sql;

const SECRET = 'fsadflkasdjvancrac';

app.engine("html",require("express-art-template"))

const authVfy = async (req, res, next) => {
    var raw = String(req.headers.authorization).split(' ').pop();
    if(raw===undefined||raw===null||raw === ""||raw==="undefined")// 奇怪的API
        if(req.query.uid!=undefined&&req.query.uid!=null&&req.query.uid!=""){raw=req.query.uid;}
        else{req.body.userID="false";req.query.userID=false;next();}
    var user=new User();
    try{
        id=await jwt.verify(raw, SECRET);
    }catch(e){
        res.render("./500.html");
        return;
    }
    if(!("TKID" in id)){req.body.userID=false;req.query.userID=false;next();}
    var stat = await user.idExt(id.TKID)
    req.body.userID=stat?id.TKID:false;
    req.query.userID=req.body.userID;
    next();
}

app.get("/",function(req,res){
    fs.readFile("./views/index.html",function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        res.render('./index.html');
    })
})

app.get("/index.html",function(req,res){
    fs.readFile("./views/index.html",function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        res.render('./index.html');
    })
})

app.get("/db-view.html",authVfy,async function(req,res){
    fs.readFile("./views/db-view.html",async function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        var art = new Artical();
        var ans = await art.getUserArts(req.query.userID,true);   // TOCKEN
        if(!ans){
            res.render("./500.html");
            return;
        }
        res.render('./db-view.html',{artList:ans});
    })
})

app.get("/db-view-detile.html",async function(req,res){
    fs.readFile("./views/db-view-detile.html",async function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        if(!("id" in req.query)){
            res.render("./500.html");
            return;
        }
        var art=new Artical();art.ArtID=req.query.id;
        await art.getArtFull();
        art.toDetile();
        res.render('./db-view-detile.html',{art:art,userID:req.query.userID});
    })
})

app.get("/db-mgr.html",authVfy,async function(req,res){
    fs.readFile("./views/db-mgr.html",async function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        var art = new Artical()
        var ans = await art.getUserArts(req.query.userID,true);
        if(!ans){
            res.render("./500.html");
            return;
        }
        res.render('./db-mgr.html',{artList:ans});
    })
})

app.post("/delete-row",authVfy, async function(req,res){
    res.setHeader('Access-Control-Allow-Origin','*')
    if(req.body.userID===undefined||req.body.userID===null||req.body.userID===false){res.send(false);return false;} 
    var uslg = new Userlg(req.body.userID,req.body.artID);
    var state = await uslg.deleteDB()
    res.send(state);
})

app.get("/db-mgr-insert.html",async function(req,res){
    fs.readFile("./views/db-mgr-insert.html",async function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        res.render('./db-mgr-insert.html');
    })
})

app.post("/db-mgr-insert-spider",function(req,res){
    fs.readFile("./views/db-mgr-insert-spider.html",async function(error,data){
        res.setHeader('Access-Control-Allow-Origin','*')
        if(error){res.send(false)}
        else{
            var art = new Artical();
            art.link=req.body.link;
            var getSOK = await art.getArtbyLink(req.body.link)
            if(!getSOK)res.send(false);
            else{
                await art.toDetile()
                res.render('./db-mgr-insert-spider.html',{art:art});
            }
        }
    })
})

app.post("/db-mgr-insert-DB",authVfy,async function(req,res){
    if(req.body.userID===undefined||req.body.userID===null||req.body.userID===false){res.send(false);return false;} 
    var art = new Artical();
    var reqart = JSON.parse(req.body.art);
    art.title=reqart.title;
    art.nopair=JSON.parse(JSON.stringify(reqart.nopair));
    art.keyword=JSON.parse(JSON.stringify(reqart.keyword));
    art.summary=reqart.summary;
    art.Source=reqart.source;
    art.link=reqart.link;
    art.refNmLk=JSON.parse(JSON.stringify(reqart.refNmLk));
    var stat = await art.pushDB();
    if(stat){
        var userlg=new Userlg(req.body.userID,art.ArtID);
        await userlg.insertDB()
    }
    res.send(stat);
});

app.get("/db-mgr-edit.html",async function(req,res){
    fs.readFile("./views/db-mgr-edit.html",async function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        if(!("id" in req.query)){
            res.render("./500.html");
            return;
        }
        var art=new Artical();art.ArtID=req.query.id;
        await art.getArtFull();
        art.toDetile();
        res.render('./db-mgr-edit.html',{art:art});
    })
})

app.post("/db-mgr-update-DB",async function(req,res){
    var art = new Artical();
    art.nopair=new Array();
    art.ArtID=req.body.ArtID;
    if(art.ArtID==""||art.ArtID==null||art.ArtID==undefined)return false;
    var chg = JSON.parse(req.body.chg);
    if("chnopair" in chg && chg.chnopair.length>0){
        await new Promise((resolve,reject)=>{
            chg.chnopair.forEach(async (d,i)=>{
                let tmp = new Author(d.oname,d.oorganize);
                if(d.oname==undefined||d.oorganize==undefined||d.oname==null||d.oorganize==null||d.oname==""||d.oorganize==""){
                    let tmp = new Author(d.nname,d.norganize);            
                    await tmp.insertDB();
                    art.nopair.push({"name":d.nname,"organize":d.norganize})
                }else{
                    await tmp.updateDB(d.nname,d.norganize,false);
                }
                if(i==chg.chnopair.length-1)resolve()
            })
        })
        if(art.nopair.length!=0)art.insertAthMap();
    }
    if("chkeyword" in chg && chg.chkeyword.length>0){
        await new Promise((resolve,reject)=>{
            chg.chkeyword.forEach(async (d,i)=>{
                if(d.okey==undefined||d.okey==null||d.okey=="")art.keyword.push(d.nkey);
                else await art.updateKey(d.okey,d.nkey);
                if(i==chg.chkeyword.length-1)resolve();
            });
        })
        if(art.keyword.length!=0)await art.insertKey();
    }
    if("chrefNmLk" in chg && chg.chrefNmLk.length>0){
        chg.chrefNmLk.forEach(async (d,i)=>{
            if(d.oTitle==undefined||d.oLink==undefined||d.oTitle==null||d.oLink==null||d.oTitle==""||d.oLink==""){
                art.refNmLk.push({"Title":d.nTitle,"Link":d.nLink});
            }else await art.updateRef(d.oLink,{"RefTitle":d.nTitle,"RefLink":d.nLink});
        });
        await art.insertRef()
    }
    var obj={
        "title":(chg.title==undefined||chg.title==null||chg.title=="")?null:chg.title,
        "summary":(chg.summary==undefined||chg.summary==null||chg.summary=="")?null:chg.summary,
        "Source":(chg.source==undefined||chg.source==null||chg.source=="")?null:chg.source,
        "link":(chg.link==undefined||chg.link==null||chg.link=="")?null:chg.link
    };
    if(("title" in chg)||("summary" in chg)||("source" in chg)||("link" in chg))await art.updateArt(obj);
    res.send(true);
});

app.get("/login.html",function(req,res){
    fs.readFile("./views/login.html",function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        res.render('./login.html');
    })
})

app.post("/login-tk",async function(req,res){
    var username = req.body.username;
    var passwd = req.body.passwd;
    var account = new Account(null,username,passwd);
    var userdata = await account.queryDB(username)
    if(userdata === null || userdata === false || userdata.length==0){res.send(false);return false;}
    if(bcrypt.compareSync(passwd,userdata[0].passwdRSA)){
        const token = jwt.sign({
            TKID: String(userdata[0].UID)
        }, SECRET);
        res.send(token);
        return true;
    }
    res.send(false);
    return false;
});

app.all("/is-login",authVfy,async(req,res)=>{
    if(req.body.userID!=undefined&&req.body.userID!=null&&req.body.userID!=""&&req.body.userID!="undefined"){
        var user = new User();
        var uname = await user.getInfo(req.body.userID);
        res.send(uname[0].Username);
    }
    else 
        res.send(false);
    return;
})

app.get("/search-res",async function(req,res){
    var ndlst = JSON.parse(req.query.ndlst);
    var prcnki = new Prcnki();
    prcnki.nodeList=ndlst;
    var prresult = await prcnki.work();
    var sendlist = new Array();
    await new Promise((resolve,reject)=>{
        if(prresult.length==0)resolve();
        prresult.forEach(async(d,i)=>{
            var artf = new Artical();
            artf.ArtID=d.artID;
            await artf.getArtFull();
            artf.toShow()
            sendlist.push(artf);
            if(i===prresult.length-1)resolve();
        })
    })
    res.render("./search-res.html",{artList:sendlist})
});

app.get("/search.html",function(req,res){
    fs.readFile("./views/search.html",function(error,data){
        if(error){
            res.render("./404.html");
            return;
        }
        res.render('./search.html');
    })
});

app.get("/search-cki.html",async function(req,res){
    var kidx=new Array();
    var prcnki = new Prcnki();
    var key = req.query.keywd;
    var spd = new Spider();
    var sendlst=new Array();
    prcnki.artListMP = await spd.getList(key);
    prcnki.artListOJ = new Array();
    for(var i = 0;i<prcnki.artListMP.length;i++){
        var art = new Artical();
        await art.getArtbyLink(prcnki.artListMP[i].Link);
        art.ArtID=new Date().getTime().toString()+i;
        if(art.title){
            prcnki.artListOJ.push(art);
            kidx.push(art.ArtID)
        }
    }
    var prans = await prcnki.workWT();
    for(var i=0;i<prans.length;i++){
        var nart = prcnki.artListOJ[kidx.indexOf(prans[i].artID)];
        nart.toShow();
        sendlst.push(nart);
    }
    res.render("./search-cki.html",{artList:sendlst})
});

app.use("/public/",express.static("./public/"))

app.get("*",function(req,res){
    res.render("./404.html");
    return;
})

app.listen(9000,()=>{console.log("Working")})