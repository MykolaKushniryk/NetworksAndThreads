//
//	Heap Sort
//	Copyright (C) Kenji Ikeda 2015
//
function Heap(nmax,compfunc) {
	this.NMAX = nmax;		// max of data length
	this.v_idx = new Array(nmax);	// vec of indices (heap)
					// v_idx:idx_v->idx_data
	this.v_inv = new Array(nmax);	// v_inv:idx_data->idx_v
	this.n = 0;			// number of data in the heap
	this.comp = compfunc;		// comparison function
}

Heap.prototype.swap = function(i,j) {
	var x = this.v_idx[i];
	var y = this.v_idx[j];
	this.v_idx[i] = y;
	this.v_idx[j] = x;
	this.v_inv[x] = j;
	this.v_inv[y] = i;
}

Heap.prototype.sift = function(i) {
	var x = this.v_idx[i];
	var j = 2*i+1;
	if (j>this.n-1) { return; }
	if (j<this.n-1 && this.comp(this.v_idx[j],this.v_idx[j+1])) { j++; }
	if (this.comp(x,this.v_idx[j])) {
		this.swap(i,j);
		this.sift(j);
	}
}
Heap.prototype.sift_up = function(i) {
	if (i==0) { return; }
	var x = this.v_idx[i];
	var j = ((i-1)-(i-1)%2)/2;
	if (this.comp(this.v_idx[j],x)) {
		this.swap(i,j);
	} else { return; }
	this.sift_up(j);
}

Heap.prototype.push = function(x) {
	if (this.n<this.NMAX) {
		this.v_idx[this.n] = x;
		this.v_inv[x] = this.n++;
		this.sift_up(this.n-1);
	}
}
Heap.prototype.pop = function() {
	if (this.n>0) {
		var x = this.v_idx[0];
		this.v_idx[0] = this.v_idx[--this.n];
		this.sift(0);
		return x;
	} else {
		return -1;
	}
}
Heap.prototype.replace = function(u) {	// when new val < old val
	var i = this.v_inv[u];
	if (i<this.n) {
		this.sift_up(i);
	}
}
