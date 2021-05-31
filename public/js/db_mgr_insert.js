$(".add-form-list").delegate("#btn_bk","click",function(){
    $("#product>li:nth-child(2)>a>span").click()
})

$(".add-form-list>.row").delegate("#auis","click",function(){
    $.ajax({
        url:"/db-mgr-insert-spider",
        type:"POST",
        data: {"link": $("#cnkilink").val()},
        timeout: 10000,
        success:function(result){
            if(result){
                $(".add-form-list .row .col-sm-12").empty();
                $(".add-form-list .row .col-sm-12").append($(result));
                swal({
                    title: "爬取成功!",
                    text: "请检查内容是否正确",
                    icon: "success",
                    button: "继续!",
                });
            }else{
                swal({
                    title: "爬取出错!",
                    text: "请检查你的链接是否正确!",
                    icon: "error",
                    button: "继续",
                });
            }
        },
        error:function(xrh,err){
            if(err=="timeout"){
                swal({
                    title: "爬取超时!",
                    text: "网络连接不太通畅!",
                    icon: "info",
                    button: "继续",
                });
            }
            else{
                swal({
                    title: "爬取出错!",
                    text: "请检查你的链接是否正确!",
                    icon: "error",
                    button: "继续",
                });
            }
        }
    });
});

function getArt(){
    var art={};
    art.title = $("#inp_title").val();
    if(!art.title||art.title===""){swal("错误!", "标题不能为空!", "error");return false;}
    art.nopair=new Array();
    $("[id^=inp_nopair]").each((i,d)=>{
        art.nopair.push({"name":$($(d).find("input")[0]).val(),"organize":$($(d).find("input")[1]).val()});
    })
    if(art.nopair.length<=1 && art.nopair[0].name=="暂无" && art.nopair[0].organize=="暂无")
        art.nopair=[]
    art.keyword=new Array();
    $("[id^=inp_keyword]").each((i,d)=>{
        art.keyword.push($(d).val());
    })
    if(art.keyword,length<=1 && art.keyword[0]=='暂无')
        art.keyword=[];
    art.summary = $("#inp_summary").val();
    art.summary = art.summary=='暂无'?"":art.summary;
    art.source = $("#inp_source").val();
    art.source = art.source=='暂无'?"":art.source;
    art.link = $("#inp_link").val();
    if(!art.link||art.link===""){swal("错误!", "链接不能为空!", "error");return false;}
    art.refNmLk=new Array();
    $("[id^=inp_ref]").each((i,d)=>{
        art.refNmLk.push({"Title":$($(d).find("input")[0]).val(),"Link":$($(d).find("input")[1]).val()});
    })
    if(art.refNmLk.length<=1 && art.refNmLk[0].Title=="暂无" && art.refNmLk[0].Link=="暂无")
        art.refNmLk=[]
    return JSON.stringify(art)
}

$(".add-form-list>.row").delegate("#btn_ns","click",function(){
    var art = getArt();
    if(!art)return false;
    $.ajax({
        url:"/db-mgr-insert-DB",
        type:"POST",
        data: {"art":art},
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("PRTK"));  
        },
        timeout: 10000,
        success:function(result){
            if(result){
                swal({
                    title: "添加成功!",
                    text: "数据已被加入数据库",
                    icon: "success",
                    button: "继续!",
                }).then(()=>{$("#product>li:nth-child(2)>a>span").click()});
            }else{
                swal({
                    title: "添加失败!",
                    text: "请检查是否重复添加!",
                    icon: "error",
                    button: "继续",
                });
            }
        },
        error:function(xrh,err){
            if(err=="timeout"){
                swal({
                    title: "爬取超时!",
                    text: "网络连接不太通畅!",
                    icon: "info",
                    button: "继续",
                });
            }
            else{
                swal({
                    title: "爬取出错!",
                    text: "请检查是否重复添加!",
                    icon: "error",
                    button: "继续",
                });
            }
        }
    });
});