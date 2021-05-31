$("#product a").click((e)=>{
    if(localStorage.getItem("PRTK")===null){
        if(e.preventDefault)e.preventDefault();
        var obj = e.currentTarget;
        swal({
            title: "错误!",
            text: "您需要先登录才可以访问数据库",
            icon: "error",
            button: "登录!",
        }).then(()=>{location.replace("/login.html")});
        return false;
    }else{
        // url=$(obj).attr("href")+"?uid="+localStorage.getItem("PRTK");
        // $(obj).attr("href",url)
        // window.location.replace(url);
        return true;
    }
})

// 提高500

function logout(){
    localStorage.removeItem("PRTK");
    $("#iq-sidebar-toggle a")[0].click();
    return false;
}

function checkLogState(){
    if(localStorage.getItem("PRTK")===null)return;

    $.ajax({
        url:"/is-login",
        type:"POST",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("PRTK"));  
        },
        timeout: 10000,
        success:function(result){
            if(result){
                $("#lgbtn").find("i").attr("class","lar la-user mr-2")
                $("#lgbtn").find("span").text(result)
                $("#lgbtn").click(logout);
                $("#product a").each((i,d)=>{
                    url=$(d).attr("href")+"?uid="+localStorage.getItem("PRTK");
                    $(d).attr("href",url);
                })
            }else{
                localStorage.removeItem("PRTK");
            }
        },
        error:function(xrh,err){
            localStorage.removeItem("PRTK");
        }
    });
}

window.onload=function(){
    checkLogState();
}