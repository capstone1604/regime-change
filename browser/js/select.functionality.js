var rect = {};
var drag = false;
var rightClick = {};
var positionOfNewBuilding;

var currentMousePosition;

function mouseDown(e) {
  if ( buildMode.on && (e.which === 1 && !e.ctrlKey) ) {
    var tempX = e.layerX + vp.pos[0];
    var tempY = e.layerY + vp.pos[1];
    positionOfNewBuilding = [tempX, tempY];
  } else if (rendezvousMode.on && (e.which === 1 && !e.ctrlKey)) {
    var tempX = e.layerX + vp.pos[0];
    var tempY = e.layerY + vp.pos[1];
    rendezvousMode.mostRecentRendezvous = [tempX, tempY];
  } else if (e.which === 1 && !e.ctrlKey) {
    rect.startX = e.layerX + vp.pos[0];
    rect.startY = e.layerY + vp.pos[1];
    rect.w = 5;
    rect.h = 5;
    drag = true;
  } else if ( (e.ctrlKey && currentSelection.length) || (e.which === 3 && currentSelection.length) ) {
    rightClick.x = e.layerX + vp.pos[0];
    rightClick.y = e.layerY + vp.pos[1];
  }
}

function mouseUp(e) {
  if (buildMode.on) {
    submitBuildingLocation(positionOfNewBuilding);
    buildModeOff();
  } else if (rendezvousMode.on) {
    submitRendezvousPosition(rendezvousMode.mostRecentRendezvous);
  } else if (attackPending && e.which === 1) { // Attack functionality ('on a-click')
    handleAttackInput(e.layerX + vp.pos[0], e.layerY + vp.pos[1]); // takes in the x and y corresponding to the big canvas
  } else if (e.which === 1 && !e.ctrlKey){ // Regular Click
    select();
  }
  else {
    for (var unitId in player.units) {
      rightClick.x += 25; //this is where the selected units will not stack on the top of each other
      rightClick.y += 25; //this is where the selected units will not stack on the top of each other
      var unit = player.units[unitId];
      if (unit.sprite.selected) unit.targetpos = [rightClick.x, rightClick.y];
    }
  }
  drag = false;
  rect = {};
  displayRootMenu(); //defined in js/ui/main-menu.js
}

function mouseMove(e) {
  if (drag) {
    rect.w = e.layerX + vp.pos[0] - rect.startX;
    rect.h = e.layerY + vp.pos[1] - rect.startY ;
  }

  currentMousePosition = e;
  // for scrolling without clicking
  // diagonal movement check
}

//May still require adjustments, but seems to be able to accomodate multi-unit selection
function select(){
  $("#building-info-panel").hide();
  currentSelection = [];
  var buildingFound = false;

  var rectEndX = rect.startX + rect.w;
  var rectEndY = rect.startY + rect.h;

  for (var buildingId in player.buildings) {
    var aBuilding = player.buildings[buildingId];
    aBuilding.sprite.selected = false;
    var playerEndX = aBuilding.pos[0] + vp.pos[0] + aBuilding.sprite.size[0];
    var playerEndY = aBuilding.pos[1] + vp.pos[1] + aBuilding.sprite.size[1];
    if ( !buildingFound && (inRange(aBuilding.pos[0], playerEndX, rect.startX, rectEndX) 
                        && inRange(aBuilding.pos[1], playerEndY, rect.startY, rectEndY)) ) {
      aBuilding.sprite.selected = true;
      currentSelection.push(aBuilding);
      lastSelectedBuilding = aBuilding;
      buildingFound = true;
    }

  }

  for (var unitId in player.units) {
    var unit = player.units[unitId];
    unit.sprite.selected = false;
    if (!buildingFound) {
      var playerEndX = unit.pos[0] + vp.pos[0] + unit.sprite.size[0];
      var playerEndY = unit.pos[1] + vp.pos[1] + unit.sprite.size[1];

      if (inRange(unit.pos[0], playerEndX, rect.startX, rectEndX) && inRange(unit.pos[1], playerEndY, rect.startY, rectEndY)){
        currentSelection.push(unit);
        unit.sprite.selected = true;
      }
    }
  }
  //}
  rightClick = {};
  drag = false;
  console.log("SECOND TIME. CONTENTS OF CURRENTSELECTION?", currentSelection);
}