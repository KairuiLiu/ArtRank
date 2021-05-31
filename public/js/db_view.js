$(".row").delegate("#Sort","click",function(e){
    if(e.preventDefault)e.preventDefault();
    var idList=[];
    $(":checkbox:checked").each((i,d)=>{
        idList.push($(d).attr("id").replaceAll("checkbox",""))
    })
    if(idList.length<=0){
        swal({
            title: "错误!",
            text: "排序需要至少一篇文章",
            icon: "error",
            button: "继续!",
        })
    }else{
        window.location.replace("/search-res?ndlst="+JSON.stringify(idList))
    }
    return false;
})