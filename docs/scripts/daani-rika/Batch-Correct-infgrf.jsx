
/*
Code for Import https://scriptui.joonas.me — (Triple click to select): 
{"activeId":14,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"ChartEdit","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"ChartEdit","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"EditText","parentId":0,"style":{"enabled":true,"varName":"et","creationProps":{"noecho":false,"readonly":false,"multiline":true,"scrollable":true,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"fdgd","justify":"left","preferredSize":[209,300],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"RadioButton","parentId":14,"style":{"enabled":true,"varName":"BarChart","text":"Bar chart","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-4":{"id":4,"type":"RadioButton","parentId":14,"style":{"enabled":true,"varName":"LineWidth","text":"Line width","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-5":{"id":5,"type":"RadioButton","parentId":14,"style":{"enabled":true,"varName":"Area","text":"Area","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-6":{"id":6,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-8":{"id":8,"type":"RadioButton","parentId":15,"style":{"enabled":true,"varName":"Horizontal","text":"Top to bottom","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-9":{"id":9,"type":"RadioButton","parentId":15,"style":{"enabled":true,"varName":"Vertical","text":"Left to right","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-10":{"id":10,"type":"Checkbox","parentId":15,"style":{"enabled":true,"varName":"sortReverse","text":"Reverse order","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-11":{"id":11,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[200,0],"margins":0,"orientation":"row","spacing":15,"alignChildren":["center","center"],"alignment":null}},"item-12":{"id":12,"type":"Button","parentId":11,"style":{"enabled":true,"varName":"btn_ok","text":"OK","justify":"center","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"Button","parentId":11,"style":{"enabled":true,"varName":"btn_cancel","text":"Cancel","justify":"center","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-14":{"id":14,"type":"Panel","parentId":6,"style":{"enabled":true,"varName":"ChartType","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Chart type","preferredSize":[0,0],"margins":[13,2,6,2],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-15":{"id":15,"type":"Panel","parentId":6,"style":{"enabled":true,"varName":"Sorting","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Sort","preferredSize":[0,0],"margins":[13,2,6,2],"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}}},"order":[0,1,6,14,3,4,5,15,8,9,10,11,12,13],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
*/ 


// - settings -------------
// return code alternative character(s) used while editting
var return_code_alt = "@/";

// return code that used in regexp (escape the characters if it needs)
var return_code_alt_for_rex = return_code_alt;

// edittext size
var edittext_width = 200;
var edittext_height = 300;

var erorr = null;

// - settings end -------------



// CHARTEDIT
// =========
var ChartEdit = new Window("dialog"); 
    ChartEdit.text = "ChartEdit"; 
    ChartEdit.orientation = "column"; 
    ChartEdit.alignChildren = ["fill","top"]; 
    ChartEdit.spacing = 10; 
    ChartEdit.margins = 16; 

    

// GROUP1
// ======
var group1 = ChartEdit.add("group", undefined, {name: "group1"}); 
    group1.orientation = "row"; 
    group1.alignChildren = ["left","top"]; 
    group1.spacing = 10; 
    group1.margins = 0; 

// CHARTTYPE
// =========
var ChartType = group1.add("panel", undefined, undefined, {name: "ChartType"}); 
    ChartType.text = "Chart type"; 
    ChartType.orientation = "column"; 
    ChartType.alignChildren = ["left","top"]; 
    ChartType.spacing = 10; 
    ChartType.margins = [2,13,2,6]; 

var BarChart = ChartType.add("radiobutton", undefined, undefined, {name: "BarChart"}); 
    BarChart.text = "Bar chart"; 
    BarChart.value = true; 

var LineWidth = ChartType.add("radiobutton", undefined, undefined, {name: "LineWidth"}); 
    LineWidth.text = "Line width"; 

var Area = ChartType.add("radiobutton", undefined, undefined, {name: "Area"}); 
    Area.text = "Area"; 

// SORTING
// =======
var Sorting = group1.add("panel", undefined, undefined, {name: "Sorting"}); 
    Sorting.text = "Sort"; 
    Sorting.orientation = "column"; 
    Sorting.alignChildren = ["left","top"]; 
    Sorting.spacing = 10; 
    Sorting.margins = [2,13,2,6]; 

var Horizontal = Sorting.add("radiobutton", undefined, undefined, {name: "Horizontal"}); 
    Horizontal.text = "Horizontal"; 

var Vertical = Sorting.add("radiobutton", undefined, undefined, {name: "Vertical"}); 
    Vertical.text = "Vertical"; 




function sortCheckboxes(__reverse) {
    tfs = tfsSort;
    PthItm = PthItmSort;
    sortTopToBottom(tfs);
    if (sortReverse.value) {
        tfs.reverse();
        PthItm.reverse();
    }
    getConts();
    et.text = conts.join("\n");
    ChartEdit.update();
}

Horizontal.onClick = function() {
    sortTopToBottom(tfs);
    sortTopToBottom(PthItm);
    getConts();
    et.text = conts.join("\n");
    ChartEdit.update();
}

Vertical.onClick = function() {
    sortLeftToRight(tfs);
    sortLeftToRight(PthItm);
    getConts();
    et.text = conts.join("\n");
    ChartEdit.update();
}



// GROUP2
// ======
var group2 = ChartEdit.add("group", undefined, {name: "group2"}); 
    group2.orientation = "row"; 
    group2.alignChildren = ["left","center"]; 
    group2.spacing = 10; 
    group2.margins = 0; 
    group2.alignment = ["left","top"]; 

var MoveText = group2.add("checkbox", undefined, undefined, {name: "MoveText"}); 
    MoveText.text = "Move text"; 
    MoveText.value=true;
    

LineWidth.onClick=function() { MoveText.enabled = false};
Area.onClick=function() { MoveText.enabled = false};
BarChart.onClick=function() { MoveText.enabled = true};

var sortReverse = group2.add("checkbox", undefined, undefined, {name: "sortReverse"}); 
    sortReverse.text = "Reverse order"; 


///sorting 
sortReverse.onClick = function() {
    tfs.reverse();
    PthItm.reverse();
    getConts();
    et.text = conts.join("\n");
    ChartEdit.update();
};




var et = ChartEdit.add('edittext {properties: {name: "et", multiline: true, scrollable: true}}'); 
    et.text = ""; 
    et.preferredSize.width = 209; 
    et.preferredSize.height = 200;  
    


// GET TEXT

var tfs = [],
    tfsSort = [],
    tfsOriginal = []; // textframes
extractTextFramesAsVTextFrameItem(app.activeDocument.selection, tfs, tfsOriginal, tfsSort);

if (tfs.length < 1) {
    erorr = "Please select textframes";
}

var PthItm = [],
        PthItmSort = [],
        PthItmOriginal = []; // textframes
        extractPthItms(app.activeDocument.selection, PthItm, PthItmOriginal, PthItmSort);

// sort
sortTopToBottom(PthItm);
sortTopToBottom(tfs);
Horizontal.value = true; 

if (PthItm.length!=tfs.length){
    erorr = "Please, select the same number of objects and captions. There should be no groups";
} else {
if (tfs[0].left<PthItm[0].left){
    MoveText.value=false;
    }



if (tfs[0].top>PthItm[0].top){
    sortLeftToRight(PthItm);
    sortLeftToRight(tfs);
    Vertical.value = true;
    MoveText.value=true;
}
}


// get the contents of tfs
var conts = []

function getConts() {
    conts = [];
    var rex_return_code = new RegExp("\r", "g");
    for (var i = 0; i < tfs.length; i++) {
        conts.push(tfs[i].tf.contents.replace(
            rex_return_code, return_code_alt));
    }
}

getConts();


et.text = conts.join("\n");
et.active = true;

var find = '\\d+(?:[,.]\\d+)?(?: \\d+(?:[,.]\\d+)?)*';
var Numtest = et.text.match(find, 'g') ;
    if(Numtest == null || Numtest.length != tfs.length ){
 erorr= "Please select marks and corresponding numbers";
    }


// GROUP3
// ======
var group3 = ChartEdit.add("group", undefined, {name: "group2"}); 
    group3.preferredSize.width = 200; 
    group3.orientation = "row"; 
    group3.alignChildren = ["center","center"]; 
    group3.spacing = 15; 
    group3.margins = 0; 

var btn_ok = group3.add("button", undefined, undefined, {name: "btn_ok"}); 
    btn_ok.text = "OK"; 
    btn_ok.preferredSize.width = 80; 

var btn_cancel = group3.add("button", undefined, undefined, {name: "btn_cancel"}); 
    btn_cancel.text = "Cancel"; 
    btn_cancel.preferredSize.width = 80; 



///ACTION
    btn_ok.onClick = function() {
        var OldNumbers = [];
        var Numbers =[];

        Numbers = et.text.split("\n"), new RegExp(return_code_alt_for_rex, "g")
        var Numtest2 = et.text.match(find, 'g');
        if ( Numtest2 == null || Numtest2.length != Numbers.length || Numtest2.length != PthItm.length ){
            ChartEdit.close();
            alert ("Please, enter only numbers. There should be as many numbers as paths selected");
            
             return;
        }
        

        for (a=0; a<app.activeDocument.selection.length / 2; a++){
            if  (Numbers[a]){
            Numbers[a] = Numbers[a].replace(new RegExp(",", 'g'), ".");
            Numbers[a] = Numbers[a].replace(new RegExp(" ", 'g'), "");

            OldNumbers[a] = tfs[a].tf.contents.replace(new RegExp(",", 'g'), ".");
            OldNumbers[a] = OldNumbers[a].replace(new RegExp(" ", 'g'), "");
        }    

    }
    

            var CoefVert = PthItm[0].height / OldNumbers[0];
            var CoefHor = PthItm[0].width / OldNumbers[0];
            var CoefLine = PthItm[0].strokeWidth / OldNumbers[0];
            var CoefArea = PthItm[0].width / Math.sqrt(OldNumbers[0]);
    
        if (BarChart.value){

          //  if (PthItm[i].closed == true )
            try {
            if (Horizontal.value) {     
            
                for (i = 0; i < app.activeDocument.selection.length / 2; i++) {
                   
                    PthItm[i].width = Numbers[i] * CoefHor;                    
                    if(MoveText.value){
                        tfs[i].tf.position= [                         
                           tfs[i].tf.position[0]- OldNumbers[i]*CoefHor + Numbers[i]*CoefHor,
                           tfs[i].tf.position[1]
                        ];   
                    }
                
                }
            


            } else {
                for (i = 0; i < app.activeDocument.selection.length / 2; i++) {
                    var Pos = PthItm[i].position[1] - PthItm[i].height + Numbers[i] * CoefVert;
                    PthItm[i].height = Numbers[i] * CoefVert;
                    PthItm[i].position = [PthItm[i].position[0], Pos];

                    if(MoveText.value){
                        tfs[i].tf.position= [
                           tfs[i].tf.position[0],
                           tfs[i].tf.position[1]- OldNumbers[i]* CoefVert + Numbers[i]* CoefVert
                        ];   
                    }
                }
            }
            
        } catch (e)
        {
            alert ("Please, select closed paths or try `Line width` option");
        }
        


         } else if (LineWidth.value) {
             
             if (PthItm[0].stroked == true ){

                for (i = 0; i < app.activeDocument.selection.length / 2; i++) {
                    PthItm[i].strokeWidth = Numbers[i] * CoefLine;
                }
            } else {
                alert ("Please, select lines");
            }
        
        } else if (Area.value) {
            for (i = 0; i < app.activeDocument.selection.length / 2; i++) {
                PthItm[i].width = Math.sqrt(Numbers[i]) * CoefArea;
                PthItm[i].height = PthItm[i].width;
            }
        }

        replaceContents(tfs, et.text.split("\n"), new RegExp(return_code_alt_for_rex, "g"));
         
    
        ChartEdit.close()
    };
 
    if (erorr != null){
        alert (erorr);        
 } else {       
ChartEdit.show();
   }   




///////////////////////////////////////////

// --------------------------------------------------
function vTextFrameItem(tf) {
    // virtual textframe for comparing the each position
    this.tf = tf;
    if (tf.kind == TextType.POINTTEXT) {
        this.left = tf.left;
        this.top = tf.top;
    } else {
        var tp = tf.textPath;
        this.left = tp.left;
        this.top = tp.top;
    }
}
// --------------------------------------------------
function replaceContents(tfs, et_texts, rex_return_code_alt) {
    while (et_texts[et_texts.length - 1] == "") et_texts.pop();

    for (var i = 0; i < tfs.length; i++) {
        if (i >= et_texts.length) break;

        tfs[i].tf.contents = et_texts[i].replace(rex_return_code_alt, "\r");
    }
}

// --------------------------------------------------
function extractPthItms(s, r, _r, __r) {
    // s is an array of pageitems ( ex. selection )
    for (var i = 0; i < s.length; i++) {
        if (s[i].typename === "PathItem") {
            r.push(s[i]);
            _r.push(s[i]);
            __r.push(s[i]);
        }
    }
}

// --------------------------------------------------
function sortLeftToRight(tfs) {

    var rect = [];
    // reft, top, right, bottom
    getVTextFramesRect(tfs, rect);
    tfs.sort(function(a, b) {
        return a.left == b.left ?
            b.top - a.top :
            a.left - b.left
    });

}
// --------------------------------------------------
function sortTopToBottom(tfs) {

    var rect = [];
    // reft, top, right, bottom
    getVTextFramesRect(tfs, rect);

    // top -> down || left -> right
    tfs.sort(function(a, b) {
        return a.top == b.top ?
            a.left - b.left :
            b.top - a.top
    });

}
// --------------------------------------------------
function getVTextFramesRect(tfs, rect) {
    // get the rect that includes each top-left corner of tfs
    var top, left;

    for (var i = 0; i < tfs.length; i++) {
        top = tfs[i].top;
        left = tfs[i].left;

        if (i == 0) {
            // reft, top, right, bottom
            rect.push(left);
            rect.push(top);
            rect.push(left);
            rect.push(top);
        } else {
            rect[0] = Math.min(rect[0], left);
            rect[1] = Math.max(rect[1], top);
            rect[2] = Math.max(rect[2], left);
            rect[3] = Math.min(rect[3], top);
        }
    }
}
// --------------------------------------------------
function extractTextFramesAsVTextFrameItem(s, r, _r, __r) {
    // s is an array of pageitems ( ex. selection )
    for (var i = 0; i < s.length; i++) {
        if (s[i].typename === "TextFrame") {
            r.push(new vTextFrameItem(s[i]));
            _r.push(new vTextFrameItem(s[i]));
            __r.push(new vTextFrameItem(s[i]));
        } else if (s[i].typename == "GroupItem") {
            extractTextFramesAsVTextFrameItem(s[i].pageItems, r, _r, __r);
        }
    }
}