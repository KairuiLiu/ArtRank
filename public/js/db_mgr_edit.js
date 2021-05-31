$(".card").delegate("#btn_rs","click",function(){location.reload();})
$(".card").delegate("#btn_bk","click",function(){
    $("#product>li:nth-child(2)>a>span").click()
})

function getChg(){
    var chg={};
    var flag=true;

    var title = $("#inp_title").val();
    if(!title||title===""){swal("错误!", "标题不能为空!", "error");return false;}
    if(title!=$("#inp_title").attr('ovalue'))chg.title=title;
    
    
    chg.chnopair=new Array();
    $("[id^=inp_nopair]").each((i,d)=>{
        let nname=$($(d).find("input")[0]).val();
        let norganize=$($(d).find("input")[1]).val();
        let oname=$($(d).find("input")[0]).attr('ovalue');
        let oorganize=$($(d).find("input")[1]).attr('ovalue');
        if(nname==""&&norganize=="")return true;
        if((oorganize!=norganize)||(oname!=nname)){
            oname=oname=='暂无'?"":oname;
            oorganize=oorganize=='暂无'?"":oorganize;
            chg.chnopair.push({"nname":nname,"norganize":norganize,"oname":oname,"oorganize":oorganize});
        }  
    })

    chg.chkeyword=new Array();
    $("[id^=inp_keyword]").each((i,d)=>{
        let okey=$(d).attr('ovalue');
        let nkey=$(d).val();
        if(nkey=="")return true;
        if(nkey!=okey){
            okey=okey=='暂无'?'':okey
            chg.chkeyword.push({"nkey":nkey,"okey":okey});
        }
    })

    // 暂无
    var osummary = $("#inp_summary").attr("ovalue");
    var nsummary = $("#inp_summary").val();
    if(osummary!=nsummary){
        osummary=osummary=='暂无'?"":osummary;
        if(!(osummary==""&&nsummary==""))
            chg.summary=nsummary;
    }

    var osource = $("#inp_source").attr("ovalue");
    var nsource = $("#inp_source").val();
    if(osource!=nsource){
        osource=osource=='暂无'?"":osource;
        if(!(osource==""&&nsource==""))
            chg.source=nsource;
    }

    var link = $("#inp_link").val();
    if(!link||link===""){swal("错误!", "链接不能为空!", "error");return false;}
    if(link!=$("#inp_link").attr('ovalue'))chg.link=link;

    chg.chrefNmLk=new Array();
    $("[id^=inp_ref]").each((i,d)=>{
        let nTitle=$($(d).find("input")[0]).val();
        let nLink=$($(d).find("input")[1]).val();
        let oTitle=$($(d).find("input")[0]).attr('ovalue');
        let oLink=$($(d).find("input")[1]).attr('ovalue');
        if(!nTitle||nTitle===""){swal("错误!", "引用标题不能为空!", "error");flag=false;return false;}
        if(!nLink||nLink===""){swal("错误!", "引用链接不能为空!", "error");flag=false;return false;}
        if(nTitle==""||nLink=="")return true;
        if((oLink!=nLink)||(oTitle!=nTitle)){
            oTitle=oTitle=='暂无'?"":oTitle;
            oLink=oLink=='暂无'?"":oLink;
            chg.chrefNmLk.push({"nTitle":nTitle,"oTitle":oTitle,"nLink":nLink,"oLink":oLink});
        }
    })
    if(!flag)return false;
    // return chg;
    return JSON.stringify(chg)
}

$(".card").delegate("#btn_ns","click",function(){
    var chg = getChg();
    if(chg==false)return false;
    $.ajax({
        url:"/db-mgr-update-DB",
        type:"POST",
        data: {"ArtID":$("#ArtID").val(),"chg":chg},
        timeout: 10000,
        success:function(result){
            if(result){
                swal({
                    title: "更新成功!",
                    text: "数据已被更新",
                    icon: "success",
                    button: "继续!",
                }).then(()=>{
                    $("#product>li:nth-child(2)>a>span").click()
                });
            }else{
                swal({
                    title: "更新失败!",
                    text: "请检查是否重复更新!",
                    icon: "error",
                    button: "继续",
                });
            }
        },
        error:function(xrh,err){
            if(err=="timeout"){
                swal({
                    title: "更新超时!",
                    text: "网络连接不太通畅!",
                    icon: "info",
                    button: "继续",
                });
            }
            else{
                swal({
                    title: "更新失败!",
                    text: "请检查是否重复更新!",
                    icon: "error",
                    button: "继续",
                });
            }
        }
    });
})
