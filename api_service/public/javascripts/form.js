
$(document).ready(function(){

    $("#success_alert").alert();
    window.setTimeout(function() { $("#success_alert").alert('close'); }, 5000);
    $("#error_alert").alert();
    window.setTimeout(function() { $("#error_alert").alert('close'); }, 5000);
/*
    $("#scan").submit(function(event){
        event.preventDefault(); 
        var post_url = $(this).attr("action"); 
        var request_method = $(this).attr("method");    
        $.ajax({
            url: post_url,
            type: request_method,
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify({
                url: document.getElementById("url").value,
            }),
            success: function(data) {
                console.log("executed here");
                window.location.replace("/");    
            },
            error: function (msg) {
                location.reload();
            },
        });
    });

    $("#addnode").submit(function(event){
        event.preventDefault(); 
        var post_url = $(this).attr("action"); 
        var request_method = $(this).attr("method");    
        $.ajax({
            url: post_url,
            type: request_method,
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify({
                host: document.getElementById("host").value,
                port: document.getElementById("port").value
            }),
            success: function(data) {
                window.location.replace("/");    
            },
            error: function (msg) {
                location.reload();
            },
        });
    });*/
});