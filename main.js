var MAP=document.getElementById("map");
const SCREEN=document.getElementById("screen");
const PIXEL=document.getElementById("pixPerFt");
const SPEED=document.getElementById("speedAmt");
const ITEM_ID=document.getElementById("itemID");
const ITEM_LIST=document.getElementById("itemList");
const DELETE_BUTTON=document.getElementById("delete");
const INFO_BOX=document.getElementById("infoBox");
const ITEM_INFO_FORM=document.getElementById("itemInfoForm");
const PX="px";
const UNIT="ft";
var NAVIGATE_SPEED=50;
var PIXEL_PER_FT=1;
var SELECTED_ITEMS={};
var SHOW_ITEM_LIST=false;
var SHOW_ITEM_INFO_FORM=true;
var ITEMS={};
var COLORS=[
  "#99cc00",
  "#999966",
  "#cc00cc",
  "#99ffcc",
  "#669999",
  "#6699ff",
  "#ffff66",
  "#ff5050",
  "#ffffff",
  "#ffcc99"
];
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
function extractDimension(el){
 var width=parseInt(el.style.width.split(PX)[0]);
 var height=parseInt(el.style.height.split(PX)[0]);
 return {width:width, height:height};
}
const ID_GEN= new UniqueIDGenerator();

function createItemEl(name,id,width,height,color,x,y){
  var el=document.createElement("DIV");
  el.className="item";
  el.id=id;
  var domWidth=width*PIXEL_PER_FT+PX;
  var domHeight=height*PIXEL_PER_FT+PX;
  el.style.width=domWidth;
  el.style.height=domHeight;
  el.style.maxWidth=domWidth;
  el.style.maxHeight=domHeight;
  el.style.top=y+PX;
  el.style.left=x+PX;
  el.style.backgroundColor=color;
  var nameEl=document.createElement("DIV");
  nameEl.innerHTML=name;
  nameEl.style.display="table-cell";
  nameEl.style.verticalAlign="middle";
  var widthEl=document.createElement("DIV");
  widthEl.style.top="0px";
  widthEl.style.left=(width*PIXEL_PER_FT)/2+PX;
  widthEl.style.position="absolute";
  widthEl.innerHTML=width+UNIT;
  var heightEl=document.createElement("DIV");
  heightEl.style.left="0px";
  heightEl.style.top=(height*PIXEL_PER_FT)/2+PX;
  heightEl.style.position="absolute";
  heightEl.innerHTML=height+UNIT;
  el.appendChild(nameEl);
  el.appendChild(widthEl);
  el.appendChild(heightEl);
  return el;
}

function getSpawnPos(item){
  var mapDim=extractDimension(MAP);
  var mapWidth=mapDim.width;
  var mapHeight=mapDim.height;
  var itemWidth=item.width*PIXEL_PER_FT;
  var itemHeight=item.height*PIXEL_PER_FT;
  var mapX=MAP.offsetLeft;
  var mapY=MAP.offsetTop;
  var xPos=((window.innerWidth/2)-itemWidth/2)-mapX;
  var yPos=((window.innerHeight/2)-itemHeight/2)-mapY;
  console.log("xy",((window.innerWidth/2)-itemWidth/2),mapX,((window.innerHeight/2)-itemHeight/2),mapY,xPos, yPos);
  console.log("info", xPos+itemWidth, mapX+mapWidth,yPos+itemHeight,mapY+mapHeight);
  return{
    x:(xPos+itemWidth>mapX+mapWidth)?mapWidth-itemWidth :xPos,
    y:(yPos+itemHeight>mapY+mapHeight)?mapHeight-itemHeight :yPos
  };
}

Item= function(name, width, height,desc, color,x,y){
  this.name=name;
  this.height=parseInt(height);
  this.width=parseInt(width);
  this.color=(color==null)?COLORS[Math.floor((Math.random() * COLORS.length-1))]:color;
  this.desc=desc;
  this.isSelected=false;
  this.id=ID_GEN.generate();
  var baseDim=extractDimension(MAP);
  var spawnPos=getSpawnPos(this);
  this.x=(x==null)?spawnPos.x:x;
  this.y=(y==null)?spawnPos.y:y;
  this.domElement=createItemEl(name,this.id,this.width,this.height,this.color,this.x,this.y);
  this.isSelected=false;
  ITEMS[this.id]=this;
  this.updateItemInfo=(name, width, height, desc)=>{
    this.name=name;
    this.width=width;
    this.height=height;
    this.desc=desc;
    var el=this.domElement;
    var domWidth=parseInt(width)*PIXEL_PER_FT;
    var domHeight=parseInt(height)*PIXEL_PER_FT;
    el.children[0].innerHTML=name;
    el.children[1].style.left=domWidth/2;
    el.children[1].innerHTML=width+UNIT;
    el.children[2].style.top=domHeight/2;
    el.children[2].innerHTML=height+UNIT;
    el.style.width=domWidth+PX;
    el.style.height=domHeight+PX;
    el.style.maxWidth=domWidth+PX;
    el.style.maxHeight=domHeight+PX;

  }
  setDraggable(this.domElement, this);
  MAP.appendChild(this.domElement);
}

function assignListFunc(el, itemObj){
  el.className="listItem";
  el.innerHTML="#"+itemObj.id+" - "+itemObj.name;
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
    var children=ITEM_INFO_FORM.children;
    ITEM_ID.innerHTML="ID: "+values[0];
    for(var i=1; i<children.length; i++){
      children[i-1].value=values[i];
    }
  }
}

function setDraggable(el, itemObj) {
  var pos1 = 10, pos2 = 10, pos3 = 10, pos4 = 10;
  el.onmousedown = dragMouseDown;
  var elDim=extractDimension(el);
  var mapDim=extractDimension(MAP);
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
          item.domElement.style.border="2px solid green";
          DELETE_BUTTON.disabled=false;
        }else{
          delete SELECTED_ITEMS[item.id];
          var listItem=document.getElementById("listItem"+itemObj.id);
          ITEM_LIST.removeChild(listItem);
          INFO_BOX.hidden=true;
          item.domElement.style.border="1px solid black";
          DELETE_BUTTON.disabled=true;
        }
        var itemAmt=Object.keys(SELECTED_ITEMS).length;
        DELETE_BUTTON.innerHTML=(itemAmt==0)?"Delete":"Delete ("+itemAmt+")";
        break;
    }
  }
  function withinMap(){
    var inHorizontalRange=el.offsetLeft>0 && el.offsetLeft+elDim.width<=mapDim.width;
    var inVerticalRange=el.offsetTop>0 && el.offsetTop+elDim.height<=mapDim.height;
    return inHorizontalRange && inVerticalRange;
  }
  function elDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    var top=(el.offsetTop - pos2);
    var left=(el.offsetLeft - pos1);
    if(!withinMap()){
      console.log("OOB", top, left);
      if(top<0){
        top=1;
      }
      if(top>mapDim.height-el.offsetTop){
        top=mapDim.height-elDim.height;
      }
      if(left<0){
        left=1;
      }
      if(left>mapDim.width-el.offsetLeft){
        left=mapDim.width-elDim.width;
      }
    }
    el.style.top = top + PX;
    el.style.left = left + PX;
    itemObj.x=left;
    itemObj.y=top;
  }
  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

document.onkeydown = function(event){
  switch(event.keyCode){
    case 38:
      MAP.style.top=MAP.offsetTop-NAVIGATE_SPEED +PX;
      break;
    case 37:
      MAP.style.left=MAP.offsetLeft-NAVIGATE_SPEED +PX;
      break;
    case 40:
      MAP.style.top=MAP.offsetTop+NAVIGATE_SPEED +PX;
      break;
    case 39:
      MAP.style.left=MAP.offsetLeft+NAVIGATE_SPEED + PX;
      break;
  }
}

function closePrompt(id){
  document.getElementById(id).hidden=true;
  SCREEN.hidden=true;
}

function getItemFormValues(formEl){
  var children=formEl.children;
  var formObj={};
  for(var i=0; i<children.length; i++){
    var child=children[i];
    var val=child.value;
    switch(child.name){
      case "name":
        formObj.name=val;
        break;
      case "width":
        formObj.width=val;
        break;
      case "height":
        formObj.height=val;
        break;
      case "description":
        formObj.desc=val;
        break;
    }
  }
  return formObj;
}

function addItem(formId){
  var formEl=document.getElementById(formId);
  var valObj=getItemFormValues(formEl);
  new Item(valObj.name,valObj.width,valObj.height,valObj.desc);
  closePrompt("addItemPrompt");
}

function deleteItem(){
  for(var i in SELECTED_ITEMS){
    var item=SELECTED_ITEMS[i];
    MAP.removeChild(item.domElement);
    delete ITEMS[item.id];
  }
  SELECTED_ITEMS={};
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
    var save=JSON.parse(saveData);
    for(var i in save.items){
      var item=save.items[i];
      new Item(item.name, item.width, item.height, item.desc, item.color,item.x,item.y);
    }
    MAP.style.width=save.mapDim.width+"px";
    MAP.style.height=save.mapDim.height+"px";
    closePrompt("loadSavePrompt");
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
  var mapDim=extractDimension(MAP);
  var save={
    items:ITEMS,
    mapDim:mapDim
  };
  localStorage.setItem(saveName,JSON.stringify(save));
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

function modScale(isAdd){
  var oldScale=PIXEL_PER_FT;
  PIXEL_PER_FT+=(isAdd)?1:-1;
  PIXEL.innerHTML=PIXEL_PER_FT;
  var mapDim=extractDimension(MAP);
  MAP.style.width=(mapDim.width/oldScale)*PIXEL_PER_FT+PX;
  MAP.style.height=(mapDim.height/oldScale)*PIXEL_PER_FT+PX;
  var children=MAP.children;
  for(var i=0;i<children.length; i++){
    var child=children[i];
    var childDim=extractDimension(child);
    var actualWidth=childDim.width/oldScale;
    var actualHeight=childDim.height/oldScale;
    var newWidth=(childDim.width/oldScale)*PIXEL_PER_FT;
    var newHeight=(childDim.height/oldScale)*PIXEL_PER_FT;
    child.style.maxWidth=newWidth+PX;
    child.style.maxHeight=newHeight+PX;
    child.style.width=newWidth+PX;
    child.style.height=newHeight+PX;
    var widthLabel=child.children[1];
    var lengthLabel=child.children[2];
    widthLabel.style.left=(newWidth/2)+PX;
    widthLabel.innerHTML=actualWidth+UNIT;
    lengthLabel.style.top=(newHeight/2)+PX;
    lengthLabel.innerHTML=actualHeight+UNIT;
  }
}

function modMoveSpd(isAdd){
  NAVIGATE_SPEED+=(isAdd)?1:-1;
  SPEED.innerHTML=NAVIGATE_SPEED;
}

function reset(){
  MAP.innerHTML="";
}

function updateItemInfo(formID){
  var formEl=document.getElementById(formID);
  var itemID=ITEM_ID.innerHTML;
  var item=ITEMS[itemID];
  var valObj=getItemFormValues(formEl);
  item.updateItemInfo(valObj.name,valObj.width,valObj.height,valObj.desc);
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
  SHOW_ITEM_INFO_FORM=!SHOW_ITEM_INFO_FORM;
  var button=document.getElementById("showHideFields");
  if(SHOW_ITEM_INFO_FORM){
    INFO_BOX.style.height="300px";
    ITEM_INFO_FORM.hidden=false;
    button.innerHTML="Hide";
  }else{
    INFO_BOX.style.height="20px";
    ITEM_INFO_FORM.hidden=true;
    button.innerHTML="Show";
  }
}

function center(){
  var width=window.innerWidth || document.body.clientWidth;
  var height= window.innerHeight || document.body.clientHeight;
  var mapDim=extractDimension(MAP);
  MAP.style.top=(parseInt(height)/2)-(mapDim.height/2)+PX;
  MAP.style.left=(parseInt(width)/2)-(mapDim.width/2)+PX;
}

function initialize(parent){
  var children=parent.children;
  var baseWidth=children[0].value;
  var baseHeight=children[1].value;
  var scaling=children[2].value;
  PIXEL.innerHTML=scaling;
  SPEED.innerHTML=NAVIGATE_SPEED;
  PIXEL_PER_FT=parseInt(scaling);
  MAP.style.width=(parseInt(baseWidth)*PIXEL_PER_FT)+PX;
  MAP.style.height=(parseInt(baseHeight)*PIXEL_PER_FT)+PX;
  closePrompt("initializePrompt");
  document.getElementById("editor").hidden=false;
}
