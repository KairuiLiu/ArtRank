$("[id^=delArt]").click(function (eve) {
    var artID = eve.currentTarget.id;
    
    $.ajax({
        url:"/delete-row",
        type:"POST",
        data: {
            // "UserTK": localStorage.getItem("PRTK"),
            "artID": artID.split("_")[1]
        },
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("PRTK"));  
        },
        timeout: 10000,
        success:function(result){
            if(result){
                swal({
                    title: "删除成功!",
                    text: "数据已从数据库中删除",
                    icon: "success",
                    button: "继续!",
                }).then(() => {
                    location.reload();
                });
            }else{
                swal({
                    title: "添加失败!",
                    text: "请检查是否重复删除!",
                    icon: "error",
                    button: "继续",
                }).then(() => {
                    location.reload();
                });
            }
        },
        error:function(xrh,err){
            if(err=="timeout"){
                swal({
                    title: "删除超时!",
                    text: "网络连接不太通畅!",
                    icon: "info",
                    button: "继续",
                }).then(() => {
                    location.reload();
                });
            }
            else{
                swal({
                    title: "删除出错!",
                    text: "请检查是否重复删除!",
                    icon: "error",
                    button: "继续",
                }).then(() => {
                    location.reload();
                });
            }
        }
    });
});
