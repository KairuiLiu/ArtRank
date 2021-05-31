var simplify=function(){
    var t = document.querySelector("#DataTables_Table_0_length > label");
    t.style.fontSize="0px";
    var t = document.querySelector("#DataTables_Table_0_length > label > select");
    t.style.fontSize="16px";

    var t = document.querySelector("#DataTables_Table_0_filter > label");
    t.style.fontSize="0px";
    var t = document.querySelector("#DataTables_Table_0_filter > label > input");
    t.style.fontSize="16px";

    
    t = $("#DataTables_Table_0_info");
    t.html(t.html()
        .replaceAll("Showing","当前为")
        .replaceAll("to","到")
        .replaceAll("of","条，共")
        .replaceAll("entries","条")
    )

    $("#DataTables_Table_0_previous").text("上一页")
    $("#DataTables_Table_0_next").text("下一页")
}

setInterval(simplify,1000)