$("#search").click(function (e) {
    if(e.preventDefault)e.preventDefault();
    if($("#ipsh").val()==""){
        swal({
            title: "错误!",
            text: "请输入查询内容!",
            icon: "error",
            button: "继续",
        });
    }else{
        window.location.replace("search-cki.html?keywd="+$("#ipsh").val());
    }
    return false;
})