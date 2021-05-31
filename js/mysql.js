var mysql = require('mysql');

var _connect={
    host     : 'localhost',
    user     : 'root',
    password : 'lkr0101',
    database : 'PRTest'
}

function SQL(_cnnt=_connect){
    this.cnnt = mysql.createConnection(_cnnt);
}

SQL.prototype.commonQuery=function(cmd,resove,reject){
    this.cnnt.query(cmd,function (err, result) {
        if(err){reject(err.message)}
        else resove(result)
    });
}

SQL.prototype.sqlGener=function(obj,symbol,allowNull=false,cntSym='='){
    var res="";
    for(i in obj)
        if(obj[i]!=null||allowNull){
            if(res.length)res+=" "+symbol+" ";                  // TODO escape
            if(obj[i]==null || obj[i]==undefined) res+=i+" is NULL";
            else res+=i+" "+cntSym+" '"+obj[i]+"'";
        }
    return res
}

SQL.prototype.close=function(){
    this.cnnt.end();
}

exports.sql=new SQL();
exports.SQL=SQL;