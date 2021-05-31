const prMatrix=require("./matrix")
const Artical=require("./artical")

function Prcnki(){
    this.nodeList=new Array();
    this.matrix=null;
    this.nodeRes=new Array();
    this.nodeRef=new Array();
    this.rankValuePre=null;
    this.rankValueRes=null;
}

Prcnki.prototype.work=async function(){
    var nodemap=new Array();
    await new Promise((resolve,reject)=>{
        if(this.nodeList.length==0)resolve();
        this.nodeList.forEach(async (d,i)=>{
            var art=new Artical();
            art.ArtID=d;
            var stat = await art.getBase();
            if(!stat)return true;
            stat = await art.getRef();
            if(!stat)return true;
            nodemap.push({'ArtID':art.ArtID,'title':art.title})
            art.refNmLk.forEach((d,i)=>{
                this.nodeRef.push({"u":art.title,"v":d.Title});
            });
            if(i==this.nodeList.length-1)resolve();
        })
    });
    this.nodeList=new Array();
    nodemap.forEach((d,i)=>{
        this.nodeList.push(d.title);
    })
    this.pr_probMatrix=new prMatrix(this.nodeList.length,this.nodeList.length,0.8)
    this.pr_rankValuePre=new prMatrix(this.nodeList.length,1,-1)
    this.pr_rankValueRes=new prMatrix(this.nodeList.length,1,-1)
    this.pr_probMatrix.buildMatrix(this.nodeList,this.nodeRef)
    this.pr_rankValuePre.fillNum(1/this.nodeList.length)
    this.pr_rankValueRes.fillNum(1/this.nodeList.length)
    do{
        this.pr_calcMatrix();
    }while(this.pr_rankValuePre.check(this.pr_rankValueRes,this));
    var res=new Array();
    this.nodeList.forEach((d,i)=>{
        res.push({"artID":nodemap[i].ArtID,"pr":this.pr_rankValueRes.matrix[i][0]});
    })
    res.sort(this.sortPR);
    return res;
}

Prcnki.prototype.pr_calcMatrix=function(){
    var mx=this;
    this.pr_rankValuePre=JSON.parse(JSON.stringify(this.pr_rankValueRes));
    this.pr_rankValuePre.__proto__=this.pr_rankValueRes.__proto__;
    this.pr_rankValueRes=this.pr_probMatrix.Rtime(this.pr_rankValuePre);
    return;
};

Prcnki.prototype.sortPR=function(a,b){  
    return b.pr-a.pr
}

Prcnki.prototype.workWT=async function(){
    this.nodemap=new Array();
    // 根据NodeList ID 构建Ref
    await new Promise((resolve,reject)=>{
        if(this.artListOJ.length==0)resolve();
        this.artListOJ.forEach(async (d,i)=>{
            this.nodemap.push({'ArtID':d.ArtID,'title':d.title})
            d.refNmLk.forEach((d2,i2)=>{
                this.nodeRef.push({"u":d.title,"v":d2.Title});
            });
            if(i==this.artListOJ.length-1)resolve();
        })
    });
    this.artTitleList=new Array();
    this.nodemap.forEach((d,i)=>{this.artTitleList.push(d)});
    this.pr_probMatrix=new prMatrix(this.artListOJ.length,this.artListOJ.length,0.8)
    this.pr_rankValuePre=new prMatrix(this.artListOJ.length,1,-1)
    this.pr_rankValueRes=new prMatrix(this.artListOJ.length,1,-1)
    this.pr_probMatrix.buildMatrix(this.artTitleList,this.nodeRef)
    this.pr_rankValuePre.fillNum(1/this.artListOJ.length)
    this.pr_rankValueRes.fillNum(1/this.artListOJ.length)
    do{
        this.pr_calcMatrix();
    }while(this.pr_rankValuePre.check(this.pr_rankValueRes,this));
    var res=new Array();
    this.artTitleList.forEach((d,i)=>{
        res.push({"artID":this.artListOJ[i].ArtID,"pr":this.pr_rankValueRes.matrix[i][0]});
    })
    res.sort(this.sortPR);
    return res;
}

module.exports=Prcnki;
