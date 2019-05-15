var nodes = [],
    links = [];
 
let node_index = 1;
var selectedNode = null;
 
var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = 960 - margin.left - margin.right,
    height = 640 - margin.top - margin.bottom;
 
var deletePressed = false,
    newPressed = false,
    selectNodePressed = false,
    selectStartPressed = false;
 
const CIRCLE_RADIUS = 15,
    CIRCLE_COLOR = 'gray';
 
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
 
var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);
 
var svg = d3.select("#main").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .on('click', newNode)
    .call(zoom);
d3.select('#btn-clear').on('click', function(){
  nodes = [];
  links = [];
  location.reload();
});


d3.select('#add_node').on('click', function(){
  newPressed = true;
});
d3.select('#select_node').on('click', function(){
  selectNodePressed = !selectNodePressed;
});
d3.select('#select_start').on('click', function(){
    
  if (selectedNode){
                console.log('h0');
                var removeIndx = -1;
      nodes.forEach((el, indx) => {
        if (el.h === 0){
          removeIndx = el.id;
          delete nodes[indx].h;
        }
      })
      var index = nodes.findIndex((el) => el.id === Number(d3.select(selectedNode).attr('id')));
      nodes[index]['h'] = 0;
      d3.select(selectedNode).select('text').text(function (d) { return `${d.id}(0)`});
      d3.select(`.circle[id='${removeIndx}']`).select('text').text(function (d) { return d.id;});
              }
});
d3.select('#btn-minti').on('click', minti);

d3.select('#delete_node').on('click', function(){
  var deleted = nodes.pop();
  links = links.filter((el) => {
    return el.source != deleted.id && el.target != deleted.id;
  });
  location.reload();
});

d3.select('#delete_link').on('click', function(){
  links.pop();
  location.reload();
});

defs = svg.append("defs");
 
defs.append("marker")
    .attr({
      "id":"arrow",
      "viewBox":"0 -5 10 10",
      "refX":28,
      "refY":0,
      "markerWidth":4,
      "markerHeight":4,
      "orient":"auto"
    }).append("path")
                    .attr("d", "M0,-5L10,0L0,5")
                    .attr("class","arrowHead");
 
var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
 
var container = svg.append("g");
 
container.append("g")
    .attr("class", "x axis")
  .selectAll("line")
    .data(d3.range(0, width, 20))
  .enter().append("line")
    .attr("x1", function(d) { return d; })
    .attr("y1", 0)
    .attr("x2", function(d) { return d; })
    .attr("y2", height);
 
container.append("g")
    .attr("class", "y axis")
  .selectAll("line")
    .data(d3.range(0, height, 20))
  .enter().append("line")
    .attr("x1", 0)
    .attr("y1", function(d) { return d; })
    .attr("x2", width)
    .attr("y2", function(d) { return d; });
 
var linesG = container.append('g')
        .attr('class', 'links-group');
 
 
function dottype(d) {
  d.x = +d.x;
  d.y = +d.y;
  return d;
}
 
function newNode() {  
  if (!newPressed) return; 
  newPressed= false; 
  // var input = d3.select('body').append('input')
  //           .attr('type', 'text')
  //           .attr('placeholder', 'IntesuvnisTb')
  //           .style('top', d3.event.clientY + 'px')
  //           .style('left', d3.event.clientX + 'px')
  //           .on('blur', function () {
 
  //             nodes.push({
  //               id: node_index++,
  //               // weight: Number(this.value) > 0 ? this.value : 0,
  //               x: Number(input.style('left').slice(0, -2)),
  //               y: Number(input.style('top').slice(0, -2))              
  //             });  
 
  //             updateGraph();
  //             this.remove();
  //           });
  //           input.node().focus();
  console.log(d3.event);
  nodes.push({
    id: node_index++,
    x: d3.event.offsetX,
    y: d3.event.offsetY             
  });
  updateGraph();
  
       
}
 

function zoomed() {
  var e = d3.event,
      tx = Math.min(0, Math.max(e.translate[0], width - width * e.scale)),
      ty = Math.min(0, Math.max(e.translate[1], height - height * e.scale));
  zoom.translate([tx, ty]);
  container.attr("transform", [
    "translate(" + [tx, ty] + ")",
    "scale(" + e.scale + ")"
  ].join(" "));
}
 
function updateGraph() {  
  var lineText = linesG.selectAll('.link-text').data(links);
  lineText.exit().remove();
  var lines = linesG.selectAll('.link').data(links);
  lines.exit().remove();
  var circles = container.selectAll('.circle')
                   .data(nodes);
  circles.exit().remove();
  var linksG = lines
   .enter()
   .append("line")
   .attr("class", "link")
   .attr("x1", function(l) {
     var sourceNode = nodes.filter(function(d) {
       return d.id == l.source
     })[0];
     d3.select(this).attr("y1", sourceNode.y);
     return sourceNode.x
   })
   .attr("x2", function(l) {
     var targetNode = nodes.filter(function(d) {
       return d.id == l.target
     })[0];
     d3.select(this).attr("y2", targetNode.y);
     return targetNode.x;
   })
  //  .attr("marker-end", "url(#arrow)")
   .attr("link-source", function(l) {return l.source;})
   .attr("link-target", function(l) {return l.target;})
   .attr("fill", "none")
   .attr("stroke", "grey")
   .attr('stroke-width', 2);
   lineText.enter()
    .append("text")
    .attr("class", "link-text")
    .attr("link-source", function(l) {return l.source;})
    .attr("link-target", function(l) {return l.target;})
    .text(function (d) {return d.weight;})
    .attr('dx', function (l){
      var sourceNode = nodes.filter(function(d) {
        return d.id == l.source
      })[0];
      var targetNode = nodes.filter(function(d) {
       return d.id == l.target
     })[0];
     d3.select(this).attr("dy", (sourceNode.y + targetNode.y)/2);
     return (sourceNode.x + targetNode.x)/2;
    });
 
  var circlesG = circles.enter()  
            .append('g')
            .attr('class', 'circle')
            .attr('id', function (d) {return d.id;})
            .attr('transform', function (d) {
              return `translate(${d.x}, ${d.y})`;
            })            
            .on('dblclick', function () {  
             
              d3.event.stopPropagation();            
              if (selectedNode) {
                d3.selectAll('.circle-selected').classed("circle-selected", false);
                if (this === selectedNode) {
                  selectedNode = null;
                } else {
                  if ((links.findIndex(el => el.source === d3.select(selectedNode).attr('id')
                      && el.target === d3.select(this).attr('id')) != -1) || (links.findIndex(el => el.target === d3.select(selectedNode).attr('id')
                      && el.source === d3.select(this).attr('id')) != -1)){
                        selectedNode = null;
                        return;
                      }
                  var clickedNode = this;
                  var x = Math.round((selectedNode.getBoundingClientRect().left + d3.event.clientX)/2);
                  var y = Math.round((selectedNode.getBoundingClientRect().top + d3.event.clientY)/2);
                  var input = d3.select('body').append('input')
                      .attr('type', 'text')
                      .attr('class','link-weight')
                      .attr('placeholder', 'Довжина')
                      .style('top', y + 'px')
                      .style('left', x + 'px')
                      .on('blur', function () {
                        links.push({
                          source: Number(d3.select(selectedNode).attr('id')),
                          target: Number(d3.select(clickedNode).attr('id')),
                          weight: Number(this.value) > 0 ? Number(this.value) : 0
                        });
                        selectedNode = null;
                        updateGraph();
                        this.remove();
                  });
                  input.node().focus();
                }
              } else {
                d3.select(this).classed("circle-selected", d3.select(this).classed("circle-selected") ? false : true);
                selectedNode = this;
              }
            })
            .on('click', function(){
              if (selectNodePressed) {
                selectNodePressed=false;
                d3.event.stopPropagation();            
              if (selectedNode) {
                d3.selectAll('.circle-selected').classed("circle-selected", false);
                if (this === selectedNode) {
                  selectedNode = null;
                } else {
                  if ((links.findIndex(el => el.source === d3.select(selectedNode).attr('id')
                      && el.target === d3.select(this).attr('id')) != -1) || (links.findIndex(el => el.target === d3.select(selectedNode).attr('id')
                      && el.source === d3.select(this).attr('id')) != -1)){
                        selectedNode = null;
                        return;
                      }
                  var clickedNode = this;
                  var x = Math.round((selectedNode.getBoundingClientRect().left + d3.event.clientX)/2);
                  var y = Math.round((selectedNode.getBoundingClientRect().top + d3.event.clientY)/2);
                  var input = d3.select('body').append('input')
                      .attr('type', 'text')
                      .attr('class','link-weight')
                      .attr('placeholder', 'Довжина')
                      .style('top', y + 'px')
                      .style('left', x + 'px')
                      .on('blur', function () {
                        links.push({
                          source: Number(d3.select(selectedNode).attr('id')),
                          target: Number(d3.select(clickedNode).attr('id')),
                          weight: Number(this.value) > 0 ? Number(this.value) : 0
                        });
                        selectedNode = null;
                        updateGraph();
                        this.remove();
                  });
                  input.node().focus();
                }
              } else {
                d3.select(this).classed("circle-selected", d3.select(this).classed("circle-selected") ? false : true);
                selectedNode = this;
              }
              }
              
                
            })
            .call(drag);      
    circlesG.append('circle')
            .attr('r', CIRCLE_RADIUS)
            .attr('fill', CIRCLE_COLOR);
    circlesG.append('text')
            .text(function (d) {
              return d.id + (d.h >= 0 ? `(${d.h})`: '') ;
            })
            .attr('dx', function (d)  { return -4 * ((d.id.toString()+ (d.h >= 0 ? `(${d.h})`: '')).length) })
            .attr('dy', 5);
             
}
 
function dragstarted(d) {  
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}
 
function dragged(d) {
  var index = nodes.findIndex(el => Number(d3.select(this).attr('id')) === el.id);  
  nodes[index].x = d3.event.x;
  nodes[index].y = d3.event.y;
  d3.select(this).attr("transform", `translate(${d3.event.x},${d3.event.y})`);
  d3.selectAll(`line[link-source='${d3.select(this).attr('id')}']`)
    .attr('x1', d3.event.x)
    .attr('y1', d3.event.y);
  d3.selectAll(`line[link-target='${d3.select(this).attr('id')}']`)
    .attr('x2', d3.event.x)
    .attr('y2', d3.event.y);
 
  d3.selectAll(`text[link-source='${d3.select(this).attr('id')}']`)
    .attr('dx', function (l){
      var sourceNode = nodes.filter(function(d) {
        return d.id == l.source
      })[0];
      var targetNode = nodes.filter(function(d) {
       return d.id == l.target
     })[0];
     d3.select(this).attr("dy", (sourceNode.y + targetNode.y)/2);
     return (sourceNode.x + targetNode.x)/2;
    });
  d3.selectAll(`text[link-target='${d3.select(this).attr('id')}']`)
    .attr('dx', function (l){
      var sourceNode = nodes.filter(function(d) {
        return d.id == l.source
      })[0];
      var targetNode = nodes.filter(function(d) {
       return d.id == l.target
     })[0];
     d3.select(this).attr("dy", (sourceNode.y + targetNode.y)/2);
     return (sourceNode.x + targetNode.x)/2;
    });
 
 
}



function dragended(d) {
  d3.select(this).classed("dragging", false);
 
}
 
window.addEventListener('keydown', function (e){
  if (e.keyCode === 46) deletePressed = true
  else
    if (e.keyCode === 78) newPressed = true;
});
 
window.addEventListener('keyup', function (e){
  if (e.keyCode === 46) deletePressed = false
  else
    if (e.keyCode === 78) newPressed = false;
    else if (e.keyCode === 72 && selectedNode) {
      var removeIndx = -1;
      nodes.forEach((el, indx) => {
        if (el.h === 0){
          removeIndx = el.id;
          delete nodes[indx].h;
        }
      })
      var index = nodes.findIndex((el) => el.id === Number(d3.select(selectedNode).attr('id')));
      nodes[index]['h'] = 0;
      d3.select(selectedNode).select('text').text(function (d) { return `${d.id}(0)`});
      d3.select(`.circle[id='${removeIndx}']`).select('text').text(function (d) { return d.id;});
     
     
    }
});
 
function ID() {
  return '_' + Math.random().toString(36).substr(2, 9);
};
 
document.addEventListener('DOMContentLoaded', function (){
 
  if (localStorage.getItem('graph') && localStorage.getItem('graph') != ''){
    var graph = JSON.parse(localStorage.getItem('graph'));
    nodes = graph.nodes;
    links = graph.links;
    console.log(nodes);
    
    node_index = nodes.length + 1;
    updateGraph();
  }
});
 
window.onbeforeunload = function() {
 
  localStorage.setItem('graph', JSON.stringify({'nodes': nodes, 'links': links}));
  return 'SAVE GRAPH';
};
 
function minti(){
  if (nodes.findIndex((el)=> el.h === 0) === -1) return;
  var counter = 1;
  var H = new Array(nodes.length);
  var USED_LINKS = [];
  var I = [(nodes.find(el => el.h === 0).id)];
  H[nodes.findIndex(el => el.h === 0)] = 0;
  while (I.length != nodes.length){
    var temp_h = [];
 
    var avab_links = links.filter( el => (I.findIndex(i => i === el.source || i === el.target) != -1) && ((I.findIndex(i => i === el.source) == -1) || (I.findIndex(i => i === el.target) == -1)));
    avab_links.forEach(el => {
      var h = H[I.find(i => el.source === i || el.target === i) - 1] + el.weight;
      temp_h.push(h);
    });
    var min_h = Math.min(...temp_h);
    var min_link = avab_links[temp_h.findIndex(el => el === min_h)];
    USED_LINKS.push(min_link);
    if (I.findIndex(el => el === min_link.source) == -1){
      I.push(min_link.source);
      H[min_link.source - 1] = min_h;
    } else {
      I.push(min_link.target);
      H[min_link.target - 1] = min_h;
    }
    console.log("Krok #" + counter++);
    console.log(H);
    console.log(I);
  }
 
  d3.selectAll('.link')
    .attr('stroke', function (d) {
      return USED_LINKS.find(el => el.source === d.source && el.target === d.target) ? 'green' : 'red';
    })
    .attr('stroke-width', function (d) {
      return USED_LINKS.find(el => el.source === d.source && el.target === d.target) ? 7 : 2;
    })
 
  d3.selectAll('.circle text').text(function (d){
    return `${d.id}(${H[d.id - 1]})`;
  })
}