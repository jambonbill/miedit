"use strict"
window.addEventListener("load", function() {

    const emulator = Minitel.startEmulators()[0]
    emulator.setRefresh(1200);//default
    emulator.setRefresh(1200*100);//fast

    window.emulator=()=>emulator;

    let stream = ""
    const cstream = queryParameters("cstream")
    /*
    if(cstream) {
        stream = LZString.decompressFromBase64(
            cstream.replace(new RegExp('\\.', 'g'), '+')
                   .replace(new RegExp('_', 'g'), '/')
                   .replace(new RegExp('-', 'g'), '=')
        )
    } else {
        stream = queryParameters("stream")
    }
    */
    if(stream){

    } else {

        let ms=miniscript().clearScreen().write("READY");
        emulator.send(ms.data);
    }

    //Init Ace editor
    var ls=localStorage;
    //var output;//screen
    var script={};//the script db record
    var editor;
    var langTools;

    function initEditor(){

        console.info('initEditor()');

        editor = ace.edit("editor");
        editor.setTheme("ace/theme/twilight");
        var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
        langTools = ace.require("ace/ext/language_tools");
        editor.session.setMode(new JavaScriptMode());
        //editor.resize();

        editor.setOptions({
            fontSize: "14pt",
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });

        let n=+ls.getItem('fontSize');
        if(n>1&&n<64){
            console.log('setFontSize(n)',n);
            editor.setFontSize(n);
        }

        editor.getSession().setUseWrapMode(true);

        editor.on('change', function() {//onchange
            window.location.hash='';
            let len=editor.session.getValue().length;
        });

        editor.commands.addCommand({
            name: "Run script",
            bindKey: {win: "Ctrl-Return", mac: "Command-Return"},
            exec:(editor)=>{
                //console.warn('scriptRun();');
                runScript();
            }
        });

        editor.commands.addCommand({
            name: "Save script",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec:(editor)=>{
                quicksave();
            }
        });

        editor.commands.addCommand({
            name: "Open script",
            bindKey: {win: "Ctrl-o", mac: "Command-o"},
            exec: function(editor) {
                scriptSelector((scriptId)=>{
                    loadScript(scriptId);
                });
            }
        });

        editor.commands.addCommand({
            name: "Quick Open script",
            bindKey: {win: "Ctrl-p", mac: "Command-p"},
            exec: function(editor) {
                scriptSelector((scriptId)=>{
                    loadScript(scriptId);
                });
            }
        });




        editor.commands.addCommand({
            name: "Save script as",
            bindKey: {win: "Ctrl-Shift-S", mac: "Command-Shift-S"},
            exec:(editor)=>{
                //console.warn('scriptSaveAs()');
                popSaveAs();
            }
        });

        editor.commands.addCommand({
            name: "New script",
            //bindKey: {win: "Ctrl-N", mac: "Command-Option-N"},
            bindKey: {win: "F2", mac: "F2"},
            exec: function(editor) {
                //alert("lol (TODO)");
                popNew();
            }
        });

        editor.getSession().setValue('()=>{};');
        let data=ls.getItem('miniscript');
        if(data){
            editor.getSession().setValue(data);
        }
    }


    initEditor();


    function quicksave(){
        console.log("quicksave");
        var data=editor.getSession().getValue();
        ls.setItem("miniscript",data);
    }

    function runScript(){
        console.log('runScript()');
        var data=editor.getSession().getValue();
        try{
            eval("let _x="+data+";if(typeof(_x)=='function');_x(emulator);");//i hope i'm not going to hell for this
            //eval(data);
        }
        catch(e){
            console.error("scriptRun error", e);
            //console.log(e.name,e.message);
        }
    }
});
