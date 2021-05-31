var request = require('request');
var Iconv = require('iconv-lite');
const cheerio = require('cheerio');
const superagent = require('superagent');
const querystring = require('querystring');

// 封装爬虫工具
function Spider(){
    // 爬文章和引用
    this.ArtUrl='';
    this.ArtUrlH='https://kns.cnki.net/kcms/detail/detail.aspx?';
    this.RefUrlH='https://kns.cnki.net/kcms/detail/frame/list.aspx?';
    this.optionsArt=new Object();
    this.optionsRef=new Object();
    this.artOpt=new Object();
    this.artTex="";
    this.refTex="";
    
    // 关键词搜索
    this.Keywds='';
    this.KeyUrlH='https://kns.cnki.net/KNS8/Brief/GetGridTableHtml';
    this.optionsKey=new Object();
    this.artLst=new Array();
    this.keyTex="";
}

Spider.prototype.init=function(){
    this.ArtUrl="";
    this.artTex="";
    this.refTex="";
}

Spider.prototype.getSrc=async function(url,resolve,reject){
    //获取Art Ref 的html
    var getOK=true;
    spd=this;
    this.ArtUrl=url;
    this.optionsArt = {
        encoding: null,
        method: 'GET',
        url: this.ArtUrl,
        headers: {
            'Host': 'kns.cnki.net',
            'Referer': 'https://kns.cnki.net/kns8/defaultresult/index',
        },
        body: '{ "headers":{"normalizedNames":{},"lazyUpdate":null}}'
    };
    await new Promise((resolve,reject)=>{
        request(this.optionsArt,(error, response, body)=>{
            if(error)reject();
            spd.artTex=body.toString();
            let $ = cheerio.load(spd.artTex);
            spd.artOpt.vl=$('#listv').attr('value');
            var ops=querystring.parse(spd.ArtUrl.split('detail.aspx?')[1]);
            for (var ele in ops){
                spd.artOpt[ele]=ops[ele];
            }
            spd.optionsRef = {
                encoding: null,
                method: 'GET',
                url: spd.RefUrlH+'dbcode='+spd.artOpt.dbcode+'&filename='+spd.artOpt.filename+'&dbname='+spd.artOpt.dbname+'&RefType=1'+'&vl='+spd.artOpt.vl,
                headers: {
                    'Host': 'kns.cnki.net',
                    'Referer': spd.ArtUrl,
                },
                body: '{ "headers":{"normalizedNames":{},"lazyUpdate":null}}'
            };
            resolve()
        });
    }).catch(()=>{getOK=false});
    await new Promise((resolve,reject)=>{
        request(spd.optionsRef,function (error, response, body) {
            spd.refTex=body.toString();
            resolve()
        });
    }).catch(()=>{getOK=false});
    return getOK;
}

Spider.prototype.findMainArt= async function(art,resolve,reject){
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
    art.link=this.ArtUrl;
    let $ = cheerio.load(this.artTex);
    $('.brief .wx-tit').each((idx, ele) => {
        art.title=$(ele).find("h1").text();
        art.author=new Array();
        $(ele).find(".author span").each((idx,ele)=>{
            art.author.push($(ele).text().replace(/[0-9]{1,}$/,""))
        })
        art.organ=new Array();
        $(ele).find("h3:not(.author)").find("span,a").each((idx,ele)=>{
            art.organ.push($(ele).text().replace(/^[0-9]{1,}\. /,""))
        });
    });
    art.source=$('.top-tip>span>a:first-of-type').text()
    art.year=$('.top-tip>span>a:last-of-type').text().split(",")[0]
    art.keyword=new Array()
    $("p[class=keywords] a").each((idx,ele)=>{
        art.keyword.push($(ele).text().replaceAll(" ","").replaceAll("\n",'').replaceAll(";",''));
    });
    art.summary=$("#ChDivSummary").text()
    return;
}

Spider.prototype.findRef=async function(art,resolve,reject){
    let $ = cheerio.load(this.refTex.toString());
    art.refNmLk=new Array();
    $(".essayBox a[target=kcmstarget]").each((idx,ele)=>{
        art.refNmLk.push({
            Title: $(ele).text(),
            Link: 'https://kns.cnki.net/'+$(ele).attr('href')
        });
    })
    return;
}

Spider.prototype.findKeyword= async function(keyWord,resolve,reject){
    var spd=this;
    this.Keywds=keyWord;
    let formdate={
        QueryJson:'{"Platform":"","DBCode":"SCDB","KuaKuCode":"CJFQ,CDMD,CIPD,CCND,CISD,SNAD,BDZK,CCVD,CJFN,CCJD","QNode":{"QGroup":[{"Key":"Subject","Title":"","Logic":1,"Items":[{"Title":"主题","Name":"SU","Value":"'+this.Keywds+'","Operate":"%=","BlurType":""}],"ChildItems":[]}]}}',
        DBCode:'SCDB',
        KuaKuCodes:'CJFQ,CDMD,CIPD,CCND,CISD,SNAD,BDZK,CCVD,CJFN,CCJD',
        RecordsCntPerPage:10
    }
    this.optionsKey = {
        'method': 'POST',
        'url': this.KeyUrlH,
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'kns.cnki.net',
            'Referer': 'https://kns.cnki.net/kns8/defaultresult/index',
        },
        formData: formdate
    };

    await new Promise((resolve,reject)=>{
        request(spd.optionsKey,(error, response, body)=>{
            let $ = cheerio.load(body);
            $('#gridTable tbody tr').each((idx,ele)=>{
                var gts=querystring.parse($(ele).find('.name a').attr('href'));
                spd.artLst.push({
                    Title:$(ele).find('.name a').text().replaceAll(" ","").replaceAll("\n",""),
                    Link:'https://kns.cnki.net/kcms/detail/detail.aspx?dbcode='+gts.DbCode+'&dbname='+gts.DbName+'&filename='+gts.FileName
                })
            });
            resolve()
        })
    });
}

Spider.prototype.getList= async function(keywords){
    // new Promise((resolve,reject)=>{this.findKeyword(keywords,resolve,reject)})
    await this.findKeyword(keywords);
    return this.artLst
}

module.exports=Spider;  