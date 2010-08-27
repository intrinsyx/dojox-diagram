//adopted from dojox.gfx.move
//added visual clues for selection

dojo.provide("mymove");
dojo.experimental(" mymove");
//corner rectangles, rNW: top left, rNE: top right, rSE: bottom right, rSW: bottom left, dashR: the dashed rectangle
// cc: the center circle for connectors;
// rN: top, rE: right, rS: bottom, rW: left
var rNW,rN,rNE,rE,rSE,rS,rSW,rW,dashR, cc;
// corner rectangle dimention: cr
var cr = 5; //10*10
//center circle's radius*2
var ccr = 0;
var shapeid;
var connectorI;


connector = function(shape, e){
	this.shape = shape;
	this.lastX_ = e.clientX
	this.lastY_ = e.clientY;
//debugger;
	connectorI = surface.createLine({x1: this.lastX_, y1: this.lastY_, x2: this.lastX_, y2: this.lastY_})
										.setStroke({color: "red", width:2})

	//shapeid = e.target.getAttribute("shapeid");
	//connectorI.getEventSource().setAttribute('shapeid', "corner-nw");

	this.events = [
		connectorI.connect("onmousedown", this, "onMouseDown"),

		// cancel text selection and text dragging
		//dojo.connect(this.handle, "ondragstart",   dojo, "stopEvent"),
		//dojo.connect(this.handle, "onselectstart", dojo, "stopEvent")
	];
};

dojo.extend( connector, {
	// methods
	destroy: function(){
		// summary: stops watching for possible move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, "disconnect", this.shape);
		this.events = this.shape = null;
	},
	
	// mouse event processors
	onMouseDown: function(e){
		// summary: event processor for onmousedown
		// e: Event: mouse event
		//debugger;
		this.events.push(rNW.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rNW.connect("onmouseup", this, "onMouseUp"));

		this.lastY_ = e.clientY;
		//debugger;

		dojo.stopEvent(e);
	},
	onMouseMove: function(e){
		// summary: event processor for onmousemove, used only for delayed drags
		// e: Event: mouse event
		//debugger;
		var bx2 = e.clientX;
		var by2 = e.clientY;
		var deltaX = bx2-this.lastX_;
		var deltaY = by2-this.lastY_;
		//for line/connector
		//debugger;
		connectorI.setShape({x1: this.lastX_-container_pos.x, y1: this.lastY_-container_pos.y,x2: bx2-container_pos.x, y2: by2-container_pos.y});

		this.lastX_ = bx2;
		this.lastY_ = by2;
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		// summary: event processor for onmouseup, used only for delayed delayed drags
		// e: Event: mouse event
		connectorI.disconnect(this.events.pop());
	}
});


cornerGroup = function(shape, e){
	this.shape = shape;
	this.lastX_ = e.clientX
	this.lastY_ = e.clientY;

	if(rNW){
		var parent = rNW.getParent();
		parent.remove(rNW);
	}
	if(rN){
		var parent = rN.getParent();
		parent.remove(rN);
	}
	if(rNE){
		var parent = rNE.getParent();
		parent.remove(rNE);
	}
	if(rE){
		var parent = rE.getParent();
		parent.remove(rE);
	}
	if(rSE){
		var parent = rSE.getParent();
		parent.remove(rSE);
	}
	if(rS){
		var parent = rS.getParent();
		parent.remove(rS);
	}
	if(rSW){
		var parent = rSW.getParent();
		parent.remove(rSW);
	}
	if(rW){
		var parent = rW.getParent();
		parent.remove(rW);
	}
	if(dashR){
		var parent = dashR.getParent();
		parent.remove(dashR);
	}
	if(cc){
		var parent = cc.getParent();
		parent.remove(cc);
	}
	
	rNW = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rN = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rNE = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rE = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rSE = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rS = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rSW = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	rW = this.shape.getParent().createRect(dojox.gfx.defaultRect);
	dashR = this.shape.getParent().createPolyline(dojox.gfx.defaultPolyline);
	cc = this.shape.getParent().createCircle(dojox.gfx.defaultCircle);
	
	shapeid = e.target.getAttribute("shapeid");
	if(shapeid.search("connect")!=-1){
		// two ends of a line, rNW, rNE do not mean the direction
		rNW.setShape({type: "rect", x:this.shape.getShape().x1-cr, y: this.shape.getShape().y1-cr, width:cr*2, height:cr*2})
					.setFill("#0F0")
					.setStroke({})
					;
		rNW.getEventSource().style.cursor="nw-resize";
		rNE.setShape({type: "rect", x: this.shape.getShape().x2-cr, y: this.shape.getShape().y2-cr, width:cr*2, height:cr*2})
					.setFill("#0F0")
					.setStroke({})
					;
		rNE.getEventSource().style.cursor="se-resize";
	}
	
	else if(shapeid.search("circle")!=-1){
		//console.log("shape:", this.shape.getShape().cx+","+this.shape.getShape().cy+","+this.shape.getShape().rx+","+this.shape.getShape().ry);
		// circle or ellipse.getBoundingBox() doesn't return the actual coordinates, so use getShape();
		var cxc = this.shape.getShape().cx;
		var cyc = this.shape.getShape().cy;
		var rxc = this.shape.getShape().rx;
		var ryc = this.shape.getShape().ry;
		rNW.setShape({type: "rect", x: cxc-rxc-cr, y: cyc-ryc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rNW.getEventSource().style.cursor="nw-resize";
		rN.setShape({type: "rect", x: cxc-cr, y: cyc-ryc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rN.getEventSource().style.cursor="n-resize";
		rNE.setShape({type: "rect", x: cxc+rxc-cr, y: cyc-ryc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rNE.getEventSource().style.cursor="ne-resize";
		rE.setShape({type: "rect", x: cxc+rxc-cr, y: cyc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rE.getEventSource().style.cursor="e-resize";
		rSE.setShape({type: "rect", x: cxc+rxc-cr, y: cyc+ryc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rSE.getEventSource().style.cursor="se-resize";
		rS.setShape({type: "rect", x: cxc-cr, y: cyc+ryc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rS.getEventSource().style.cursor="s-resize";
		rSW.setShape({type: "rect", x: cxc-rxc-cr, y: cyc+ryc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rSW.getEventSource().style.cursor="sw-resize";
		rW.setShape({type: "rect", x: cxc-rxc-cr, y: cyc-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rW.getEventSource().style.cursor="w-resize";
		dashR.setShape({type: "polyline", points:[{x: cxc-rxc, y: cyc-ryc}, {x:cxc+rxc, y: cyc-ryc},
		{x: cxc+rxc, y:cyc+ryc},{x:cxc-rxc, y:cyc+ryc},{x: cxc-rxc, y: cyc-ryc}]})
						.setStroke("DashDot")
						;
		cc.setShape({type:"circle", cx:cxc, cy:cyc, r:ccr})
						.setFill("#def")
						.setStroke({color: "blue"})
						;
		cc.getEventSource().style.cursor="pointer";
		
	}
	else{
		//debugger;
		// for rectangle, or rounded rectangle
		var r = this.shape.getBoundingBox();
		//console.log("boundingbox:", r.x+","+r.y+","+r.width+","+r.height);
		rNW.setShape({type: "rect", x: r.x-cr, y: r.y-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rNW.getEventSource().style.cursor="nw-resize";
		rN.setShape({type: "rect", x: r.x+r.width/2-cr, y: r.y-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rN.getEventSource().style.cursor="n-resize";
		rNE.setShape({type: "rect", x: r.x+r.width-cr, y: r.y-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rNE.getEventSource().style.cursor="ne-resize";
		rE.setShape({type: "rect", x: r.x+r.width-cr, y: r.y+r.height/2-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rE.getEventSource().style.cursor="e-resize";
		rSE.setShape({type: "rect", x: r.x+r.width-cr, y: r.y+r.height-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rSE.getEventSource().style.cursor="se-resize";
		rS.setShape({type: "rect", x: r.x+r.width/2-cr, y: r.y+r.height-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rS.getEventSource().style.cursor="s-resize";
		rSW.setShape({type: "rect", x: r.x-cr, y: r.y+r.height-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rSW.getEventSource().style.cursor="sw-resize";
		rW.setShape({type: "rect", x: r.x-cr, y: r.y+r.height/2-cr, width:cr*2, height:cr*2})
						.setFill("#0F0")
						.setStroke({})
						;
		rW.getEventSource().style.cursor="w-resize";
		dashR.setShape({type: "polyline", points:[{x: r.x, y: r.y}, {x:r.x+r.width, y: r.y},
		{x: r.x+r.width, y:r.y+r.height},{x:r.x, y:r.y+r.height},{x: r.x, y: r.y}]})
						.setStroke("DashDot")
						;
		cc.setShape({type:"circle", cx:r.x+r.width/2, cy:r.y+r.height/2, r:ccr})
						.setFill("#def")
						.setStroke({color: "blue"})
						;
		cc.getEventSource().style.cursor="pointer";
	}
	rNW.getEventSource().setAttribute('shapeid', "corner-nw");
	rN.getEventSource().setAttribute('shapeid', "corner-n");
	rNE.getEventSource().setAttribute('shapeid', "corner-ne");
	rE.getEventSource().setAttribute('shapeid', "corner-e");
	rSE.getEventSource().setAttribute('shapeid', "corner-se");
	rS.getEventSource().setAttribute('shapeid', "corner-s");
	rSW.getEventSource().setAttribute('shapeid', "corner-sw");
	rW.getEventSource().setAttribute('shapeid', "corner-w");
	dashR.getEventSource().setAttribute('shapeid', "dash-r");
	cc.getEventSource().setAttribute("shapeid", "center");
	this.events = [
		rNW.connect("onmousedown", this, "onMouseDown"),
		rN.connect("onmousedown", this, "onMouseDown"),
		rNE.connect("onmousedown", this, "onMouseDown"),
		rE.connect("onmousedown", this, "onMouseDown"),
		rSE.connect("onmousedown", this, "onMouseDown"),
		rS.connect("onmousedown", this, "onMouseDown"),
		rSW.connect("onmousedown", this, "onMouseDown"),
		rW.connect("onmousedown", this, "onMouseDown"),
		dashR.connect("onmousedown", this, "onMouseDown"),
		cc.connect("onmousedown", this, "onMouseDown"),
		// cancel text selection and text dragging
		//dojo.connect(this.handle, "ondragstart",   dojo, "stopEvent"),
		//dojo.connect(this.handle, "onselectstart", dojo, "stopEvent")
	];
};

dojo.extend( cornerGroup, {
	// methods
	destroy: function(){
		// summary: stops watching for possible move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, "disconnect", this.shape);
		this.events = this.shape = null;
	},
	
	// mouse event processors
	onMouseDown: function(e){
		// summary: event processor for onmousedown
		// e: Event: mouse event
		this.events.push(rNW.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rN.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rNE.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rE.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rSE.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rS.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rSW.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rW.connect("onmousemove", this, "onMouseMove"));
		this.events.push(dashR.connect("onmousemove", this, "onMouseMove"));
		this.events.push(cc.connect("onmousemove", this, "onMouseMove"));
		this.events.push(rNW.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rN.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rNE.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rE.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rSE.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rS.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rSW.connect("onmouseup", this, "onMouseUp"));
		this.events.push(rW.connect("onmouseup", this, "onMouseUp"));
		this.events.push(dashR.connect("onmouseup", this, "onMouseUp"));
		this.events.push(cc.connect("onmouseup", this, "onMouseUp"));
		this.lastX_ = e.clientX;
		this.lastY_ = e.clientY;
		
		connectorI = surface.createLine({x1: this.lastX_, y1: this.lastY_, x2: this.lastX_, y2: this.lastY_}).setStroke({color: "red", width:2})
		//debugger;

		dojo.stopEvent(e);
	},
	onMouseMove: function(e){
		// summary: event processor for onmousemove, used only for delayed drags
		// e: Event: mouse event
		//debugger;
		var bx2 = e.clientX;
		var by2 = e.clientY;
		var deltaX = bx2-this.lastX_;
		var deltaY = by2-this.lastY_;
		//for line/connector
		if(shapeid.search("connect")!=-1){
			// line(connector)'s two ends
			var bx1 = this.shape.getShape().x1;
			var by1 = this.shape.getShape().y1;
			var bx12 = this.shape.getShape().x2;
			var by12 = this.shape.getShape().y2;
			//two ends of a line, rNW, rNE don't mean the direction
			if(e.target.getAttribute("shapeid")=="corner-nw"){
				this.shape.setShape({x1:bx1+deltaX,y1:by1+deltaY});
				rNW.applyLeftTransform({dx: deltaX, dy:deltaY});
			}
			if(e.target.getAttribute("shapeid")=="corner-ne"){
				this.shape.setShape({x2:bx12+deltaX,y2:by12+deltaY});
				rNE.applyLeftTransform({dx: deltaX, dy: deltaY});
			}
		}
		// for circle/ellipse
		else if(shapeid.search("circle")!=-1){
			//circle's bounding box, the x, y coordinates on the top left corner, the width and height.
			var cx1=this.shape.getShape().cx;
			var cy1=this.shape.getShape().cy;
			var rx1 = this.shape.getShape().rx;
			var ry1= this.shape.getShape().ry;
			
			//console.log("shape.getShape():",bx1+","+by1+",width/height:"+w+"/"+h);
			//this.shape.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h});
			if(e.target.getAttribute("shapeid")=="corner-nw"){
				//debugger;
				this.shape.setShape({cx:cx1+deltaX/2,cy:cy1+deltaY/2,rx:rx1-deltaX/2, ry: ry1-deltaY/2});
				//dashR.setShape({x:bx1+deltaX,y:by1+deltaY,width:w-(deltaX), height: h-(deltaY)});
				rNW.applyLeftTransform({dx:deltaX, dy: deltaY});
				rN.applyLeftTransform({dx:deltaX/2, dy: deltaY});
				rNE.applyLeftTransform({dy: deltaY});
				rE.applyLeftTransform({dy: deltaY/2});
				// nothing for rSE
				rS.applyLeftTransform({dx: deltaX/2});
				rSW.applyLeftTransform({dx:deltaX});
				rW.applyLeftTransform({dx:deltaX, dy: deltaY/2});
	
			}
			if(e.target.getAttribute("shapeid")=="corner-n"){
				//debugger;
				this.shape.setShape({cx:cx1,cy:cy1+deltaY/2,rx:rx1, ry: ry1-deltaY/2});
				//dashR.setShape({x:bx1+deltaX,y:by1+deltaY,width:w-(deltaX), height: h-(deltaY)});
				rNW.applyLeftTransform({dy: deltaY});
				rN.applyLeftTransform({dy: deltaY});
				rNE.applyLeftTransform({dy: deltaY});
				rE.applyLeftTransform({dy: deltaY/2});
				//nothing for rSE, rS, rSW
				rW.applyLeftTransform({dy:deltaY/2});
	
			}
			if(e.target.getAttribute("shapeid")=="corner-ne"){
				this.shape.setShape({cx:cx1+deltaX/2,cy:cy1+deltaY/2,rx:rx1+deltaX/2, ry: ry1-deltaY/2});
				//dashR.setShape({x:bx1,y:by1+deltaY,width:deltaX+w, height: h-(deltaY)});	
				rNW.applyLeftTransform({dy: deltaY});
				rN.applyLeftTransform({dx:deltaX/2, dy: deltaY});
				rNE.applyLeftTransform({dx:deltaX, dy: deltaY});
				rE.applyLeftTransform({dx:deltaX, dy: deltaY/2});
				rSE.applyLeftTransform({dx:deltaX});
				rS.applyLeftTransform({dx:deltaX/2});
				rW.applyLeftTransform({dy: deltaY/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-e"){
				this.shape.setShape({cx:cx1+deltaX/2,cy:cy1,rx:rx1+deltaX/2, ry: ry1});
				//dashR.setShape({x:bx1,y:by1+deltaY,width:deltaX+w, height: h-(deltaY)});	
				//nothing for rNW, rW, rSW
				rN.applyLeftTransform({dx:deltaX/2});
				rNE.applyLeftTransform({dx:deltaX});
				rE.applyLeftTransform({dx:deltaX});
				rSE.applyLeftTransform({dx:deltaX});
				rS.applyLeftTransform({dx:deltaX/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-se"){
				this.shape.setShape({cx:cx1+deltaX/2,cy:cy1+deltaY/2,rx:rx1+deltaX/2, ry: ry1+deltaY/2});
				//dashR.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h});
				rN.applyLeftTransform({dx:deltaX/2});
				rNE.applyLeftTransform({dx:deltaX});
				rE.applyLeftTransform({dx:deltaX, dy: deltaY/2});
				rSE.applyLeftTransform({dx:deltaX, dy: deltaY});
				rS.applyLeftTransform({dx:deltaX/2, dy: deltaY});
				rSW.applyLeftTransform({dy: deltaY});
				rW.applyLeftTransform({dy: deltaY/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-s"){
				this.shape.setShape({cx:cx1,cy:cy1+deltaY/2,rx:rx1, ry: ry1+deltaY/2});
				//dashR.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h});
				rE.applyLeftTransform({dy: deltaY/2});
				rSE.applyLeftTransform({dy: deltaY});
				rS.applyLeftTransform({dy: deltaY});
				rSW.applyLeftTransform({dy: deltaY});
				rW.applyLeftTransform({dy: deltaY/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-sw"){
				this.shape.setShape({cx:cx1+deltaX/2,cy:cy1+deltaY/2,rx:rx1-deltaX/2, ry: ry1+deltaY/2});
				//dashR.setShape({x:bx1+deltaX,y:by1,width:w-(deltaX), height: deltaY+h});
				rNW.applyLeftTransform({dx:deltaX});
				rN.applyLeftTransform({dx:deltaX/2});
				rE.applyLeftTransform({dy:deltaY/2});
				rSE.applyLeftTransform({dy: deltaY});
				rS.applyLeftTransform({dx:deltaX/2, dy:deltaY});
				rSW.applyLeftTransform({dx:deltaX,dy:deltaY});
				rW.applyLeftTransform({dx:deltaX,dy:deltaY/2});
			}	
			if(e.target.getAttribute("shapeid")=="corner-w"){
				this.shape.setShape({cx:cx1+deltaX/2,cy:cy1,rx:rx1-deltaX/2, ry: ry1});
				//dashR.setShape({x:bx1+deltaX,y:by1,width:w-(deltaX), height: deltaY+h});
				rNW.applyLeftTransform({dx:deltaX});
				rN.applyLeftTransform({dx:deltaX/2});
				rS.applyLeftTransform({dx:deltaX/2});
				rSW.applyLeftTransform({dx:deltaX});
				rW.applyLeftTransform({dx:deltaX});
			}
			if(e.target.getAttribute("shapeid")=="center"){
				//connectorI.setShape({x1: this.lastX_-container_pos.x, y1: this.lastY_-container_pos.y,x2: bx2-container_pos.x, y2: by2-container_pos.y});
				// new connector
				//debugger;
				new connector(this.shape,e);
			}
		}
		else{
			//rectangle's bounding box, the x, y coordinates on the top left corner, the width and height.
			var bx1=this.shape.getBoundingBox().x;
			var by1=this.shape.getBoundingBox().y;
			var w = this.shape.getBoundingBox().width;
			var h = this.shape.getBoundingBox().height;
			
			//console.log("shape.getShape():",bx1+","+by1+",width/height:"+w+"/"+h);
			//this.shape.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h});
			if(e.target.getAttribute("shapeid")=="corner-nw"){
				this.shape.setShape({x:bx1+deltaX,y:by1+deltaY,width:w-(deltaX), height: h-(deltaY), r: roundedR});
				//dashR.setShape({x:bx1+deltaX,y:by1+deltaY,width:w-(deltaX), height: h-(deltaY)});
				rNW.applyLeftTransform({dx: deltaX, dy: deltaY});
				rN.applyLeftTransform({dx: deltaX/2, dy: deltaY});
				rNE.applyLeftTransform({dy: deltaY});
				rE.applyLeftTransform({dy: deltaY/2});
				rS.applyLeftTransform({dx: deltaX/2});
				rSW.applyLeftTransform({dx: deltaX});
				rW.applyLeftTransform({dx: deltaX, dy: deltaY/2});	
			}
			if(e.target.getAttribute("shapeid")=="corner-n"){
				this.shape.setShape({x:bx1,y:by1+deltaY,width:w, height: h-(deltaY), r: roundedR});
				//dashR.setShape({x:bx1+deltaX,y:by1+deltaY,width:w-(deltaX), height: h-(deltaY)});
				rNW.applyLeftTransform({dy: deltaY});
				rN.applyLeftTransform({dy: deltaY});
				rNE.applyLeftTransform({dy: deltaY});
				rE.applyLeftTransform({dy: deltaY/2});
				rW.applyLeftTransform({dy: deltaY/2});	
			}
			if(e.target.getAttribute("shapeid")=="corner-ne"){
				this.shape.setShape({x:bx1,y:by1+deltaY,width:deltaX+w, height: h-(deltaY), r: roundedR});
				//dashR.setShape({x:bx1,y:by1+deltaY,width:deltaX+w, height: h-(deltaY)});	
				rNW.applyLeftTransform({dy: deltaY});
				rN.applyLeftTransform({dx:deltaX/2, dy: deltaY});
				rNE.applyLeftTransform({dx:deltaX, dy: deltaY});
				rE.applyLeftTransform({dx:deltaX, dy: deltaY/2});
				rSE.applyLeftTransform({dx:deltaX});
				rS.applyLeftTransform({dx:deltaX/2});
				rW.applyLeftTransform({dy:deltaY/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-e"){
				this.shape.setShape({x:bx1,y:by1,width:deltaX+w, height: h, r: roundedR});
				//dashR.setShape({x:bx1,y:by1+deltaY,width:deltaX+w, height: h-(deltaY)});	
				rN.applyLeftTransform({dx:deltaX/2});
				rNE.applyLeftTransform({dx:deltaX});
				rE.applyLeftTransform({dx:deltaX});
				rSE.applyLeftTransform({dx:deltaX});
				rS.applyLeftTransform({dx:deltaX/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-se"){
				this.shape.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h, r: roundedR});
				//dashR.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h});
				rN.applyLeftTransform({dx:deltaX/2});
				rNE.applyLeftTransform({dx:deltaX});
				rE.applyLeftTransform({dx:deltaX,dy: deltaY/2});
				rSE.applyLeftTransform({dx:deltaX, dy: deltaY});
				rS.applyLeftTransform({dx:deltaX/2, dy: deltaY});
				rSW.applyLeftTransform({dy: deltaY});
				rW.applyLeftTransform({dy: deltaY/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-s"){
				this.shape.setShape({x:bx1,y:by1,width:w, height: deltaY+h, r: roundedR});
				//dashR.setShape({x:bx1,y:by1,width:deltaX+w, height: deltaY+h});
				rE.applyLeftTransform({dy: deltaY/2});
				rSE.applyLeftTransform({dy: deltaY});
				rS.applyLeftTransform({dy: deltaY});
				rSW.applyLeftTransform({dy: deltaY});
				rW.applyLeftTransform({dy: deltaY/2});
			}
			if(e.target.getAttribute("shapeid")=="corner-sw"){
				this.shape.setShape({x:bx1+deltaX,y:by1,width:w-(deltaX), height: deltaY+h, r: roundedR});
				//dashR.setShape({x:bx1+deltaX,y:by1,width:w-(deltaX), height: deltaY+h});
				rNW.applyLeftTransform({dx:deltaX});
				rN.applyLeftTransform({dx:deltaX/2});
				rE.applyLeftTransform({dy:deltaY/2});
				rSE.applyLeftTransform({dy: deltaY});
				rS.applyLeftTransform({dx:deltaX/2,dy: deltaY});
				rSW.applyLeftTransform({dx:deltaX,dy: deltaY});
				rW.applyLeftTransform({dx:deltaX,dy: deltaY/2});
			}	
			if(e.target.getAttribute("shapeid")=="corner-w"){
				this.shape.setShape({x:bx1+deltaX,y:by1,width:w-(deltaX), height: h, r: roundedR});
				//dashR.setShape({x:bx1+deltaX,y:by1,width:w-(deltaX), height: deltaY+h});
				rNW.applyLeftTransform({dx:deltaX});
				rN.applyLeftTransform({dx:deltaX/2});
				rS.applyLeftTransform({dx:deltaX/2});
				rSW.applyLeftTransform({dx:deltaX});
				rW.applyLeftTransform({dx:deltaX});
			}
			if(e.target.getAttribute("shapeid")=="center"){
				connectorI.setShape({x1: this.lastX_-container_pos.x, y1: this.lastY_-container_pos.y,x2: bx2-container_pos.x, y2: by2-container_pos.y});
				//debugger;
				//new connector(this.shape,e);
			}
		}	
		//this.shape.applyLeftTransform({dx: x - this.lastX_, dy: y - this.lastY_});
		this.lastX_ = bx2;
		this.lastY_ = by2;
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		// summary: event processor for onmouseup, used only for delayed delayed drags
		// e: Event: mouse event
		rNW.disconnect(this.events.pop());
		rN.disconnect(this.events.pop());
		rNE.disconnect(this.events.pop());
		rE.disconnect(this.events.pop());
		rSE.disconnect(this.events.pop());
		rS.disconnect(this.events.pop());
		rSW.disconnect(this.events.pop());
		rW.disconnect(this.events.pop());
		dashR.disconnect(this.events.pop());
		cc.disconnect(this.events.pop());
	}
});


 myMover = function(shape, e){
	// summary: an object, which makes a shape follow the mouse, 
	//	used as a default mover, and as a base class for custom movers
	// shape: dojox.gfx.Shape: a shape object to be moved
	// e: Event: a mouse event, which started the move;
	//	only clientX and clientY properties are used
	this.shape = shape;
	this.lastX = e.clientX
	this.lastY = e.clientY;	
	//console.log("screen x, y:", this.lastX+","+this.lastY)
	
	var group = this.shape.getParent().createGroup();
	group.add(this.shape);
	new cornerGroup(this.shape, e);
	group.add(rNW);
	group.add(rNE);
	group.add(rSE);
	group.add(rSW);
	group.add(dashR);
	//debugger;
	//group.add(connectorI);
	this.shape = group;
	//console.log("group in myMover:",group);
	//console.log("shape:", this.shape);
	//currentObject = new dojox.gfx.Shape(this.shape);	
	currentObject = this.shape;
		
	var d = document, firstEvent = dojo.connect(d, "onmousemove", this, "onFirstMove");
	this.shape.getEventSource().style.cursor="move";
	this.events = [
		dojo.connect(d, "ondblclick", this, "onDoubleClick"),
		dojo.connect(d, "onmousemove", this, "onMouseMove"),
		dojo.connect(d, "onmouseup",   this, "destroy"),
		// cancel text selection and text dragging
		dojo.connect(d, "ondragstart",   dojo, "stopEvent"),
		dojo.connect(d, "onselectstart", dojo, "stopEvent"),
		firstEvent
	];

	// set globals to indicate that move has started
	dojo.publish("/gfx/mymove/start", [this]);
	dojo.addClass(dojo.body(), "dojomyMove");
};

dojo.extend( myMover, {
	// mouse event processors
	
	onDoubleClick: function(e){
		//debugger;
		console.log("It's a double click!");
	},
	onMouseMove: function(e){
		// summary: event processor for onmousemove
		// e: Event: mouse event
		//debugger;
		var x = e.clientX;
		var y = e.clientY;
		this.shape.applyLeftTransform({dx: x - this.lastX, dy: y - this.lastY});
		this.lastX = x;
		this.lastY = y;
		dojo.stopEvent(e);
	},
	// utilities
	onFirstMove: function(){
		// summary: it is meant to be called only once
		dojo.disconnect(this.events.pop());
	},
	destroy: function(){
		// summary: stops the move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		// undo global settings
		dojo.publish("/gfx/mymove/stop", [this]);
		dojo.removeClass(dojo.body(), "dojomyMove");
		// destroy objects
		this.events = this.shape = null;
	}
});

 myMoveable = function(shape, params){
	// summary: an object, which makes a shape moveable
	// shape: dojox.gfx.Shape: a shape object to be moved
	// params: Object: an optional object with additional parameters;
	//	following parameters are recognized:
	//		delay: Number: delay move by this number of pixels
	//		mover: Object: a constructor of custom Mover
	this.shape = shape;
	this.delay = (params && params.delay > 0) ? params.delay : 0;
	this.mover = (params && params.mover) ? params.mover :  myMover;
	this.events = [
		this.shape.connect("onmousedown", this, "onMouseDown"),
		// cancel text selection and text dragging
		//dojo.connect(this.handle, "ondragstart",   dojo, "stopEvent"),
		//dojo.connect(this.handle, "onselectstart", dojo, "stopEvent")
	];
};

dojo.extend( myMoveable, {
	// methods
	destroy: function(){
		// summary: stops watching for possible move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, "disconnect", this.shape);
		this.events = this.shape = null;
	},
	
	// mouse event processors
	onMouseDown: function(e){
		// summary: event processor for onmousedown, creates a Mover for the shape
		// e: Event: mouse event
		//debugger;
		if(this.delay){
			//debugger;
			this.events.push(this.shape.connect("onmousemove", this, "onMouseMove"));
			this.events.push(this.shape.connect("onmouseup", this, "onMouseUp"));
			this._lastX = e.clientX;
			this._lastY = e.clientY;
		}
		else if(mode&&mode=="connect"){
			var bb = this.shape.getBoundingBox();
			connectorI = surface.createLine({x1: bb.x+bb.width/2, y1: bb.y+bb.height/2, x2: bb.x+bb.width/2, y2: bb.y+bb.height/2})
										.setStroke({color: "red", width:2})
			//debugger;
			this.events.push(this.connectorI.connect("onmousemove", this, "onMouseMove"));
			this.events.push(this.connectorI.connect("onmouseup", this, "onMouseUp"));
			//dojo.connect(connectorI, "onmousemove", onMouseMove);
			
		}
		else{
			//debugger;
			new this.mover(this.shape, e);
			
		}

		dojo.stopEvent(e);
	},
	onMouseMove: function(e){
		// summary: event processor for onmousemove, used only for delayed drags
		// e: Event: mouse event
		if(Math.abs(e.clientX - this._lastX) > this.delay || Math.abs(e.clientY - this._lastY) > this.delay){
			this.onMouseUp(e);
			new this.mover(this.shape, e);
		}
		if(mode&&mode=="connect"){
			//debugger;
			console.log("bounding box/myMovable:",this.shape.getBoundingBox());
			mode = null;
		}
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		// summary: event processor for onmouseup, used only for delayed delayed drags
		// e: Event: mouse event
		this.shape.disconnect(this.events.pop());
		this.shape.disconnect(this.events.pop());
		this.connectorI.disconnect(this.events.pop());
		this.connectorI.disconnect(this.events.pop());
	}
});
