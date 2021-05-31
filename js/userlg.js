var mysql=require("./mysql")
var sql=mysql.sql;

function Userlg(_uid,_aid){
    this.UID = _uid;
    this.ArticalID = _aid;
}

Userlg.prototype.insertDB=async function(){
    if(!(this.ArticalID||this.UID))return false;
    var sqlCmd = 'insert into USERDB SET '+sql.sqlGener({'UID':this.UID,"ArticalID":this.ArticalID},',',false);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            resolve();
        });
    })
    return;
}

Userlg.prototype.queryDB=async function(UID=null){
    if(!UID)UID=this.UID;
    var res=new Array();
    var sqlCmd = 'insert into USERDB SET '+sql.sqlGener({'UID':this.UID,"ArticalID":this.ArticalID},',',false);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err) reject()
            else resolve(result);
        });
    }).then((ele)=>{
        ele.forEach(element => {res.push(element)});
    }).catch(()=>{res=null})
    return res;
}

Userlg.prototype.deleteDB=async function(){
    if(!(this.UID&&this.ArticalID))return false;
    var res,sqlCmd = 'delete from USERDB WHERE '+sql.sqlGener({'UID':this.UID,"ArticalID":this.ArticalID},'and',false);
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{res=err?false:result;resolve();});
    })
    return res;
}

module.exports=Userlg;
