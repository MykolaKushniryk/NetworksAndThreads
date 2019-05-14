//
// (n,m)-graph/digraph
// Copyright (C) Kenji Ikeda 2015
//
function Graph(context,isdigraph,nodes,edges) {
// Graph is just a procedure to define n, m, Nodes, Edges, and isDigraph
// as global variables. which must be accecible from Node and Edge.
	function init() {
		// "this" is [object Window]
		this.n = nodes.length;
		this.m = edges.length;
		this.Nodes = new Array(n);
		this.Edges = new Array(m);
		this.isDigraph = isdigraph;

		for (var i=0; i<n; i++) {
			Nodes[i] = new Node(nodes[i],i);
			Nodes[i].setwh(context);
		}
		for (var i=0; i<m; i++) {
			Edges[i] = new Edge(edges[i],i);
		}
		Edge.prototype.isDigraph = isdigraph;
		Edge.prototype.fs = fontSize(context);
	}
	init();
}
//
//	Node
//
function Node(node,idx) {
	if (node.length<3) {
		return this;
	}
	// Properties
	this.name = node[0];
	this.num = idx;
	this.xy = {x: node[1], y: node[2]};
	this.wh = {w:0, h:0};	// width and height (tmp)
	this.deltaP = -1;	// the first edge whose init node is this (tmp)
	this.deltaM = -1;	// the first edge whose term node is this (tmp)
}
// Methods
Node.prototype.setwh = function(context) {
	var fs = fontSize(context);
	this.wh = {
		w: context.measureText(this.name).width+fs/4,
		h: fs+fs/4
	};
}
Node.prototype.appendInitEdge = function(edge) {
	if (this.deltaP<0) {
		this.deltaP=edge;
	} else {
		Edges[this.deltaP].appendInitEdge(edge);
	}
}
Node.prototype.appendTermEdge = function(edge) {
	if (this.deltaM<0) {
		this.deltaM=edge;
	} else {
		Edges[this.deltaM].appendTermEdge(edge);
	}
}
Node.prototype.drawNode = function(context,node) {	// drawNode for graphs
	context.textAlign = "center";

	var w = node.wh.w;
	var h = node.wh.h;
	var x = node.xy.x-w/2;
	var y = node.xy.y-h/2;

	context.beginPath();
	context.moveTo(x,y);
	context.lineTo(x+w,y);
	context.lineTo(x+w,y+h);
	context.lineTo(x,y+h);
	context.closePath();
	context.fill();
	context.stroke();
	
	//context.fillRect(x,y,w,h);
	//context.rect(x,y,w,h);

	context.fillStyle = 'black';
	context.fillText(node.name,node.xy.x,node.xy.y+node.wh.h/5);
}
Node.prototype.paint = function(context) {
	context.fillStyle = 'white';
	context.strokeStyle = 'black';
	drawNode(context,this);
}	// may be overrided

//
//	Edge
//
function Edge(edge,idx) {
	if (edge.length<3) {
		return this;
	}
	// Properties
	this.name = edge[0];
	this.num = idx;
	this.initv = vsearch(edge[1]);	// init node
	this.termv = vsearch(edge[2]);	// term node
	this.initxy = {x:0,y:0};	// pos of init node
	this.termxy = {x:0,y:0};	// pos of term node
	this.deltaP = -1;		// next edge who shares the init node
	this.deltaM = -1;		// next edge who shares the term node

	// initialize
	Nodes[this.initv].appendInitEdge(this.num);
	Nodes[this.termv].appendTermEdge(this.num);
	setInitTermXY(this);
	// end of initialize

	// local functions to initialize
	function vsearch(name) {
		var v=-1;
		for (var i=0; i<n; i++) {
			if (Nodes[i].name === name) {
				v = i;
				break;
			}
		}
		return v;
	}
	function edgexy(vec,box) {
		var x1;
		var y1;
		if (Math.abs(box.w*vec.y)>=Math.abs(box.h*vec.x)) {
			x1 = ((vec.y>=0)?1:-1)*vec.x*box.h/vec.y/2;
			y1 = ((vec.y>=0)?1:-1)*box.h/2;
		} else {
			x1 = ((vec.x>=0)?1:-1)*box.w/2;
			y1 = ((vec.x>=0)?1:-1)*vec.y*box.w/vec.x/2;
		}
		return {x:x1,y:y1};
	}
	function negxy(a) { return {x:-a.x,y:-a.y}; }
	function addxy(a,b) { return {x:a.x+b.x,y:a.y+b.y}; }
	function setInitTermXY(edge) {
		var ipos=Nodes[edge.initv].xy;
		var tpos=Nodes[edge.termv].xy;
		var ibox=Nodes[edge.initv].wh;
		var tbox=Nodes[edge.termv].wh;
		var vec = {x:ipos.x-tpos.x, y: ipos.y-tpos.y};
		var x1 = edgexy(negxy(vec),ibox);
		var x2 = edgexy(vec,tbox);

		edge.initxy = addxy(x1,ipos);
		edge.termxy = addxy(x2,tpos);
	}
}
// Methods
Edge.prototype.appendInitEdge = Node.prototype.appendInitEdge;
Edge.prototype.appendTermEdge = Node.prototype.appendTermEdge;
Edge.prototype.drawEdge = function(context,edge) {	// draw Edge
	context.beginPath();
	context.moveTo(edge.initxy.x,edge.initxy.y);
	context.lineTo(edge.termxy.x,edge.termxy.y);
	context.stroke();
	var vec = {x:edge.initxy.x-edge.termxy.x, y:edge.initxy.y-edge.termxy.y};
	if (isDigraph) {		// draw Arrow
		var r = Math.sqrt(vec.x*vec.x+vec.y*vec.y)/16.0;
		var aa = vec.x/r;
		var bb = vec.y/r;
		context.beginPath();
		context.moveTo(edge.termxy.x,edge.termxy.y);
		context.lineTo(edge.termxy.x+(aa*12+bb*5)/13,edge.termxy.y+(-aa*5+bb*12)/13);
		context.stroke();
		context.beginPath();
		context.moveTo(edge.termxy.x,edge.termxy.y);
		context.lineTo(edge.termxy.x+(aa*12-bb*5)/13,edge.termxy.y+(aa*5+bb*12)/13);
		context.stroke();
	}
}
Edge.prototype.paint = function(context) { drawEdge(context,this); }

//
// utility function
//
function fontSize(context) {
	var s = context.font;
	s = (s.split('px'))[0];
	s = s.split(' ')
	var fs = parseInt(s[s.length-1]);
	return fs;
}
