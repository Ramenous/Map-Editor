dragElement(document.getElementById("map"));

function dragElement(el) {
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
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
  }
  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
