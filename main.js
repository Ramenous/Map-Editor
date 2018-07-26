var MAP=document.getElementById("map");
const SCREEN=document.getElementById("screen");
var NAVIGATE_SPEED=10;
var PIXEL_PER_FT=1;
Item= function(name, width, height,desc){
  this.name=name;
  this.height=height;
  this.width=width;
  this.desc=desc;
  this.domElement=document.createElement("DIV");
  this.domElement.innerHTML=name;
  this.domElement.className="item";
  this.domElement.style.width=width*PIXEL_PER_FT+"px";
  this.domElement.style.height=height*PIXEL_PER_FT+"px";
  setDraggable(this.domElement);
  MAP.appendChild(this.domElement);
}

function setDraggable(el) {
  var pos1 = 10, pos2 = 10, pos3 = 10, pos4 = 10;
  el.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = elDrag;
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

function displayPrompt(id){
  switch(id){
    case "add":
      document.getElementById("addItemPrompt").hidden=false;
      break;
  }
  SCREEN.hidden=false;
}

function closePrompt(id){
  document.getElementById(id).hidden=true;
  SCREEN.hidden=true;
}

function saveMap(){
  localStorage.setItem("map", MAP);
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

function initialize(parent){
  var children=parent.children;
  var baseWidth=children[0].value;
  var baseHeight=children[1].value;
  var scaling=children[2].value;
  PIXEL_PER_FT=parseInt(scaling);
  MAP.style.width=(parseInt(baseWidth)*PIXEL_PER_FT)+"px";
  MAP.style.height=(parseInt(baseHeight)*PIXEL_PER_FT)+"px";
  closePrompt(parent.id);
}
