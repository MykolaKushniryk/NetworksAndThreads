//
// Ford-Fulkerson's Algorithm
// Copyright (C) Kenji Ikeda 2015
//
document.write("<script type='text/javascript' src='./graph.js'></script>");
document.write("<script type='text/javascript' src='./heap.js'></script>");

//
//	Ford-Fulkerson's Algorithm
//	(Edmonds-Karp)
//
function Maxflow(canvas,canvas2,myfont,isdigraph,nodes,edges) {
	// vars for Graph
	var context = canvas.getContext("2d");
	context.font = myfont;
	Graph(context,isdigraph,nodes,edges);
	// local vars for Maxflow's Algorithm	'
	var snode;	// start node
	var tnode;	// terminal node
	var flow;	// total flow of the network
	var step;	// step
	var heap;	// set of adjacent nodes
	var maxCapacity;
	var isOptimal;
	// these are local variables in Maxflow()

	// Method of Maxflow
	this.start = function() {
		canvas.addEventListener('mousedown',function(evt) {
			var mousePos = getMousePos(canvas,evt);
			mouseDown(canvas,mousePos.x,mousePos.y);
		},false);
	}

	//
	//  Node extension for Maxflow
	//
	function extNode(node) {
		// extends Node Properties
		node.dist = -1;			// distance from start node
		node.prev_n = -1;		// previous node in the shortest path
		node.prev_e = -1;		// previous edge in the shortest path
		node.af = 0;			// augmentable flow
	}
	// extends Node Methods
	Node.prototype.paint = function(context,node) {	// override Node.paint
		context.strokeStyle = 'black';
		context.fillStyle = 'white';
		context.lineWidth=1;
		context.textAlign='center';
		if (node.dist>=0) {
			context.fillStyle = 'cyan';
		} else {
			context.fillStyle = 'yellow';
		}
		if ((node.num==tnode)||(node.num==snode)) {
			context.strokeStyle = 'magenta';
			context.lineWidth=2;
		}

		node.drawNode(context,node);
	}
	//
	// Edge extension for Maxflow
	//
	function extEdge(edge,c) {
		// extends Edge Properties
		edge.capacity = c;
		edge.flow = 0;
		edge.isAP= false;	// if on the flow augmenting path
	}
	// extends Edge Methods
	Edge.prototype.paint = function(context,edge) {	// override Edge.paint
		// paint Network (flow/capacity)
		context.strokeStyle = 'black';
		context.lineWidth = 1;
		if ((edge.initv == Nodes[edge.termv].prev_n)||
			(edge.termv == Nodes[edge.initv].prev_n)) {
			if (edge.isAP) {
				context.strokeStyle = 'red';
				context.lineWidth = 3;
			} else {
				context.strokeStyle = 'blue';
				context.lineWidth = 2;
			}
		}
		if ((Nodes[edge.initv].dist>=0)&&(Nodes[edge.termv].dist<0)) {
			context.strokeStyle = 'orange';
			context.lineWidth = 2;
		} else if ((Nodes[edge.termv].dist>=0)&&(Nodes[edge.initv].dist<0)) {
			context.strokeStyle = 'lightgreen';
			context.lineWidth = 2;
		}
		edge.drawEdge(context,edge);
		printFlow(context,edge);
	
		// local function
		function printFlow(context,edge) {
			var s = ""+edge.flow+"/"+edge.capacity;
			var w = context.measureText(s).width;
			var h = edge.fs;
			var xc = (edge.initxy.x+edge.termxy.x)/2;
			var yc = (edge.initxy.y+edge.termxy.y)/2;
			context.textAlign='center';
			context.clearRect(xc-w/2,yc-h/2,w,h);
			context.fillStyle = 'black';
			context.fillText(s,xc,yc+h/4);
		}
	}
	Edge.prototype.paint2 = function(context,edge) {
		// paint Residual Network associated to the present flow
		var x1 = edge.initxy;
		var x2 = edge.termxy;

		// paint forward edge
		var c = edge.capacity-edge.flow;	// residual capacity
		context.fillStyle = 'black';
		if (c>0) {
			if (edge.initv == Nodes[edge.termv].prev_n) {
				if (edge.isAP) {
					context.strokeStyle = 'red';
					context.lineWidth = 3;
					if (c==Nodes[tnode].af) {
						context.fillStyle = 'red';
					}
				} else {
					context.strokeStyle = 'blue';
					context.lineWidth = 2;
				}
			} else {
				context.strokeStyle = 'gray';
				context.lineWidth = 1;
			}
			drawArrow(context,x1,x2,c);
		}

		// paint backward edge
		c = edge.flow;				// residual capacity
		context.fillStyle = 'black';
		if (c>0) {
			if (edge.termv == Nodes[edge.initv].prev_n) {
				if (edge.isAP) {
					context.strokeStyle = 'red';
					context.lineWidth = 3;
					if (c==Nodes[tnode].af) {
						context.fillStyle = 'red';
					}
				} else {
					context.strokeStyle = 'blue';
					context.lineWidth = 2;
				}
			} else {
				context.strokeStyle = 'gray';
				context.lineWidth = 1;
			}
			drawArrow(context,x2,x1,c);
		}
	
		// local function
		function drawArrow(context,x1,x2,c) {
			var a = x2.x-x1.x;
			var b = x2.y-x1.y;

			var r = Math.sqrt(a*a+b*b)/16.0;
			var aa = -a/r;
			var bb = -b/r;
			var da = (aa*12+bb*5)/13;
			var db = (-aa*5+bb*12)/13;

			var xx1 = {x:x1.x,y:x1.y};
			var xx2 = {x:x2.x,y:x2.y};

			xx1.x += bb/8;
			xx1.y -= aa/8;
			xx2.x += bb/8;
			xx2.y -= aa/8;

			context.beginPath();
			context.moveTo(xx1.x,xx1.y);
			context.moveTo(xx2.x,xx2.y);
			context.lineTo(xx2.x+da,xx2.y+db);
			context.stroke();
			context.beginPath();
			context.moveTo(xx1.x,xx1.y);
			context.lineTo(xx2.x,xx2.y);
			context.stroke();

			var x = x1.x+a/2+bb;
			var y = x1.y+b/2-aa;
			var s = ""+c;
			context.fillText(s,x,y+edge.fs/5);
		}
	}


	//
	// other local functions of Maxflow's Algorithm	'
	//
	function mycomp(i,j) {	// compare labels of node(i) and node(j)
				// used in the heap
		var d1 = Nodes[i].dist;
		var d2 = Nodes[j].dist;
		return (d1-d2>0);
	}

	function dijkstra() {
		// clear labels
		for (var i=0; i<n; i++) {
			Nodes[i].dist = -1;
			Nodes[i].prev_n = -1;
			Nodes[i].prev_e = -1;
			Nodes[i].af = 0;
		}
		// start
		var u = snode;
		Nodes[u].dist = 0;
		Nodes[u].af = maxCapacity;
		for (;u>=0; u = heap.pop()) {
			var d0 = Nodes[u].dist;

			// trace forward edge of u
			var j = Nodes[u].deltaP;
			while (j>=0) {
				var i = Edges[j].termv;
				var d = Nodes[i].dist;
				var l = d0+1;			// edge.lenth = 1
				var rc = Edges[j].capacity-Edges[j].flow;
								// Residual Capacity of Edges[j]
				if ((rc>0) && (d<0)) {
					Nodes[i].dist = l;	// replace Label dist
					Nodes[i].prev_n = u;	// replace Label prev_n
					Nodes[i].prev_e = j;	// replace Label prev_e
					Nodes[i].af = Math.min(rc,Nodes[u].af);
					heap.push(i);
				}
				j = Edges[j].deltaP;
			}

			// trace backward edge of u
			j = Nodes[u].deltaM;
			while (j>=0) {
				var i = Edges[j].initv;
				var d = Nodes[i].dist;
				var l = d0+1;			// edge.lenth = 1
				var rc = Edges[j].flow;		// Residual Capacity of Edges[j]
				if ((rc>0) && (d<0)) {
					Nodes[i].dist = l;	// replace Label dist
					Nodes[i].prev_n = u;	// replace Label prev_n
					Nodes[i].prev_e = i;	// replace Label prev_e
					Nodes[i].af = Math.min(rc,Nodes[u].af);
					heap.push(i);
				}
				j = Edges[j].deltaM;
			}
		} // end for-loop
	}

	function step0() {	// initialize
		flow = 0;
		for (var i=0; i<m; i++) {
			Edges[i].flow = 0;
			Edges[i].isAp = false;
		}
		dijkstra();	// find shortest path from snode
	}

	function step1() {	// mark an s-t augmenting path
		if (Nodes[tnode].dist<0) {
			// no flow augmenting path
			isOptimal=true;
			return;
		}
		// set isAP (if the edge on the flow augmenting path)
		for (var i=0; i<m; i++) {
			Edges[i].isAp = false;
		}
		for (var i=tnode; Nodes[i].prev_n>=0; i = Nodes[i].prev_n) {
			Edges[Nodes[i].prev_e].isAP=true;
		}
	}
	
	function step2() {	// augment the flow
		var f = Nodes[tnode].af;
		flow += f;
		for (var i=tnode; Nodes[i].prev_n>=0; i=Nodes[i].prev_n) {
			var e = Nodes[i].prev_e;
			if (Edges[e].termv == i) {
				Edges[e].flow +=f;
			} else {
				Edges[e].flow -=f;
			}
			Edges[e].isAP = false;
		}
		dijkstra();
	}

	function mouseDown(canvas,mx,my) {
		if (step==1) {
			step1();
			if (Nodes[tnode].dist<0) {
				step = 0;
			} else {
				step = 2;
			}
		} else if (step==2) {
			step2();
			step = 1;
		} else {
			step0();
			step = 1;
		}
		paint(canvas);
		paint2(canvas2);
	}

	function paint(canvas) {
		var context = canvas.getContext("2d");
		var w = canvas.width;
		var h = canvas.height;
	
		context.clearRect(0,0,w,h);
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		context.lineWidth = 1;
		context.font = myfont;

		for (var i=0; i<n; i++) {
			Nodes[i].paint(context,Nodes[i]);
		}
		for (var i=0; i<m; i++) {
			Edges[i].paint(context,Edges[i]);
		}
		context.textAlign='left';
		if (isOptimal) {
			context.fillText("maxflow="+flow,10,20);
		} else {
			context.fillText("flow="+flow,10,20);
		}
		isOptimal=false;
	}
	function paint2(canvas) {
		var context = canvas.getContext("2d");
		var w = canvas.width;
		var h = canvas.height;
	
		context.clearRect(0,0,w,h);
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		context.lineWidth = 1;
		context.font = myfont;

		for (var i=0; i<n; i++) {
			Nodes[i].paint(context,Nodes[i]);
		}
		for (var i=0; i<m; i++) {
			Edges[i].paint2(context,Edges[i]);
		}
		context.textAlign='left';
		context.fillText("augflow="+Nodes[tnode].af,10,20);
	}

	function getMousePos(canvas,evt) {
		var rect=canvas.getBoundingClientRect();
		return {
			x: evt.clientX-rect.left,
			y: evt.clientY-rect.top
		};
	}

// initialization must be done after def of Methods for Node & Edge are executed
	// extends Node and Edge Properties
	for (var i=0; i<n; i++) {
		extNode(Nodes[i]);
	}
	maxCapacity = 0;
	for (var i=0; i<m; i++) {
		var capacity= edges[i][3];
		extEdge(Edges[i],capacity);
		if (capacity>maxCapacity) {
			maxCapacity = capacity;
		}
	}
	// extension for Maxflow's Algorithm	'
	snode = 0;
	tnode = n-1;
	iteration = 0;
	step = 0;
	isOptimal = false;
	heap = new Heap(n,mycomp);

	// initialize & paint
	step0();
	step = 1;
	paint(canvas);
	paint2(canvas2);
}
