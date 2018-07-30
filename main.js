var MAP=document.getElementById("map");
const SCREEN=document.getElementById("screen");
const PIXEL=document.getElementById("pixPerFt");
const SPEED=document.getElementById("speedAmt");
const ITEM_ID=document.getElementById("itemID");
const ITEM_LIST=document.getElementById("itemList");
const DELETE_BUTTON=document.getElementById("delete");
const INFO_BOX=document.getElementById("infoBox");
const INFO_FIELDS=document.getElementById("infoFields");
var NAVIGATE_SPEED=10;
var PIXEL_PER_FT=1;
var SELECTED_ITEMS={};
var SHOW_ITEM_LIST=false;
var SHOW_INFO_FIELDS=true;
var ITEMS={};
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

function createItemEl(name,id,width,height,x,y){
  var el=document.createElement("DIV");
  el.className="item";
  el.id=id;
  el.style.width=width*PIXEL_PER_FT+"px";
  el.style.height=height*PIXEL_PER_FT+"px";
  el.style.top=x+"px";
  el.style.left=y+"px";
  var nameEl=document.createElement("DIV");
  nameEl.innerHTML=name;
  nameEl.style.display="table-cell";
  nameEl.style.verticalAlign="middle";
  var widthEl=document.createElement("DIV");
  widthEl.style.top="0px";
  widthEl.style.left=(width*PIXEL_PER_FT)/2+"px";
  widthEl.style.position="absolute";
  widthEl.innerHTML=width+"ft";
  var heightEl=document.createElement("DIV");
  heightEl.style.left="0px";
  heightEl.style.top=(height*PIXEL_PER_FT)/2+"px";
  heightEl.style.position="absolute";
  heightEl.innerHTML=height+"ft";
  el.appendChild(nameEl);
  el.appendChild(widthEl);
  el.appendChild(heightEl);
  return el;
}

Item= function(name, width, height,desc,x,y){
  this.name=name;
  this.height=parseInt(height);
  this.width=parseInt(width);
  this.desc=desc;
  this.isSelected=false;
  this.id=ID_GEN.generate();
  var baseDim=extractDimension(MAP);
  this.x=(x==null)?(baseDim.width/2)-(this.width/2):x;
  this.y=(y==null)?(baseDim.height/2)-(this.height/2):y;
  this.domElement=createItemEl(name,this.id,this.width,this.height,this.x,this.y);
  this.isSelected=false;
  ITEMS[this.id]=this;
  setDraggable(this.domElement, this);
  MAP.appendChild(this.domElement);
}

function assignListFunc(el, itemObj){
  el.className="listItem";
  el.innerHTML=itemObj.name;
  el.id="listItem"+itemObj.id;
  var values=[
    itemObj.id,
    itemObj.name,
    itemObj.width,
    itemObj.height,
    itemObj.desc
  ];
  el.onclick=function(){
    INFO_BOX.hidden=false;
    var children=INFO_FIELDS.children;
    children[0].innerHTML=values[0];
    for(var i=1; i<children.length; i++){
      children[i].value=values[i];
    }
  }
}

function setDraggable(el, itemObj) {
  var pos1 = 10, pos2 = 10, pos3 = 10, pos4 = 10;
  el.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e = e || window.event;
    switch(e.which){
      case 1:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDrag;
        document.onmousemove = elDrag;
        break;
      case 3:
        var item=ITEMS[itemObj.id];
        item.isSelected=!item.isSelected;
        if(item.isSelected){
          SELECTED_ITEMS[this.id]=item;
          var el=document.createElement("DIV");
          assignListFunc(el,item);
          ITEM_LIST.appendChild(el);
          if(SHOW_ITEM_LIST){
            ITEM_LIST.hidden=false;
          }else{
            ITEM_LIST.hidden=true;
          }
          item.domElement.style.border="2px solid green";
          DELETE_BUTTON.disabled=false;
        }else{
          delete SELECTED_ITEMS[item.id];
          var listItem=document.getElementById("listItem"+itemObj.id);
          ITEM_LIST.removeChild(listItem);
          if(SHOW_ITEM_LIST){
            ITEM_LIST.hidden=false;
          }else{
            ITEM_LIST.hidden=true;
          }
          //
          INFO_BOX.hidden=true;
          item.domElement.style.border="1px solid black";
          DELETE_BUTTON.disabled=true;
        }
        var itemAmt=Object.keys(SELECTED_ITEMS).length;
        DELETE_BUTTON.innerHTML="Delete ("+itemAmt+")";
        break;
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
      var top=(el.offsetTop - pos2);
      var left=(el.offsetLeft - pos1);
      itemObj.x=left;
      itemObj.y=top;
      el.style.top = top + "px";
      el.style.left = left + "px";
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
      break;
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

function deleteItem(){
  for(var i in SELECTED_ITEMS){
    var item=SELECTED_ITEMS[i];
    MAP.removeChild(item);
    SELECTED_ITEMS={};
    delete ITEMS[item.id];
  }
  DELETE_BUTTON.innerHTML="Delete";
}

function assignSave(parent,el, key){
  var saveData=localStorage.getItem(key);
  var saveName=document.createElement("DIV");
  saveName.className="saveName";
  saveName.innerHTML=key;
  var open=document.createElement("BUTTON");
  open.className="openSave";
  open.onclick=function(){
    MAP.innerHTML="";
    ITEMS={};
    var items=JSON.parse(saveData);
    for(var i in items){
      var item=items[i];
      new Item(item.name, item.width, item.height, item.desc,item.x,item.y);
    }
  }
  open.innerHTML="open";
  var delSave=document.createElement("BUTTON");
  delSave.className="delSave";
  delSave.onclick=function(){
    parent.removeChild(el);
    delete localStorage[key];
  }
  delSave.innerHTML="delete";
  el.appendChild(saveName);
  el.appendChild(open);
  el.appendChild(delSave);
}

function loadSave(parent){
  if(localStorage.length>0){
    parent.innerHTML="";
    parent.style.overflowY="scroll";
    parent.style.overflowX="hidden";
    for(var i=0; i<localStorage.length; i++){
      var el=document.createElement("DIV");
      el.className="save";
      var key=localStorage.key(i);
      assignSave(parent,el, key);
      parent.appendChild(el);
    }
    var cancel=document.createElement("BUTTON");
    cancel.innerHTML="Cancel";
    cancel.onclick=function(){
      closePrompt(parent.id);
    }
    parent.appendChild(cancel);
  }else{
    parent.innerHTML="No saves currently";
  }
}

function save(parent){
  var saveName=parent.children[0].value;
  localStorage.setItem(saveName,JSON.stringify(ITEMS));
  closePrompt(parent.id);
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
 var height=parseInt(el.style.height.split("px")[0]);
 return {width:width, height:height};
}

function modScale(isAdd){
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
    child.style.width=(childDim.width/oldScale)*PIXEL_PER_FT+"px";
    child.style.height=(childDim.height/oldScale)*PIXEL_PER_FT+"px";
  }
}

function modMoveSpd(isAdd){
  NAVIGATE_SPEED+=(isAdd)?1:-1;
  SPEED.innerHTML=NAVIGATE_SPEED;
}

function reset(){
  MAP.innerHTML="";
}

function updateItemInfo(parent){
  var itemID=document.getElementById("itemID").innerHTML;
  var item=ITEMS[itemID];
  var children=parent.children;
  var updatedName=children[1].value;
  var updatedWidth=children[2].value;
  var updatedHeight=children[3].value;
  var updatedDesc=children[4].value;
  item.name=updatedName;
  item.width=updatedWidth;
  item.height=updatedHeight;
  item.desc=updatedDesc;
  var el=item.domElement;
  el.innerHTML=updatedName;
  el.style.width=parseInt(updatedWidth)*PIXEL_PER_FT+"px";
  el.style.height=parseInt(updatedHeight)*PIXEL_PER_FT+"px";
}

function showHideItemList(){
  SHOW_ITEM_LIST=!SHOW_ITEM_LIST;
  var button=document.getElementById("showHideList");
  if(SHOW_ITEM_LIST){
    ITEM_LIST.hidden=false;
    button.innerHTML="Hide";
  }else{
    ITEM_LIST.hidden=true;
    button.innerHTML="Show";
  }
}

function showHideInfoFields(){
  SHOW_INFO_FIELDS=!SHOW_INFO_FIELDS;
  var button=document.getElementById("showHideFields");
  if(SHOW_INFO_FIELDS){
    INFO_FIELDS.hidden=false;
    button.innerHTML="Hide";
  }else{
    INFO_FIELDS.hidden=true;
    button.innerHTML="Show";
  }
}

function center(){
  var width=window.innerWidth || document.body.clientWidth;
  var height= window.innerHeight || document.body.clientHeight;
  var mapDim=extractDimension(MAP);
  MAP.style.top=(parseInt(height)/2)-(mapDim.height/2)+"px";
  MAP.style.left=(parseInt(width)/2)-(mapDim.width/2)+"px";
}

function initialize(parent){
  var children=parent.children;
  var baseWidth=children[0].value;
  var baseHeight=children[1].value;
  var scaling=children[2].value;
  PIXEL.innerHTML=scaling;
  SPEED.innerHTML=NAVIGATE_SPEED;
  PIXEL_PER_FT=parseInt(scaling);
  MAP.style.width=(parseInt(baseWidth)*PIXEL_PER_FT)+"px";
  MAP.style.height=(parseInt(baseHeight)*PIXEL_PER_FT)+"px";
  closePrompt(parent.id);
  document.getElementById("editor").hidden=false;
}
