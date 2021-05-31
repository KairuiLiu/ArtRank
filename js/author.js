var mysql=require("./mysql")
var sql=mysql.sql;

function Author(_name=null,_orgnaize=null){
    this.name=_name;
    this.organize=_orgnaize;
}

// 对于Insert函数，是否有 key=null 对结果都没有影响
// 对于Query 函数，默认不支持 key is null
// 对于Delete函数，默认支持 key is null
// 对于Update函数，默认查询支持 key is null 强制修改不支持null,写null会替换为原文

Author.prototype.insertDB=async function(allowNull=false){
    if(!(this.name || this.organize))return false;
    var sqlCmd='insert into `AUTHOR` SET ',res;
    sqlCmd+=sql.sqlGener({'Author':this.name,'Organize':this.organize},',',allowNull);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=false;
            else res=true;
            resolve();
        });
    });
    return res;
}

Author.prototype.queryDB=async function(name=null,organize=null,fuzzy=false,allowNull=false){
    var sqlCmd='select * from `AUTHOR` ';
    if(name||organize)sqlCmd+='  where  ';
    sqlCmd+=sql.sqlGener({'Author':name,'Organize':organize},'and',allowNull)
    let res,err;
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=false;  
            else res=result;
            resolve();       
        });
    })
    return res;
}

Author.prototype.queryID=async function(){
    if(!(this.name||this.organize))return false;
    var sqlCmd='select AUID from `AUTHOR` where ',res;
    sqlCmd += sql.sqlGener({'Author':this.name,'Organize':this.organize},'and',true);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err||result.length<=0)res=false;
            else res=result[0].AUID;
            resolve();
        });
    });
    return res;
}

Author.prototype.deleteDB=async function(allowNull=true){                                             // 允许null做到精准删除
    if(!(this.name||this.organize))return false;
    var sqlCmd='delete from `AUTHOR` WHERE ',res;
    sqlCmd+=sql.sqlGener({'Author':this.name,'Organize':this.organize},'and',allowNull)
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=false;
            else res=true;
            resolve();
        });
    });
    return res;
}

Author.prototype.updateDB=async function(nname=null,norg=null,allowNull=true){                        // 允许null做到精准更新
    if(!(nname||norg))return res;
    if(!nname)nname=this.name;
    if(!norg)norg=this.organize;
    var sqlCmd='update `AUTHOR` set ',res;
    sqlCmd+=sql.sqlGener({'Author':nname,'Organize':norg},',',allowNull);
    sqlCmd+=' where '
    sqlCmd+=sql.sqlGener({'Author':this.name,'Organize':this.organize},'and',false);           // 不得更新到null
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            if(err)res=false;        
            else result=true;
            resolve()
        });
    });
    return res; 
}

module.exports=Author;