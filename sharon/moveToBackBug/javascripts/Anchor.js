//dojo.provide("dojox.diagram.Anchor");
dojo.provide("Anchor");
dojo.require("dojox.gfx");

(function(){
	var ta=dojox.diagram;
	//ta.Anchor=function(an, id, isControl){
	Anchor=function(an, id, isControl){
		var self=this;
		var size=6;	//	.5 * size of anchor. originally: size = 4
		var rect=null;

		this.type=function(){ return "Anchor"; };
		this.shapebase=an;

		this.id=id; // curent anchor id, such as start, NE, end, 
		//this._key="anchor-" + ta.Anchor.count++;
		this._key="anchor-" + Anchor.count++;
		this.shape=null;
		this.isControl=(isControl!=null)?isControl:true;

		this.beginEdit=function(){
			this.shapebase.beginEdit(ta.CommandTypes.Modify);
		};
		this.endEdit=function(){
			this.shapebase.endEdit();
		};
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
			}
			//an.drawBBox();
			//this.disable();
		};
		this.setUndo=function(){ an.setUndo(); };

		this.enable=function(){
			//debugger;
			if(!an.shape) return;
			an.figure._add(this);
			rect={ x:an[id].x-size, y:an[id].y-size, width:size*2, height:size*2 };
			this.shape=an.shape.createRect(rect)
				.setStroke({ color:"blue", width:1 })//width:1
				.setFill([255,255,255,0.35]);
			this.shape.getEventSource().setAttribute("id", self._key);
			//this.shape.getEventSource().setAttribute("shape-rendering", "crispEdges");
		};
		this.disable=function(){
			an.figure._remove(this);
			if(an.shape) an.shape.remove(this.shape);
			this.shape=null;
			rect=null;
		};
	};
	//ta.Anchor.count=0;
	Anchor.count=0;
})();
