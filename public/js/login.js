$("#btn_submit").click((eve)=>{
    var username = $("#usn").val();
    var passwd = $("#pwd").val();
    if(username==""||passwd==""){
        swal({
            title: "错误!",
            text: "用户名密码不得为空",
            icon: "error",
            button: "继续!",
        });
        return false;
    }
    $.ajax({
        url:"/login-tk",
        type:"POST",
        data: {"username":username,passwd:passwd},
        timeout: 10000,
        success:function(result){
            if(result){
                swal({
                    title: "成功!",
                    text: "登录成功",
                    icon: "success",
                    button: "继续!",
                }).then(()=>{
                    localStorage.setItem("PRTK", result);
                    location.replace("/index.html")});
            }else{
                swal({
                    title: "登录失败!",
                    text: "用户名或密码错误!",
                    icon: "error",
                    button: "继续",
                });
            }
        },
        error:function(xrh,err){
            if(err=="timeout"){
                swal({
                    title: "登录超时!",
                    text: "网络连接不太通畅!",
                    icon: "info",
                    button: "继续",
                });
            }
            else{
                swal({
                    title: "登录失败!",
                    text: "用户名或密码错误!",
                    icon: "error",
                    button: "继续",
                });
            }
        }
    });
})