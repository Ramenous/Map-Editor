var MAP=document.getElementById("map");
const SCREEN=document.getElementById("screen");
const PIXEL=document.getElementById("pixPerFt");
const SPEED=document.getElementById("speedAmt");
const ITEM_ID=document.getElementById("itemID");
const ITEM_LIST=document.getElementById("itemList");
const DELETE_BUTTON=document.getElementById("delete");
const INFO_BOX=document.getElementById("infoBox");
const ITEM_INFO_FORM=document.getElementById("itemInfoForm");
const SAVE_PROMPT=document.getElementById("savePrompt");
const PX="px";
const UNIT="ft";
var NAVIGATE_SPEED=50;
var PIXEL_PER_FT=1;
var SELECTED_ITEMS={};
var SHOW_ITEM_LIST=false;
var SHOW_ITEM_INFO_FORM=true;
var ITEMS={};
var ITEM_ORDER=[];
var SAVE_NAME;
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
/**
  Generator that creates a unique ID
**/
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
/**
  extracts width and height of a dom element as an integer
  @return {object} object containing width and height
**/
function extractDimension(el){
 var width=parseInt(el.style.width.split(PX)[0]);
 var height=parseInt(el.style.height.split(PX)[0]);
 return {width:width, height:height};
}
const ID_GEN= new UniqueIDGenerator();
/**
  Creates dom Element that represents the item object
  @param {string} name - item name
  @param {string} id - item id
  @param {string} width - actual item width
  @param {string} height - actual item height
  @param {string} desc - item description
  @param {string} color - color of the item element
  @param {string} x - the x position of the element on the map
  @param {string} y - the y position of the element on the map
**/
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
/**
  Gets a proper spawn position of a newly create item
  @param {object} item - item object
**/
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
  return{
    x:(xPos+itemWidth>mapWidth)?mapWidth-itemWidth :xPos,
    y:(yPos+itemHeight>mapHeight)?mapHeight-itemHeight :yPos
  };
}
/**
 Creates a new item object which represent items that will be placed
 on the map
 @param {string} name - item name
 @param {string} width - actual item width
 @param {string} height - actual item height
 @param {string} desc - item description
 @param {string} color - color of the item element
 @param {string} x - the x position of the element on the map
 @param {string} y - the y position of the element on the map
**/
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
  ITEM_ORDER.push(this);
  this.updateItemInfo=(name, width, height, desc)=>{
    this.name=name;
    this.width=width;
    this.height=height;
    this.desc=desc;
    var el=this.domElement;
    var domWidth=parseInt(width)*PIXEL_PER_FT;
    var domHeight=parseInt(height)*PIXEL_PER_FT;
    console.log(width, height);
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
/**
  Creates a selected item tab for the selected items list
  @param {object} el - the tab element which holds item's name and id
  @param {object} itemObj - the item object
**/
function createListTab(el, itemObj){
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
/**
  Deselects an item
  @param {string} itemID - the id of the item
**/
function deselectItem(itemID){
  var item=ITEMS[itemID];
  delete SELECTED_ITEMS[item.id];
  var listItem=document.getElementById("listItem"+itemID);
  ITEM_LIST.removeChild(listItem);
  INFO_BOX.hidden=true;
  item.domElement.style.border="1px solid black";
}
/**
  Sets an item to be a draggable element
  @param {object} el- the dom element equivalent of an object
  @param {object} itemObj - an item object
**/
function setDraggable(el, itemObj) {
  var pos1 = 10, pos2 = 10, pos3 = 10, pos4 = 10;
  el.onmousedown = dragMouseDown;
  /**
    Selects items when it is a right click
    Selects item to drag when left click
    @param {object} e- event
  **/
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
          createListTab(el,item);
          ITEM_LIST.appendChild(el);
          item.domElement.style.border="2px solid green";
          DELETE_BUTTON.disabled=false;
        }else{
          deselectItem(itemObj.id);
        }
        var itemAmt=Object.keys(SELECTED_ITEMS).length;
        DELETE_BUTTON.innerHTML=(itemAmt==0)?"Delete":"Delete ("+itemAmt+")";
        break;
    }
  }
  /**
    Checks if element is within map
    @param {object} elDim - object containing item element's dimensions
    @param {object} mapDim - object containing map element's dimensions
  **/
  function withinMap(elDim,mapDim){
    var inHorizontalRange=el.offsetLeft>0 && el.offsetLeft+elDim.width<=mapDim.width;
    var inVerticalRange=el.offsetTop>0 && el.offsetTop+elDim.height<=mapDim.height;
    return inHorizontalRange && inVerticalRange;
  }
  /**
    Drags the element
    @param {object?} e - event
  **/
  function elDrag(e) {
    var elDim=extractDimension(el);
    var mapDim=extractDimension(MAP);
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    var top=(el.offsetTop - pos2);
    var left=(el.offsetLeft - pos1);
    if(!withinMap(elDim, mapDim)){
      console.log("OOB", top, left);
      if(top<0){
        top=1;
      }
      if(top+elDim.height>mapDim.height){
        top=mapDim.height-elDim.height;
      }
      if(left<0){
        left=1;
      }
      if(left+elDim.width>mapDim.width){
        left=mapDim.width-elDim.width;
      }
    }
    el.style.top = top + PX;
    el.style.left = left + PX;
    itemObj.x=left;
    itemObj.y=top;
  }
  /**
    stops the drag
  **/
  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
/**
 Closes a prompt with the given id
 @param {string} id - the id of the prompt that is to be closed
**/
function closePrompt(id){
  document.getElementById(id).hidden=true;
  SCREEN.hidden=true;
}
/**
  Retrieves item values from the form element
  @param {object} formEl - the form element containing item values
**/
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
/**
  Adds items
  @param {string} formID - the form element's id to get the values
**/
function addItem(formID){
  var formEl=document.getElementById(formID);
  var valObj=getItemFormValues(formEl);
  new Item(valObj.name,valObj.width,valObj.height,valObj.desc);
  closePrompt("addItemPrompt");
}
/**
  Deletes selected items
**/
function deleteItem(){
  for(var i in SELECTED_ITEMS){
    var item=SELECTED_ITEMS[i];
    MAP.removeChild(item.domElement);
    deselectItem(item.id);
    delete ITEMS[item.id];
    var ind=ITEM_ORDER.indexOf(item);
    ITEM_ORDER.splice(ind,1);
  }
  DELETE_BUTTON.innerHTML="Delete";
}
/**
  Creates a save tab that displays the save name and
  options to open or delete it
  @param {object} parent- the container element that contains the saves
  @param {object} el- the save tab element which contains save name and options
  @param {string} key - the name of the save
**/
function createSave(parent, el, key){
  var saveData=localStorage.getItem(key);
  var saveName=document.createElement("DIV");
  saveName.className="saveName";
  saveName.innerHTML=key;
  var open=document.createElement("BUTTON");
  open.className="openSave";
  open.onclick=function(){
    MAP.innerHTML="";
    ITEMS={};
    ITEM_ORDER=[];
    SAVE_NAME=key;
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
/**
  Loads all localStorage saves of saved Maps onto
  a designated save container along with options to
  open or delete that save.
  @param {object} parent - the container element that holds all elements of
  a load save prompt
**/
function loadSave(parent){
  var formContainer=parent.children[0];
  var saveContainer=formContainer.children[0];
  function empty(){
    formContainer.innerHTML="No saves currently";
  }
  if(localStorage.length>0){
    saveContainer.innerHTML="";
    for(var i=0; i<localStorage.length; i++){
      var el=document.createElement("DIV");
      el.className="save";
      var key=localStorage.key(i);
      createSave(parent,el, key);
      saveContainer.appendChild(el);
    }
    var cancel=document.createElement("BUTTON");
    cancel.innerHTML="Cancel";
    var clearAll=document.createElement("BUTTON");
    clearAll.innerHTML="Clear";
    cancel.className="formButton";
    clearAll.className="formButton";
    cancel.onclick=function(){
      closePrompt(parent.id);
    }
    clearAll.onclick=function(){
      localStorage.clear();
      empty();
    }
    var container=document.createElement("DIV");
    container.className="buttonContainer";
    container.appendChild(clearAll);
    container.appendChild(cancel);
    formContainer.appendChild(container);
  }else{
    empty();
  }
}
/**
  Saves the current map and the items (children) within it
**/
function save(){
  var saveNameInputVal=document.getElementById("saveNameInput").value;
  var saveName=(SAVE_NAME!=null)?SAVE_NAME:saveNameInputVal;
  var mapDim=extractDimension(MAP);
  var save={
    items:ITEM_ORDER,
    mapDim:mapDim
  };
  localStorage.setItem(saveName,JSON.stringify(save));
  closePrompt(SAVE_PROMPT.id);
}
/**
  Displays the prompt with the given id
  @param {string} id - the id of the prompt element to be displayed
**/
function displayPrompt(id){
  switch(id){
    case "add":
      document.getElementById("addItemPrompt").hidden=false;
      break;
    case "save":
      SAVE_PROMPT.hidden=false;
      break;
    case "loadSave":
      var prompt=document.getElementById("loadSavePrompt");
      prompt.hidden=false;
      loadSave(prompt);
      break;
  }
  SCREEN.hidden=false;
}

/**
  Modifies the scaling of the map and its items (children)
  based on the modified amount of pixel per actual feet of the item/map
  @param {boolean} isAdd - whether or not client wants to add / del a pixel from the scale
**/
function modScale(isAdd){
  var oldScale=PIXEL_PER_FT;
  PIXEL_PER_FT+=(isAdd)?1:-1;
  PIXEL.innerHTML=PIXEL_PER_FT;
  var mapDim=extractDimension(MAP);
  var oldMapWidth=mapDim.width;
  var oldMapHeight=mapDim.height;
  var newMapWidth=(mapDim.width/oldScale)*PIXEL_PER_FT;
  var newMapHeight=(mapDim.height/oldScale)*PIXEL_PER_FT;
  MAP.style.width=newMapWidth;
  MAP.style.height=newMapHeight;
  var children=MAP.children;
  for(var i=0;i<children.length; i++){
    var child=children[i];
    var childDim=extractDimension(child);
    var actualWidth=childDim.width/oldScale;
    var actualHeight=childDim.height/oldScale;
    var newWidth=(childDim.width/oldScale)*PIXEL_PER_FT;
    var newHeight=(childDim.height/oldScale)*PIXEL_PER_FT;
    var widthDifference=newWidth-(childDim.width);
    var heightDifference=newHeight-(childDim.height);
    child.style.left=(child.offsetLeft*newMapWidth)/oldMapWidth+PX;
    child.style.top=(child.offsetTop*newMapHeight)/oldMapHeight+PX;
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

/**
  Modifies the speed of the movement of the map
  @param {boolean} isAdd - whether or not client wants to increase/decrease speed
**/
function modMoveSpd(isAdd){
  NAVIGATE_SPEED+=(isAdd)?1:-1;
  SPEED.innerHTML=NAVIGATE_SPEED;
}

/**
  Clears all items in the map
**/
function reset(){
  MAP.innerHTML="";
}

/**
  Updates the selected item's information
  @param {string} formID - the id of the form element that contains the updated item info
**/
function updateItemInfo(formID){
  var formEl=document.getElementById(formID);
  var itemID=ITEM_ID.innerHTML.split("ID: ")[1];
  var item=ITEMS[itemID];
  var valObj=getItemFormValues(formEl);
  item.updateItemInfo(valObj.name,valObj.width,valObj.height,valObj.desc);
}

/**
  Toggles between showing and hiding the list of selected items
**/
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

/**
  Toggles between showing and hiding the selected item's information box
**/
function showHideInfoFields(){
  SHOW_ITEM_INFO_FORM=!SHOW_ITEM_INFO_FORM;
  var button=document.getElementById("showHideFields");
  if(SHOW_ITEM_INFO_FORM){
    INFO_BOX.style.height="300px";
    ITEM_INFO_FORM.hidden=false;
    button.innerHTML="Hide";
  }else{
    INFO_BOX.style.height="10px";
    ITEM_INFO_FORM.hidden=true;
    button.innerHTML="Show";
  }
}

/**
  Centers the map at the middle of the window;
**/
function center(){
  var width=window.innerWidth || document.body.clientWidth;
  var height= window.innerHeight || document.body.clientHeight;
  var mapDim=extractDimension(MAP);
  MAP.style.top=(parseInt(height)/2)-(mapDim.height/2)+PX;
  MAP.style.left=(parseInt(width)/2)-(mapDim.width/2)+PX;
}

/**
  Moves map based on key pressed (up/down/left/right)
  @param {idk} event - keypress
**/
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
/**
  Initializes editor and Map based on chosen values
  @param {object} parent - the initialize prompt element that contains map values
**/
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
