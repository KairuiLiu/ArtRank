/**
 *   画板对象
 *               var
 *                  gb_width gb_height          |画板的宽度与高度
 *                  gb_rawData                  |原始点集与边集
 *                  gb_nodeID                   |当前节点ID
 *                  gb_linkID                   |当前边ID
 *                  gb_nodeCnt                  |当前有效节点数
 *                  gb_linkCnt                  |当前有效边数
 *                  ct_onViewMod                |在识图模式
 *                  ct_showColor                |是否选择颜色
 *                  ct_showColorRelative        |是否显示相对颜色
 *                  ct_showSizeRelative   		|是否显示相对大小
 *                  ct_step                     |是否分布显示
 *                  var jx_formula            	|MathJax公式
 *                  var pr_beta                	|Pr矩阵阻尼系数
 *                  pr_prec                     |Pr矩阵允许误差
 *                  pr_probMatrix          		|概率矩阵
 *                  pr_rankValuePre        		|PR值矩阵1
 *                  pr_rankValueRes         	|PR值矩阵2
 *                  pr_oriProbMatrix            |PR原始概率矩阵
 *                  pr_deadNodeMatrix         	|处理deadNodes后的矩阵
 *                  d3_svgLink					|边的SVG对象
 * 					d3_svgNode					|点的SVG对象
 * 					d3_links					|边在位置模拟器中得到的结果
 * 					d3_nodes					|点在位置模拟器中得到的结果
 *					d3_svg						|整个SVG对象
 *					d3_simulation				|力导向图模拟器
 *					d3_tmpArrow					|编辑模式下拖拽函数用
 * 					d3_charge					|力导向图模拟器节点电荷量
 * 					d3_collide，d3_collideIterae|力导向图模拟器节点的撞击力
 *              function
 *					d3_analog					|计算节点位置函数
 *					d3_plot						|绘图函数
 *					timelyFlash					|刷新监听事件
 *					drag 						|拖拽函数
 *					clearAll					|清空画布
 *					Report						|刷新参数函数
 *					addNode						|添加节点函数  
 *					addLink						|连边函数
 *					delNode						|删除节点函数
 *					initRepo					|初始化说明div
 *					listening					|画板的监听事件
 *					emptyData					|清空画布
 *					tData						|输入测试数据
 *					RreVirtual					|进入视图模式的特判函数
 *					pr_buildMatrix				|建立矩阵函数
 *					pr_calcMatrix				|迭代PR矩阵
 *					jx_genForm					|生成矩阵的LaTeX公式
 *					d3_export					|导出图片
 *					st_setStat					|设置状态码
 *					d3_refresh					|画布自适应伸缩函数
 *                      
 */

function drawBoard(){
    var gb_width=document.body.clientWidth*0.8;
    var gb_height=document.body.clientHeight*0.8;
    var gb_rawData,gb_nodeID,gb_linkID,gb_nodeCnt=gb_nodeID,gb_linkCnt=gb_linkID;
    var ct_onViewMod,ct_showColor,ct_showColorRelative,ct_showSize,ct_showSizeRelative,ct_step;
    var jx_formula="";
    var pr_beta,pr_prec,pr_probMatrix,pr_rankValuePre,pr_rankValueRes,pr_oriProbMatrix,pr_deadNodeMatrix;
    var d3_svgLink,d3_svgNode,d3_links,d3_nodes,d3_svg=d3.select("#svgBack"),d3_simulation,d3_tmpArrow,d3_charge,d3_collide,d3_collideIterae;
    this.d3_svgLink=[];
    this.d3_svgNode=[];
    this.d3_svg=d3.select("#svgBack");
    d3.select("#svgBack")
        .attr("viewBox","0,0,1920,1080")
        .attr("class","svgBack");
    this.d3_charge=-50;this.d3_collide=30;this.d3_collideIterae=2;
    this.ct_onViewMod=true;
    this.d3_tmpArrow={stNode:null,edNode:null,curNode:null,stX:null,stY:null,curX:null,curY:null,state:-1};
    this.gb_rawData={"nodes":[],"links":[]};
    this.gb_nodeID=this.gb_rawData.nodes.length;
    this.gb_linkID=this.gb_rawData.links.length;
    this.ct_showColor=false,this.ct_showColorRelative=false;
    this.ct_showSize=false,this.ct_showSizeRelative=false;
    this.jx_formula="",this.ct_step=false;
    this.pr_beta=0.85;
    this.pr_prec=0.01;
}

drawBoard.prototype.d3_analog=function(){
    this.clearAll();
    this.d3_links = this.gb_rawData.links.map(d => Object.create(d));
    this.d3_nodes = this.gb_rawData.nodes.map(d => Object.create(d));
    this.d3_simulation = d3.forceSimulation(this.d3_nodes)
        .force("link", d3.forceLink(this.d3_links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("charge",d3.forceManyBody().strength(this.d3_charge))
        .force('collide',d3.forceCollide().radius(this.d3_collide).iterations(this.d3_collideIterae))
        .force("center", d3.forceCenter(this.gb_width/2,this.gb_height/2));
}

drawBoard.prototype.d3_plot=function(enable){
    var mx=this;
    if(enable)debugger
    this.clearAll();
    var prValMin,prValMax,prValMax=-1,prValMin=2;
    var d3_colorMap=d3.scaleSequential().domain([0,1])
        .interpolator(d3.interpolateViridis);
    var d3_sizeMap = d3.scaleLinear()
        .domain([0,1])
        .range([10,30]);
    this.gb_rawData.nodes.forEach(function(d,i){
        prValMax=Math.max(prValMax,d.prValue);
        prValMin=Math.min(prValMin,d.prValue);
    });
    if(prValMax==prValMin)
        prValMax=prValMin+0.01;
    this.d3_svgLink = this.d3_svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(this.d3_links)
        .join("line")
        .attr("class","svgLink")
        .attr("stroke-width", d => 2+Math.sqrt(d.value))
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("passWay", d => d.__proto__.source+"TO"+d.__proto__.target);
    this.d3_svgNode = this.d3_svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(this.d3_nodes)
        .join("circle")
        .attr("r", function(d,i){
            if(mx.ct_showSize)
                if(mx.ct_showSizeRelative)
                    return d3_sizeMap((d.prValue-prValMin)/(prValMax-prValMin));
                else
                    return d3_sizeMap(d.prValue);
            return "15";
        })
        .attr("fill", function(d,i){
            if(mx.ct_showColor){
                if(mx.ct_showColorRelative)
                    return d3_colorMap((d.prValue-prValMin)/(prValMax-prValMin));
                else
                    return d3_colorMap(d.prValue);
            }
            return "#000";
        })
        .attr("class","svgNode")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("id", d => d.id)
        .attr("stroke-width","0");
    this.d3_svgNode.append("title")
        .text(d => d.id);
    this.d3_svgNode.call(this.drag(true));
}

drawBoard.prototype.timelyFlash=function(enable){
    var mx=this;
    if(enable)
        mx.d3_simulation.on("tick", function(){
            mx.d3_svgLink
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            mx.d3_svgNode
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
    else
        mx.d3_simulation.on("tick",null);
}

drawBoard.prototype.drag=function(enable){
    var mx=this;
    function dragstarted(event) {
        if(mx.ct_onViewMod){
            if (!event.active) mx.d3_simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }else{
            mx.d3_tmpArrow.stNode=event.subject.__proto__.id;
            mx.d3_nodes.forEach(function(d,i){
                if(d.__proto__.id==mx.d3_tmpArrow.stNode){
                    mx.d3_tmpArrow.stX=d.x;
                    mx.d3_tmpArrow.stY=d.y;
                }
            });
            mx.d3_tmpArrow.state=1;
            mx.d3_svg.select("#"+mx.d3_tmpArrow.stNode)
                .attr("stroke-width","5")
                .attr("stroke","red");
        }
    }
    function dragged(event) {
        if(mx.ct_onViewMod){
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }else{
            mx.d3_svg.select(".svgLinktmp").remove();
            mx.d3_tmpArrow.state=2;
            mx.d3_svg.selectAll(".svgNode")
                .attr("stroke-width","0")
                .attr("stroke","black");
            mx.d3_svg.select("#"+mx.d3_tmpArrow.curNode)
                .attr("stroke-width","5")
                .attr("stroke","red");
            mx.d3_svg.select("#"+mx.d3_tmpArrow.stNode)
                .attr("stroke-width","5")
                .attr("stroke","red");
            mx.d3_svg.append("line")
                .attr("class","svgLinktmp")
                .attr("stroke-width", 3)
                .attr("x1", mx.d3_tmpArrow.stX)
                .attr("y1", mx.d3_tmpArrow.stY)
                .attr("x2", event.x)
                .attr("y2", event.y)
                .attr("stroke", "#999");
        }
    }
    
    function dragended(event) {
        if(mx.ct_onViewMod){
            if (!event.active) mx.d3_simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }else{
            mx.d3_svg.select(".svgLinktmp").remove();
            mx.d3_tmpArrow.state=3;
            mx.d3_svg.selectAll(".svgNode")
                .attr("stroke-width","0")
                .attr("stroke","black");
            if(mx.d3_tmpArrow.edNode==null)mx.d3_tmpArrow.edNode=mx.d3_tmpArrow.curNode;
            var u=mx.d3_tmpArrow.stNode,v=mx.d3_tmpArrow.edNode;
            mx.d3_tmpArrow={stNode:null,edNode:null,curNode:null,curX:null,curY:null,state:-1};
            if(event.sourceEvent.shiftKey==false&&u!=null&&v!=null)
                mx.addLink(u,v);
        }
    }
    if(enable)
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    else
        return d3.drag()
            .on("start", null)
            .on("drag", null)
            .on("end", null);
}

drawBoard.prototype.EnterEdit=function(){
    this.ct_onViewMod=false;
    this.timelyFlash(false);
    this.d3_svgNode.call(this.drag(false));
    d3.select("#tp2")
        .attr("style","font-weight:bold");
    d3.select("#tp1")
        .attr("style","font-weight:400");
    d3.select(".mathEnv")
        .selectAll("*")
        .remove()
    d3.select(".mathEnv")
        .append("h1")
        .text("表达式显示区")
    d3.select(".mathEnv2")
        .selectAll("*")
        .remove()
    d3.select(".mathEnv2")
        .append("h1")
        .text("关键矩阵显示区")
    d3.select("#nextS").property("disabled",true);
    d3.select("#setSP").property("disabled",false);
    this.d3_plot();
}

drawBoard.prototype.EnterVirtual=function(){
    this.ct_onViewMod=true;
    this.d3_analog();
    this.d3_plot();
    this.timelyFlash(true);
    this.d3_svgNode.call(this.drag(true));
    d3.select("#tp1")
        .attr("style","font-weight:bold");
    d3.select("#tp2")
        .attr("style","font-weight:400");
}

drawBoard.prototype.clearAll=function(){
    d3.select("#svgBack").selectAll("*").remove();
    var defs =d3.select("#svgBack").append("defs")
                .append("marker")
                .attr("id","arrow")
                .attr("viewBox","0 0 10 10")
                .attr("refX","10")
                .attr("refY","5")
                .attr("markerUnits","userSpaceOnUse")
                .attr("markerWidth","10")
                .attr("markerHeight","10")
                .attr("orient","auto")
                .append("path")
                .attr("d","M 0 0 L 10 5 L 0 10 z")
                .attr("style","fill: #000000;");
}

drawBoard.prototype.Report=function(nodeID){
    var prVal;
    tnode=d3.select("#"+nodeID);
    info=d3.select(".exp");
    this.gb_rawData.nodes.forEach(function(d,i){
        if(d.id==nodeID)
            prVal=d.prValue;
    })
    info.selectAll("*").remove();
    info.append("ul")
        .append("li")
        .text("编号:"+nodeID)
        .append("li")
        .text("颜色:"+tnode.attr("fill"))
        .append("li")
        .text("半径:"+tnode.attr("r"))
        .append("li")
        .text("PageRank得分:"+prVal);
}

drawBoard.prototype.addNode=function(x,y){
    this.gb_rawData.nodes.push({"id": "node"+this.gb_nodeID, "prValue": null});
    var node2={
        "index":this.gb_nodeID,
        "vx":0,
        "vy":0,
        "x":x,
        "y":y
    };
    node2.__proto__=this.gb_rawData.nodes[this.gb_rawData.nodes.length-1];
    this.d3_nodes.push(node2);
    this.gb_nodeID++;
    this.d3_plot();
}

drawBoard.prototype.addLink=function(uName,vName){
    var mx=this;
    var u,v,idx=-1;
    mx.d3_nodes.forEach(function(d,i){
        if(d.__proto__.id==uName)u=d;
        if(d.__proto__.id==vName)v=d;
    });
    mx.gb_rawData.links.forEach(function(d,i){
        if(d.source==u.__proto__.id && d.target==v.__proto__.id)idx=i;
    });
    if(idx==-1){
        idx=mx.gb_rawData.links.length;
        mx.gb_rawData.links.push({"source": u.__proto__.id, "target": v.__proto__.id, "value": 0});
        (function(){
            tmplink={
                "index":mx.gb_linkID,
                "source":u,
                "target":v
            };
            tmplink.__proto__=mx.gb_rawData.links[idx];
            mx.d3_links.push(tmplink);
            mx.gb_linkID++;
        })()
    }
    mx.gb_rawData.links[idx].value++;
    mx.d3_plot();
}

drawBoard.prototype.delNode=function(nodeID){
    var linkLen=this.gb_rawData.links.length;
    for(var i=linkLen-1;i>=0;i--)
        if(this.gb_rawData.links[i].source==nodeID||this.gb_rawData.links[i].target==nodeID){
            this.gb_rawData.links.splice(i,1);
            this.d3_links.splice(i,1);
        }
    var nodeLen=this.gb_rawData.nodes.length;
    for(var i=nodeLen-1;i>=0;i--)
        if(this.gb_rawData.nodes[i].id==nodeID){
            this.gb_rawData.nodes.splice(i,1);
            this.d3_nodes.splice(i,1);
        }
    this.d3_plot();
}

drawBoard.prototype.initRepo=function(){
    info=d3.select(".exp");
    info.select("*").remove();
    info.html("<p>使用说明</p><ul><li>画布的拖拽函数没有适配移动端,请在PC端访问</li><li>画布有演示和编辑模式</li><li>在演示模式中,光标放在元素上可以查看节点信息</li><li>在演示模式中,拖动元素可以调整元素的位置(尽量小的交叉)</li><li>在编辑模式下,单击空白处即可创建节点</li><li>在编辑模式下,拖动元素即可建立一条有向边</li><li>在编辑模式下,Shift+鼠标单击节点即可删除节点</li><li>在编辑模式下,进入演示模式后画布会自动布局</li><li>你可以在任何模式下设置可视化形式</li><li>可以使用测试数据快速建立一个简单的图</li></ul>");
}

drawBoard.prototype.listening=function(){
    var mx=this;
    mx.d3_svg.on("click",function(event){
        if(event.target.getAttribute("class")=="svgNode")
            if(event.shiftKey&&!mx.ct_onViewMod)
                mx.delNode(event.target.getAttribute("id"));
            else if(!mx.ct_onViewMod){
                //loop
            }else
                mx.Report(event.srcElement.getAttribute("id"));
        else if(!mx.ct_onViewMod)
            mx.addNode(d3.pointer(event)[0],d3.pointer(event)[1]);
    })

    mx.d3_svg.on("mouseover",function(event){
        if(event.target.getAttribute("class")=="svgNode"&&(mx.d3_tmpArrow.state==1||mx.d3_tmpArrow.state==2))
            mx.d3_tmpArrow.curNode=event.srcElement.id;
        else if(event.target.getAttribute("class")=="svgBack"&&(mx.d3_tmpArrow.state==1||mx.d3_tmpArrow.state==2))
            mx.d3_tmpArrow.curNode=null;
        else if(event.target.getAttribute("class")=="svgNode"&&mx.d3_tmpArrow.state==3)
            mx.d3_tmpArrow.edNode=event.srcElement.id;
        else if(event.target.getAttribute("class")=="svgNode"&&mx.d3_tmpArrow.state==-1&&mx.ct_onViewMod==true)
            mx.Report(event.srcElement.id);
    })

    mx.d3_svg.on("mouseout",function(event){
        if(event.target.getAttribute("class")=="svgNode"&&mx.d3_tmpArrow.state==-1&&mx.ct_onViewMod==true)
            mx.initRepo();
    })

    d3.select("#nextS").on("click",function(){
        d3.select("#setSP").property("disabled",true);
        // mathEnv
        mx.pr_calcMatrix();
        mx.d3_plot();
        d3.select(".mathEnv")
            .selectAll("*")
            .remove()
        d3.select(".mathEnv2")
            .selectAll("*")
            .remove()
        d3.select(".mathEnv").text("\\["+mx.jx_genForm(mx.pr_probMatrix)+"\\times"+mx.jx_genForm(mx.pr_rankValuePre)+"="+mx.jx_genForm(mx.pr_rankValueRes)+"\\]")
        d3.select(".mathEnv2").text('\\['+mx.jx_genForm(mx.pr_oriProbMatrix)+'\\] \\['+mx.jx_genForm(mx.pr_deadNodeMatrix)+'\\] \\['+mx.jx_genForm(mx.pr_probMatrix)+'\\]')
        MathJax.typeset()
            if(!mx.pr_rankValuePre.check(mx.pr_rankValueRes,mx)){
            d3.select("#nextS").property("disabled",true);
            d3.selectAll("#setSP").property("disabled",false);         //bug
        }
    })
}

drawBoard.prototype.emptyData=function(){
    this.EnterEdit();
    this.gb_rawData={
        "nodes":[],
        "links":[]
    }
    this.gb_nodeID=this.gb_rawData.nodes.length;
    this.gb_linkID=this.gb_rawData.links.length;
    this.initRepo();
    this.EnterVirtual();
}

drawBoard.prototype.tData=function(){
    this.EnterEdit();
    this.gb_rawData={
        "nodes":[
            {"id": "node0", "prValue": null},    
            {"id": "node1", "prValue": null},
            {"id": "node2", "prValue": null},
            {"id": "node3", "prValue": null},
            {"id": "node4", "prValue": null},
            {"id": "node5", "prValue": null},
            {"id": "node6", "prValue": null},
            {"id": "node7", "prValue": null}
        ],"links":[
            {"source": "node0", "target": "node1", "value": 1},
            {"source": "node0", "target": "node2", "value": 100},
            {"source": "node0", "target": "node3", "value": 1},
            {"source": "node0", "target": "node4", "value": 1},
            {"source": "node1", "target": "node5", "value": 1},
            {"source": "node1", "target": "node6", "value": 1},
            {"source": "node5", "target": "node7", "value": 1}
    ]};
    this.gb_nodeID=this.gb_rawData.nodes.length;
    this.gb_linkID=this.gb_rawData.links.length;
    this.initRepo();
    this.EnterVirtual();
}

drawBoard.prototype.PreVirtual=function(){
    d3.selectAll("#setSP").property("disabled",true);
    this.pr_buildMatrix();
    if(this.ct_step){
        this.pr_calcMatrix();
        this.d3_plot();
        d3.select(".mathEnv")
            .selectAll("*")
            .remove()
        d3.select(".mathEnv2")
            .selectAll("*")
            .remove()
        d3.select(".mathEnv")
            .text("\\["+this.jx_genForm(this.pr_probMatrix)+"\\times"+this.jx_genForm(this.pr_rankValuePre)+"="+this.jx_genForm(this.pr_rankValueRes)+"\\]")
        d3.select(".mathEnv2")
            .text('\\['+this.jx_genForm(this.pr_oriProbMatrix)+'\\] \\['+this.jx_genForm(this.pr_deadNodeMatrix)+'\\] \\['+this.jx_genForm(this.pr_probMatrix)+'\\]')
        MathJax.typeset()
        d3.select("#nextS").property("disabled",false)
    }else{
        do{
            this. pr_calcMatrix();
        }while(this.pr_rankValuePre.check(this.pr_rankValueRes,this));
        this.d3_plot();
        d3.select(".mathEnv")
            .selectAll("*")
            .remove()
        d3.select(".mathEnv2")
            .selectAll("*")
            .remove()
        d3.select(".mathEnv")
            .text("\\["+this.jx_genForm(this.pr_probMatrix)+"\\times"+this.jx_genForm(this.pr_rankValuePre)+"="+this.jx_genForm(this.pr_rankValueRes)+"\\]")
        d3.select(".mathEnv2")
            .text('\\['+this.jx_genForm(this.pr_oriProbMatrix)+'\\] \\['+this.jx_genForm(this.pr_deadNodeMatrix)+'\\] \\['+this.jx_genForm(this.pr_probMatrix)+'\\]')
        MathJax.typeset()
        d3.selectAll("#setSP").property("disabled",false);
    }
    this.EnterVirtual();
}

drawBoard.prototype.pr_buildMatrix=function(){
    this.pr_probMatrix=new pr_Matrix(this.gb_rawData.nodes.length,this.gb_rawData.nodes.length,this.pr_beta)
    this.pr_rankValuePre=new pr_Matrix(this.gb_rawData.nodes.length,1,-1)
    this.pr_rankValueRes=new pr_Matrix(this.gb_rawData.nodes.length,1,-1)
    this.pr_rankValuePre.fillNum(1/this.pr_probMatrix.m)
    this.pr_rankValueRes.fillNum(1/this.pr_probMatrix.m)
    this.pr_probMatrix.graphConvert(this);
}

drawBoard.prototype.pr_calcMatrix=function(){
    var mx=this;
    this.pr_rankValuePre=JSON.parse(JSON.stringify(this.pr_rankValueRes));
    this.pr_rankValuePre.__proto__=this.pr_rankValueRes.__proto__;
    this.pr_rankValueRes=this.pr_probMatrix.Rtime(this.pr_rankValuePre);
    this.gb_rawData.nodes.forEach(function(d,i){
        d.prValue=mx.pr_rankValueRes.matrix[i][0];
    })
    return;
}

drawBoard.prototype.jx_genForm=function(form){
    var res="\\begin{bmatrix} ";
    form.matrix.forEach(function(d,i){
        d.forEach(function(d2,i2){
            res+=d2.toFixed(2)
            if(i2!=d.length-1)res+="&"
        })
        if(i!=form.matrix.length-1)res+=" \\\\ ";
    })
    res+=" \\end{bmatrix}"
    return res;
}


drawBoard.prototype.d3_export=function(){
    var svgFile='<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+document.querySelector(".svgView").innerHTML.replace('svg id','svg xmlns="http://www.w3.org/2000/svg" version="1.1" id');
    var downLink = document.createElement('a')
    downLink.download = "PageRankPicture.svg"
    let blob = new Blob([svgFile])
    downLink.href = URL.createObjectURL(blob)
    document.body.appendChild(downLink)
    downLink.click()
    document.body.removeChild(downLink)
}

drawBoard.prototype.st_setState=function(d){
    var mx=this;
    var keys=JSON.parse(d.getAttribute("mv"));
    var vals=""+d.options[d.options.selectedIndex].value
    keys.forEach(function(d2,i2){
        mx[d2]=Boolean(Number(vals[i2]))
    })
    
    if(keys.length==1)
        d3.select("#nextS").property("disabled",true);
    else
        this.d3_plot();
}   

drawBoard.prototype.d3_refresh=function(){
    this.gb_height=Number(window.getComputedStyle(document.getElementById("svgfarme")).height.replace(/px/,""))
    this.gb_width=Number(window.getComputedStyle(document.getElementById("svgfarme")).width.replace(/px/,""))
    this.d3_svg=d3.select("#svgBack")
        .attr("viewBox","0,0,"+this.gb_width+","+this.gb_height)
    if(this.ct_onViewMod)
        this.EnterVirtual();
}

drawBoard.prototype.init=function(){
    d3.select("body")
        .attr("onresize","svgDrawBoard.d3_refresh()")
    this.initRepo();
    this.EnterVirtual();
    this.listening();
    d3.select(".mathEnv")
        .append("h1")
        .text("表达式显示区");
    d3.select(".mathEnv2")
        .append("h1")
        .text("关键矩阵显示区");
    this.d3_refresh()
}

/**
 * PageRank矩阵的定义和计算
 * pr_Matrix
 *      var:
 *                  n
 *                  m
 *                  beta
 *      function:
 *                  init()
 *                  graphConvert()
 *                  Rtime()
 *                  fillNum()
 *                  check()
 */

function pr_Matrix(n,m,beta){
    this.n=n;
    this.m=m;
    this.beta=beta;
    this.matrix=new Array();
    for(var i=0;i<n;i++)
        this.matrix[i]=new Array();
    this.fillNum(0);
}

pr_Matrix.prototype.graphConvert=function(board){
    var mx=this;
    var odeg=new Array(mx.m).fill(0);
    board.gb_rawData.links.forEach(function(d,i){
        u=board.gb_rawData.nodes.indexOf(board.gb_rawData.nodes.find(d2 => d2.id == d.source));
        v=board.gb_rawData.nodes.indexOf(board.gb_rawData.nodes.find(d2 => d2.id == d.target));
        w=d.value;
        odeg[u]+=w;
        mx.matrix[v][u]+=w;
    })    
    odeg.forEach(function(d,i){
        for(var j=0;j<mx.n;j++)
            if(d!=0)mx.matrix[j][i]/=d;
    })
    board.pr_oriProbMatrix=JSON.parse(JSON.stringify(mx));
    board.pr_oriProbMatrix.__proto__=board.pr_probMatrix.__proto__;
    odeg.forEach(function(d,i){
        for(var j=0;j<mx.n;j++)
            if(d==0)mx.matrix[j][i]=1/mx.n;
    })
    board.pr_deadNodeMatrix=JSON.parse(JSON.stringify(mx));
    board.pr_deadNodeMatrix.__proto__=board.pr_probMatrix.__proto__;
    mx.matrix.forEach(function(d){
        for(var i=0;i<mx.m;i++)
            d[i]=board.pr_beta*d[i]+(1-board.pr_beta)/mx.n;
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

pr_Matrix.prototype.check=function(d,board){
    for(i=0;i<this.matrix.length;i++)
        for(j=0;j<this.matrix[i].length;j++)
            if(Math.abs(this.matrix[i][j]-d.matrix[i][j])>board.pr_prec)
                return true;
    return false;
}

/**
 * 画版类的实例 全局初始化
 */

var svgDrawBoard=new drawBoard();
svgDrawBoard.init()
