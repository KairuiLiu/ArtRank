function pr_Matrix(n,m,beta){
    this.n=n;
    this.m=m;
    this.beta=beta;
    this.eps=0.05
    this.matrix=new Array();
    for(var i=0;i<n;i++)
        this.matrix[i]=new Array();
    this.fillNum(0);
}

pr_Matrix.prototype.buildMatrix=function(nodes,edge){
    var mx=this;
    var odeg=new Array(mx.m).fill(0);
    edge.forEach(function(d,i){
        var u=nodes.indexOf(d.u);
        var v=nodes.indexOf(d.v);
        if(u==-1||v==-1)return true;
        odeg[u]++;
        mx.matrix[v][u]++;
    })    

    odeg.forEach(function(d,i){
        for(var j=0;j<mx.n;j++)
            if(d!=0)mx.matrix[j][i]/=d;
    })
        
    odeg.forEach(function(d,i){
        for(var j=0;j<mx.n;j++)
            if(d==0)mx.matrix[j][i]=1/mx.n;
    })
    
    mx.matrix.forEach(function(d){
        for(var i=0;i<mx.m;i++)
            d[i]=mx.beta*d[i]+(1-mx.beta)/mx.n;
    })
}

pr_Matrix.prototype.Rtime=function(rightVal){
    var res=new pr_Matrix(this.n,1,0);
    for(var i=0;i<this.n;i++)
        for(var j=0;j<rightVal.m;j++){
            var noderes=0;
            for(p=0;p<this.m;p++)
                noderes+=this.matrix[i][p]*rightVal.matrix[p][j];
            res.matrix[i][j]=noderes;1
        }
    return res;
}

pr_Matrix.prototype.fillNum=function(val){
    for(var i=0;i<this.n;i++)
        for(var j=0;j<this.m;j++)
            this.matrix[i][j]=val;
}

pr_Matrix.prototype.check=function(d){
    for(i=0;i<this.matrix.length;i++)
        for(j=0;j<this.matrix[i].length;j++)
            if(Math.abs(this.matrix[i][j]-d.matrix[i][j])>this.eps)
                return true;
    return false;
}

module.exports=pr_Matrix