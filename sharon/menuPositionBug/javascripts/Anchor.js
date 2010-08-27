//dojo.provide("dojox.diagram.Anchor");
dojo.provide("Anchor");
dojo.require("dojox.gfx");

(function(){
	var ta=dojox.diagram;
	//ta.Anchor=function(an, id, isControl){
	Anchor=function(an, id, isControl){
		// summary
		//		This represents each corner rectangle
		//		size: the size of corner rectangles/anchor
		//		rect: the corner rectangle
		//		type: always "Anchor" in this case
		//		key: anchor's key, accumunated by 1
		//		shape: the corner rectangle shape
		//		shapebase the base shape, from the argument 'an'
		//		id: anchor id, eg., start, NE, N
		//		isControl: null by default
		
		
		var self=this;
		var size=6;	//	.5 * size of anchor. originally: size = 4
		var rect=null;
		this.type=function(){ return "Anchor"; };
		//this._key="anchor-" + ta.Anchor.count++;
		this._key="anchor-" + Anchor.count++;
		this.shape=null;  
		
		this.shapebase=an;
		this.id=id; 		
		this.isControl=(isControl!=null)?isControl:true;

		// start to edit the anchor if any corner rectanle is clicked
		this.beginEdit=function(){
			this.shapebase.beginEdit(ta.CommandTypes.Modify);
		};
		// finish editing
		this.endEdit=function(){
			this.shapebase.endEdit();
		};
		//resize the shape when any corner rectangle is clicked and dragged
		this.doChange=function(pt){
			//debugger;
			if(!this.shape){
				this.enable();
			}
			if(this.isControl&&this.shape) {
				this.shape.applyTransform(pt);
				//this.disable();
			}
			else{
				an.transform.dx+=pt.dx;
				an.transform.dy+=pt.dy;
			}
			
		};
		//resize the shape when any corner rectangle is clicked and dragged
		this.setBinding=function(pt){
			//debugger;
			//an[id]={ x: an[id].x+pt.dx, y:an[id].y+pt.dy };
			if(!this.shape){
				this.enable();
			}
			if(this.shape){
				if(id=="start"){
					this.shape.getEventSource().style.cursor="nw-resize";
					an[id]={ x: an[id].x+pt.dx, y:an[id].y+pt.dy };
				}
				if(id=="N"){
					this.shape.getEventSource().style.cursor="n-resize";
					an[id]={ x: an[id].x, y:an[id].y+pt.dy };
				}
				if(id=="NE"){
					this.shape.getEventSource().style.cursor="ne-resize";
					an[id]={ x: an[id].x+pt.dx, y:an[id].y+pt.dy };
				}
				if(id=="E"){
					this.shape.getEventSource().style.cursor="e-resize";
					an[id]={ x: an[id].x+pt.dx, y:an[id].y };
				}
				if(id=="end"){
					this.shape.getEventSource().style.cursor="se-resize";
					an[id]={ x: an[id].x+pt.dx, y:an[id].y+pt.dy };
				}
				if(id=="S"){
					this.shape.getEventSource().style.cursor="s-resize";
					an[id]={ x: an[id].x, y:an[id].y+pt.dy };
				}
				if(id=="SW"){
					this.shape.getEventSource().style.cursor="sw-resize";
					an[id]={ x: an[id].x+pt.dx, y:an[id].y+pt.dy };
				}
				if(id=="W"){
					this.shape.getEventSource().style.cursor="w-resize";
					an[id]={ x: an[id].x+pt.dx, y:an[id].y };
				}
				if(id=="control"){
					an[id]={ x: an[id].x+pt.dx, y:an[id].y+pt.dy };
				}
			an.setCurrentAnchor(id);
			an.draw();
			// update every anchor and boundig box for each shape, except connectors
			if(an.type()!="Connector"){
				an.setMode(ta.ShapeBase.Modes.View);
				an.setMode(ta.ShapeBase.Modes.Edit);
				}
			}
			//delete connectors' two corner rectangles.
			if(an.type()=="Connector") this.disable();
		};
		
		this.setUndo=function(){ an.setUndo(); };

		//generate the corner rectangles if the shape is in edit mode
		this.enable=function(){
			//debugger;
			if(!an.shape) return;
			an.figure._add(this);
			rect={ x:an[id].x-size, y:an[id].y-size, width:size*2, height:size*2 };
			this.shape=an.shape.createRect(rect)
				.setStroke({ color:"blue", width:1 })
				.setFill([255,255,255,0.35]);
			this.shape.getEventSource().setAttribute("id", self._key);
			//this.shape.getEventSource().setAttribute("shape-rendering", "crispEdges");
		};
		//delete the corner rectangles if the shape goes back to view mode.
		this.disable=function(){
			an.figure._remove(this);
			if(an.shape&&this.shape) an.shape.remove(this.shape);
			this.shape=null;
			rect=null;
		};
	};
	//ta.Anchor.count=0;
	Anchor.count=0;
})();
