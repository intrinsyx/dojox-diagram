dojo.provide("dojox.diagram.Select");
dojo.require("dojox.diagram.ShapeBase");

(function(){
	var ta=dojox.diagram;
	ta.Select=function(figure, id){
		//summary:
		// 		a select icon in the toolbar
		//		take the rectangle template
		//		TD: use a selection rectangle for grouping
		
		ta.ShapeBase.call(this, figure, id);
		this.transform={ dx:0, dy:0 };
		this.start={x:0, y:0}; // the north-west point, keep the name = 'start' as from dojox.sketch.
		this.N={x:0, y:0}; // the north point
		this.NE={x:0, y:0}; // the north east point
		this.E={x:0, y:0}; // the east point;
		this.end={x:0, y:0}; // the south-east point, keep the name - 'end' as from dojox.sketch.
		this.S={x:0, y:0}; //the south point
		this.SW={x:0, y:0}; // the south-west point
		this.W={x:0, y:0};
		this.radius=1;
		this.textPosition={ x:196, y:196 };		
		this.textAlign="end";
		this.labelShape=null;
		this.rectShape=null;
		this.anchors.start=new Anchor(this, "start");
		this.anchors.end=new Anchor(this, "end");
		this.currentAnchor = null;
	};
	ta.Select.prototype=new ta.ShapeBase;
	var p=ta.Select.prototype;
	p.constructor=ta.Select;

	p.type=function(){ return 'Select'; };
	p.getType=function(){ return ta.Select; };
	
	p._pos=function(){
		/*	text position*/
		if(this.currentAnchor=="start"){
			this.N={x:this.start.x+(this.end.x-this.start.x)/2,y:this.start.y};
			this.NE.y=this.start.y;
			this.E.y=this.start.y+(this.end.y-this.start.y)/2;
			this.S.x=this.start.x+(this.end.x-this.start.x)/2;
			this.SW.x=this.start.x;
			this.W={x:this.start.x, y:this.start.y+(this.end.y-this.start.y)/2};		
		}
		if(this.currentAnchor=="N"){
			this.start.y=this.NE.y=this.N.y;		
			this.W.y=this.E.y=this.NE.y+(this.end.y-this.NE.y)/2;
		}
		if(this.currentAnchor=="NE"){
			this.start.y=this.NE.y;
			this.N={x: this.start.x+(this.NE.x-this.start.x)/2, y: this.NE.y};
			this.E={x: this.NE.x, y: this.NE.y +(this.end.y-this.NE.y)/2};
			this.end.x=this.NE.x;
			this.S.x=this.N.x;	
			this.W.y=this.E.y;		
		}
		if(this.currentAnchor=="E"){
			this.N.x=this.S.x=this.start.x+(this.E.x-this.start.x)/2;
			this.NE.x=this.end.x=this.E.x;
		}
		if(this.currentAnchor=="end"){
			this.N.x=this.start.x+(this.end.x-this.start.x)/2;
			this.NE.x=this.end.x;
			this.E={x: this.end.x, y: this.start.y+(this.end.y-this.start.y)/2};
			this.S={x: this.start.x+(this.end.x-this.start.x)/2, y: this.end.y};
			this.SW.y=this.end.y;
			this.W.y=this.start.y+(this.end.y-this.start.y)/2;			
		}
		if(this.currentAnchor=="S"){		
			this.W.y=this.E.y=this.start.y+(this.end.y-this.start.y)/2;
			this.SW.y=this.end.y=this.S.y;
		}
		if(this.currentAnchor=="SW"){
			this.start.x=this.SW.x;
			this.N={x:this.start.x+(this.NE.x-this.start.x)/2};
			this.E.y=this.start.y+(this.SW.y-this.start.y)/2;
			this.end.y=this.SW.y;
			this.S={x:this.N.x, y: this.end.y};
			this.W={x:this.start.x, y: this.start.y+(this.end.y-this.start.y)/2};	
		}
		if(this.currentAnchor=="W"){
			this.start.x=this.SW.x=this.W.x;
			this.N.x=this.S.x=this.start.x+(this.end.x-this.start.x)/2;		
		}
		var w=this.end.x-this.start.x;
		var h=this.end.y-this.start.y;
		/*var x=Math.min(this.start.x, this.NE.x, this.end.x);
		var y=Math.min(this.NE.y, this.end.y);
		var w=Math.max(this.start.x, this.NE.x, this.end.x);
		var h=Math.max(this.start.y, this.NE.y, this.end.y);
		this.start={ x:x, y:y };
		this.end={ x:w, y:h };*/
		
		this.textPosition={ x:this.start.x+(w/2),y:this.start.y+(h/2) };
		
	};
	
	p.apply=function(obj){
		if(!obj) return;
		if(obj.documentElement) obj=obj.documentElement;
		this.readCommonAttrs(obj);
		
		for(var i=0; i<obj.childNodes.length; i++){
			var c=obj.childNodes[i];
			if(c.localName=="text") 
			this.property('label',c.childNodes.length?c.childNodes[0].nodeValue:'');
			//else if(c.localName=="path"){
			else if(c.localName=="rect"){
				if(c.getAttribute('x')!==null) this.start.x=parseFloat(c.getAttribute('x'), 10);
				if(c.getAttribute('width')!==null) this.end.x=parseFloat(c.getAttribute('width'), 10)+parseFloat(c.getAttribute('x'), 10);
				if(c.getAttribute('y')!==null) this.start.y=parseFloat(c.getAttribute('y'), 10);
				if(c.getAttribute('height')!==null) this.end.y=parseFloat(c.getAttribute('height'), 10)+parseFloat(c.getAttribute('y'), 10);
				if(c.getAttribute('r')!==null) this.radius=parseFloat(c.getAttribute('r'),10);
				if(c.getAttribute('x')!==null&&c.getAttribute('width')!==null) {
					this.N.x=this.S.x=this.start.x+(this.end.x-this.start.x)/2;
					this.NE.x=this.E.x=this.end.x;
					this.SW.x=this.W.x=this.start.x;
				}
				if(c.getAttribute('y')!==null&&c.getAttribute('height')!==null)  {
					this.N.y=this.NE.y=this.start.y;
					this.E.y=this.W.y=this.start.y+(this.end.y-this.start.y)/2;
					this.S.y=this.SW.y=this.end.y;
				}
				//console.log("Select's coordinates:start:"+this.start.x+","+this.start.y+",end:"+this.end.x+","+this.end.y+",radius:"+this.radius);
			}
		}
	};
	p.initialize=function(obj){
		//	create, based on passed DOM node if available.
		var font=(ta.ShapeBase.labelFont)?ta.ShapeBase.labelFont:{family:"Times", size:"16px"};
		this.apply(obj);

		//	calculate the other positions
		//this._rot();
		this._pos();

		//	draw the shapes
		this.shape=this.figure.group.createGroup();
		this.shape.getEventSource().setAttribute("id", this.id);
		if(this.transform.dx||this.transform.dy) this.shape.setTransform(this.transform);

		this.rectShape=this.shape.createRect({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y, r:this.radius})
					//.setFill("#def")
					.moveToBack()
					.setStroke(this.property('stroke'))
					;	
		this.rectShape.getEventSource().setAttribute("shape-rendering","crispEdges");			
		this.labelShape=this.shape.createText({
			x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign
		}).setFont(font).setFill(this.property('fill'));
			
	};
	p.destroy=function(){
		if(!this.shape) return;
		this.shape.remove(this.labelShape);	
		this.shape.remove(this.rectShape);
		this.figure.group.remove(this.shape);
		this.shape=this.labelShape=this.rectShape=null;
	};
	p.getBBox=function(){
		var x=Math.min(this.start.x, this.end.x);
		var y=Math.min(this.start.y, this.end.y);
		var w=Math.max(this.start.x, this.end.x)-x;
		var h=Math.max(this.start.y, this.end.y)-y;
		//console.log("p.getBBox:"+x+","+y+","+w+","+h);
		return { x:x-2, y:y-2, width:w+4, height:h+4 };
	};
	p.getTextPosition=function(){
		return this.textPosition;
	};
	p.getTextAlign=function(){
		return this.textAlign;
	};

	p.draw=function(obj){
		this.apply(obj);
		//this._rot();
		this._pos();

		this.shape.setTransform(this.transform);

		this.rectShape.setShape({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y, r:this.radius})
					//.setFill("#def")
					.moveToBack()
					.setStroke(this.property('stroke'))
					;	
		this.rectShape.getEventSource().setAttribute("shape-rendering","crispEdges");
		//console.log("transform:"+this.transform.dx+","+this.transform.dy);
		this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFill(this.property('fill'));	
	};
	
	p.serialize=function(){
		var s=this.property('stroke');
		//console.log("Select.serialize");
		r=0;

		return '<g '+this.writeCommonAttrs()+'>'
			+ '<rect style="stroke:'+this.property('strokeColor')+';stroke-weight:'+this.property('strokeWidth')+';fill:'+this.property('shapeFill')+ '" '
			+ 'x="' + this.start.x + '" '
			+ 'width="' + (this.end.x-this.start.x) + '" '
			+ 'y="' + this.start.y + '" '
			+ 'height="' + (this.end.y-this.start.y) + '" '
			+ 'rx="' + this.radius + '" '
			+ 'ry="' + this.radius + '" '
			+ ' />'
			+ '<text style="fill:'+this.property('fontFill')+';text-anchor:'+this.textAlign+'" font-weight="bold" '
			+ 'x="' + this.textPosition.x + '" '
			+ 'y="' + this.textPosition.y + '">'
			+ this.property('label')
			+ '</text>'
			+ '</g>';
	};

	ta.ShapeBase.register("Select");
})();
