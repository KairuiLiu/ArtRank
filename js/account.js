var mysql=require('./mysql');
var bcrypt = require('bcrypt');
// var
var sql=mysql.sql;

function User(_uid,_username,_passwd,_passwdCry){
    this.uid=_uid;
    this.username=_username;
    this.passwd=_passwd;
    this.passwdCry=_passwdCry;
    if(this.passwdCry==null && this.passwd!=null)
        this.passwdCry=bcrypt.hashSync(this.passwd,10)
}

User.prototype.check=function(pwd){
    if(bcrypt.hashSync(pwd,10)==this.passwdCry)return true;
    return false;
}

User.prototype.insertDB=async function(){
    if(!(this.username&&this.passwd))return false;
    var res;
    this.passwdCry=bcrypt.hashSync(this.passwd,10);
    sqlCmd="insert into `USER` SET "+ sql.sqlGener({'Username':this.username,'passwdRSA':this.passwdCry},",")
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=false;
            else res=true;
            resolve();
        });
    });
    return res;
}

User.prototype.queryDB=async function(username){
    if(!this.username)return false;
    var sqlCmd="select * from `USER` where Username = "+sql.cnnt.escape(this.username)
    var res;
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=false; 
            else res=result;
            resolve();
        });
    });
    return res;
}

User.prototype.deleteDB=async function(){
    var res;
    var sqlCmd="delete from `USER` where Username = "+sql.cnnt.escape(this.username)
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)res=fasle;        
            else res=true;
            resolve();
        });
    });
}

User.prototype.updateDB=async function(username=null,passwd=null){
    if(!this.username)username=this.username;
    if(!this.passwd)passwd=this.passwd;
    var passwd=bcrypt.hashSync(this.passwd,10),sqlCmd='update `USER` set ',res;
    sqlCmd+=sql.sqlGener({'Username':this.username,'passwdRSA':this.passwd},',',false);
    sqlCmd+=' where Username = '+sql.cnnt.escape(this.username)
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err,result)=>{
            if(err)res=false;      
            else res=true;
            resolve();
        });
    });
}

User.prototype.idExt=async function(UID=null){
    if(UID===undefined||UID===null)return false;
    var getID=false;
    var sqlCmd="select * from `USER` where UID = "+sql.cnnt.escape(UID)
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)getID=false;else getID=true;
            resolve();
        });
    });
    return getID;
}

User.prototype.getInfo=async function(UID=null){
    if(UID===undefined||UID===null)return false;
    var getID=false;
    var sqlCmd="select * from `USER` where UID = "+sql.cnnt.escape(UID)
    await new Promise((resolve,reject)=>{
        sql.cnnt.query(sqlCmd,(err, result)=>{
            if(err)getID=false;else getID=result;
            resolve();
        });
    });
    return getID;
}

module.exports=User;

// (async ()=>{
//     var user1 = new User(null,"test1","test1");
//     var user2 = new User(null,"test2","test2");
//     var user3 = new User(null,"finalU1","SWU");
//     var user4 = new User(null,"finalU2","SWU");
//     await user1.insertDB();
//     await user2.insertDB();
//     await user3.insertDB();
//     await user4.insertDB();
//     console.log("init OK")
// })()