$(function(){
    init();
    function init(){

        $("webview").on('dom-ready', () => {
            // var webList=$("webview");
            // for(var i=0;i< webList.length;i++){
            //     webList[i].openDevTools();
            // }
          })

        //调用后台执行最大最小 系统菜单系统事件
        $("[title='关闭']").click(function(){
            // var webList=$("webview");
            // for(var i=0;i< webList.length;i++){
            //     webList[i].setAudioMuted(true);
            // }
            formBtn('closeForm');
        });
        $("[title='最大化']").click(function(){
            var title=$(this).attr("title");
            if(title=="最大化"){
                $(this).attr("title","窗口化");
                $(this).css({"background":"url('../../../app/images/mainframe_icon.png') -75px  -123px","-webkit-app-region":"no-drag"});
                formBtn('maxForm');
            }else{
                for(var i=0;i< webList.length;i++){
                    webList[i].setAudioMuted(false);
                }
                $(this).attr("title","最大化");
                $(this).css({"background":"url('../../../app/images/mainframe_icon.png') 0px -20px","-webkit-app-region":"no-drag"});
                formBtn('restoreForm');
            }
        });
        //最大窗口化鼠标访问改变图片
        $("[title='最大化']").mouseenter(function () { 
            var title=$(this).attr("title");
            if(title=="最大化"){
                $(this).css({"background":"url('../../../app/images/mainframe_icon.png') -23px -20px","-webkit-app-region":"no-drag"});
            }else{
                var webList=$("webview");
                $(this).css({"background":"url('../../../app/images/mainframe_icon.png') -96px  -123px","-webkit-app-region":"no-drag"});
            }
        });
        $("[title='最大化']").mouseleave(function () { 
            var title=$(this).attr("title");
            if(title=="最大化"){
                $(this).css("background","url('../../../app/images/mainframe_icon.png') 0px -20px");
            }else{
                $(this).css("background","url('../../../app/images/mainframe_icon.png') -75px  -123px");
            }
        });

        $("[title='最小化']").click(function(){
           
            formBtn('minForm');
        });
    }
    
    
    function formBtn(click){
        var currwin = require('electron').remote.getCurrentWindow();
        initW=1280,initH=830;
        
        switch(click){
            case "menuForm":
            break;
            case "restoreForm":     currwin.unmaximize();            break;
            case "maxForm":         currwin.maximize();              break;
            case "minForm":         currwin.minimize();              break;
            case "closeForm":       currwin.close();                 break;
            case "goBack":          currwin.webContents.goBack();    break;

        }
    }

    $(".refresh").click(function(){
        var url=$("#searchBox").val();
        if($(".tab").length<=0){
            addWebView(url);
            $("#searchBox").val(url);
            return;
        }
        $("webview.selected").attr("src",url);
    });

    addWebView("http://www.baidu.com");


    keyDown($("#searchBox")[0],function(){
        var url=$("#searchBox").val();
        url=url.indexOf("http")>=0?url:"http://"+url.replace(/^[^0-9a-zA-Z][//]{2}/g,"//");
        $("#searchBox").val(url);
        $("webview.selected").attr("src",url);
    });

});

function setUrl(url){
    $("webview:last").attr("src",url);
    $("#searchBox").val(url);

    webOpenToForm("webview",function(url){
        $("webview:last").attr("src",url);
        $("#searchBox").val(url);
    });
}

//中部左侧菜单点击改变背景色
$(".e-c-left>div").click(function(){
    if($(this).attr("class").indexOf("e-c-l-toolbar")<0){
        $(".e-c-left>div").removeClass("e-c-left-hover");
        $(this).addClass("e-c-left-hover");
    }
    var href=$(this).attr("href");
    $("#frame").attr("src",href);
});



var ipcRenderer = require('electron').ipcRenderer;
		
ipcRenderer.on('setUrl', (event,url)=>{
    addWebView(url);
});

function addWebView(url){
    if($(".tab").length>=8){
        alert("标签已超出最大数量限制");
        return;
    }
    $("webview").hide();
    $(".tab").removeClass("tab-selected");
    $("webview").removeClass("selected");
    var guid=new Date().getTime();
    var web='<webview class="frame selected" id="'+guid+'" src="'+url+'" plugins></webview>';
    var tab='<div class="tab float tab-selected"  id="tab_'+guid+'" href="'+url+'"> <div><span onclick="checkDiv(this,\''+guid+'\')" >正在加载...</span><span type="on" class="voice"><i  onclick="voiceChange(this,\''+guid+'\')"  class="fa fa-volume-up"></i></span><span class="close-tab"></span><i  onclick="closeTab(\''+guid+'\')" class="fa fa-close"></i></div></div>';
    $("webview:not(.selected)").hide();
    $("#webList").append(web);
    $("#tabList").append(tab);
    $("#"+guid).show();
    //var webview = document.getElementById(guid);

    $("#"+guid).on('dom-ready', () => {
        //debugger;
        var title=$("#"+guid)[0].getTitle();
        $("#tab_"+guid).attr("title",title);
        $("#tab_"+guid).find("span:eq(0)").text(title.substring(0,6)+"...");
        var url=$("#"+guid)[0].getURL()
    })

    $("#searchBox").val(url);
    webOpenToForm("#"+guid,function(url){
        addWebView(url);
    });

    closeTab=function(guid){
        var selectedId=$(".tab-selected").attr("id");
        $("#"+guid).remove();
        $("#tab_"+guid).remove();
        if(selectedId=="tab_"+guid){
            $(".tab:last").find("span:eq(0)").click();
        }else{
            $("#"+selectedId).find("span:eq(0)").click();
        }
        
    }

    checkDiv=function(doc,guid){
        guid=guid.replace("tab_","");
        $("webview:not(#"+guid.replace("tab_","")+")").hide();
        $(".tab").removeClass("tab-selected");
        $("webview").removeClass("selected");
        $("#"+guid).addClass("selected").show();
        $("#tab_"+guid).addClass("tab-selected").show();
        var src=$("#"+guid).attr("src");
        $("#searchBox").val(src);
    }

    voiceChange=function(doc,guid){
        var type= $(doc).parent().attr("type");
        var webView=function(id){return document.getElementById(id);};
        if(type=="on"){//关闭
            webView(guid).setAudioMuted(true);
            $(doc).removeClass("fa fa-volume-up");
            $(doc).addClass("fa fa-volume-off");
            $(doc).parent().attr("type","off");
        }else{//打开
            webView(guid).setAudioMuted(false);
            $(doc).removeClass("fa fa-volume-off");
            $(doc).addClass("fa fa-volume-up");
            $(doc).parent().attr("type","on");
        }
    }

}

function keyDown(docs,callback) {
    docs.onkeydown = function(e) {
        if (!e) e = window.event; //火狐中是 window.event
        if ((e.keyCode || e.which) == 13) {
            if (typeof callback == "function") {
                callback();
            }
        }
    }
}