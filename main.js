var MAP=document.getElementById("map");
const SCREEN=document.getElementById("screen");
const PIXEL=document.getElementById("pixPerFt");
const DELETE_BUTTON=document.getElementById("delete");
var NAVIGATE_SPEED=10;
var PIXEL_PER_FT=1;
var SELECTED_ITEMS={};
const UniqueIDGenerator=function(){
  var usedIDs={};
  function getID(){
    var id=Math.floor((Math.random() * 999999) + 111111);
    if(usedIDs[id]==null){
      usedIDs[id]=id;
      return id;
    }
    return getID();
  }
  this.generate=function(){
    return getID();
  }
}
const ID_GEN= new UniqueIDGenerator();
Item= function(name, width, height,desc){
  this.name=name;
  this.height=height;
  this.width=width;
  this.desc=desc;
  this.isSelected=false;
  this.id=ID_GEN.generate();
  this.domElement=document.createElement("DIV");
  this.domElement.innerHTML=name;
  this.domElement.className="item";
  this.domElement.style.width=width*PIXEL_PER_FT+"px";
  this.domElement.style.height=height*PIXEL_PER_FT+"px";
  this.domElement.onmousedown=(e)=>{
    if(e.which==2){
      this.isSelected=!this.isSelected;
      if(this.isSelected){
        delete SELECTED_ITEMS[this.id];
        this.domElement.style.border="1px solid black";
        DELETE_BUTTON.disabled=false;
      }else{
        SELECTED_ITEMS[this.id]=this;
        this.domElement.style.border="2px solid green";
        DELETE_BUTTON.disabled=true;
      }
    }
  }
  setDraggable(this.domElement);
  MAP.appendChild(this.domElement);
}

function setDraggable(el) {
  var pos1 = 10, pos2 = 10, pos3 = 10, pos4 = 10;
  el.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    if(e.which==0){
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDrag;
      document.onmousemove = elDrag;
    }
  }
  function elDrag(e) {
    //if(el.offsetTop>0 && el.offsetLeft>0 &&
      //el.offsetTop+el.height<=MAP.height && el.offsetLeft+el.width<=MAP.width){
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
    //}
  }
  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

document.onkeydown = function(event){
  switch(event.keyCode){
    case 87:
      MAP.style.top=MAP.offsetTop-NAVIGATE_SPEED +"px";
      break;
    case 65:
      MAP.style.left=MAP.offsetLeft-NAVIGATE_SPEED +"px";
      break;
    case 83:
      MAP.style.top=MAP.offsetTop+NAVIGATE_SPEED +"px";
      break;
    case 68:
      MAP.style.left=MAP.offsetLeft+NAVIGATE_SPEED + "px";
  }
}

function closePrompt(id){
  document.getElementById(id).hidden=true;
  SCREEN.hidden=true;
}

function saveMap(parent){
  var name=parent.children[0].value;
  localStorage.setItem(name, MAP);
}

function addItem(parent){
  var children=parent.children;
  var name=children[0].value;
  var width=children[1].value;
  var height=children[2].value;
  var desc=children[3].value;
  new Item(name,width,height,desc);
  closePrompt(parent.id);
}

function assignSave(el, saveData){
  el.onclick=function(){
    MAP.innerHTML="";
    MAP.appendChild(saveData.children);
  }
}

function loadSave(parent){
  if(localStorage.length>0){
    parent.innerHTML="";
    for(var i=0; i<localStorage.length; i++){
      var el=document.createElement("DIV");
      var key=localStorage.key(i);
      el.innerHTML=key;
      assignSave(el, localStorage.getItem(key));
      parent.appendChild()
    }
    var cancel=document.createElement("BUTTON");
    cancel.innerHTML="Cancel";
  }else{
    parent.innerHTML="No saves currently";
  }
}

function displayPrompt(id){
  switch(id){
    case "add":
      document.getElementById("addItemPrompt").hidden=false;
      break;
    case "save":
      document.getElementById("savePrompt").hidden=false;
      break;
    case "loadSave":
      var prompt=document.getElementById("loadSavePrompt");
      prompt.hidden=false;
      loadSave(prompt);
      break;
  }
  SCREEN.hidden=false;
}

function extractDimension(el){
 var width=parseInt(el.style.width.split("px")[0]);
 var height=parseInt(el.style.width.split("px")[0]);
 return {width:width, height:height};
}

function modScale(isAdd){
  var el=document.getElementById("pixPerFt");
  var oldScale=PIXEL_PER_FT;
  PIXEL_PER_FT+=(isAdd)?1:-1;
  PIXEL.innerHTML=PIXEL_PER_FT;
  var mapDim=extractDimension(MAP);
  MAP.style.width=(mapDim.width/oldScale)*PIXEL_PER_FT+"px";
  MAP.style.height=(mapDim.height/oldScale)*PIXEL_PER_FT+"px";
  var children=MAP.children;
  for(var i=0;i<children.length; i++){
    var child=children[i];
    var childDim=extractDimension(child);
    child.style.width=(child.width/oldScale)*PIXEL_PER_FT+"px";
    child.style.height=(child.height/oldScale)*PIXEL_PER_FT+"px";
  }
}

function initialize(parent){
  var children=parent.children;
  var baseWidth=children[0].value;
  var baseHeight=children[1].value;
  var scaling=children[2].value;
  PIXEL.innerHTML=scaling;
  PIXEL_PER_FT=parseInt(scaling);
  MAP.style.width=(parseInt(baseWidth)*PIXEL_PER_FT)+"px";
  MAP.style.height=(parseInt(baseHeight)*PIXEL_PER_FT)+"px";
  closePrompt(parent.id);
  document.getElementById("editor").hidden=false;
}
