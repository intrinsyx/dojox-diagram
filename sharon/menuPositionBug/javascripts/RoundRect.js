dojo.provide("dojox.diagram.RoundRect");
dojo.require("dojox.diagram.ShapeBase");
//dojo.require("dojox.diagram.Anchor");

(function(){
	var ta=dojox.diagram;
	ta.RoundRect=function(figure, id){
		//summary:
		//		a round rectangle shape with text annotation, extended from ShapeBase
		
		//		ta.ShapeBase.call(this, figure, id) - call ShapeBase.constructor
		
		//serialized attributes:
		//		start (x, y): the north-west point coordinate of the round rectangle, keep the name = 'start' as from dojox.sketch.
		//		end (x, y): the south-east point coordinate, keep the name - 'end' as from dojox.sketch.
		//		radius(rx, ry): the radius of rounded corners
		//		textPosition (x,y): the label/text position coordinate(absolute position), calculated from the formula:
		//							x:this.start.x+((this.end.x-this.start.x)/2),y:this.start.y+((this.end.y-this.start.y)/2)
		//		textAlign(string): text alignment, valid values are 'start', 'middle', 'end'.
		//		property{
		//			'strokeColor':"blue", //shape's outline color
		//			'strokeWidth':2,      //shape's outline width
		//			'shapeFill': "blue",  //shape's fill color
		//			'label': ""           //text annotation content		
		// 			'fontColor':"blue",   //text annotation's font color
		//			'fontSize': "14px",		//text annotation's font size
		//			'fontFamily':"Arial"	//text annotation's font family	
		//			'fontWeight':"normal",  //text annotation's font style, either normal or bold
		//			'fontStyle':"normal"    //text annotation's font style, either normal or italic
		//				}; from ShapeBase
		
		//local variables:
		//		rectShape(object): rectangle shape
		//		labelShape(object): text annotation
		//		property('label',this.id): set "item"+id to shape's label/text
		//		N(x,y):the north point
		//		NE(x,y):the north east point
		//		E(x,y):the east point;
		//		S(x,y):the south point
		//		SW(x,y):the south-west point
		//		W(x,y):the west point
		//		anchors(object): 8 corner rectangles
		//		currentAnchor(object): the current corner rectangle clicked/dragged by the mouse.
		//		hasAttachments(boolean): if the shape has connectors
		//		startAttachments[](object array): for the connectors with 'start' id
		//		endAttachments[](object array): for the connectors with 'end' id		
		
		ta.ShapeBase.call(this, figure, id);	
		this.start={x:0, y:0}; 
		this.end={x:0, y:0}; 
		this.radius=15;
		this.textPosition={ x:196, y:196 };		
		this.textAlign="end"; //"middle", or "start"
		
		this.rectShape=null;
		this.labelShape=null;	
		this.property('label',this.id);	
		this.N={x:0, y:0}; 
		this.NE={x:0, y:0}; 
		this.E={x:0, y:0}; 
		this.S={x:0, y:0}; 
		this.SW={x:0, y:0}; 
		this.W={x:0, y:0};
		this.anchors.start=new Anchor(this, "start");
		this.anchors.N=new Anchor(this, "N");
		this.anchors.NE=new Anchor(this, "NE");
		this.anchors.E=new Anchor(this, "E");
		this.anchors.end=new Anchor(this, "end");
		this.anchors.S=new Anchor(this, "S");
		this.anchors.SW=new Anchor(this, "SW");
		this.anchors.W=new Anchor(this, "W");		
		this.currentAnchor = null;
		this.hasAttachments=false;
		this.startAttachments=[]; 
		this.endAttachments=[]; 
	};
	ta.RoundRect.prototype=new ta.ShapeBase;
	var p=ta.RoundRect.prototype;
	p.constructor=ta.RoundRect;

	p.type=function(){ return 'RoundRect'; };
	p.getType=function(){ return ta.RoundRect; };

	/*	helper functions
	p._rot=function(){
		//	arrowhead rotation
		var opp=this.start.y-this.control.y;
		var adj=this.start.x-this.control.x;
		if(!adj) adj=1;
		this.rotation=Math.atan(opp/adj);
	};*/
	
	p._pos=function(){
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
		/*var x=Math.min(this.start.x, this.end.x);
		var y=Math.min(this.start.y, this.end.y);
		var w=Math.max(this.start.x, this.end.x);
		var h=Math.max(this.start.y, this.end.y);
		this.start={ x:x, y:y };
		this.end={ x:w, y:h };*/
		this.textPosition={ x:this.start.x+(w/2), y:this.start.y+(h/2) };
	};
	
	p.apply=function(obj){
		if(!obj) return;
		if(obj.documentElement) obj=obj.documentElement;
		this.readCommonAttrs(obj);
		
		for(var i=0; i<obj.childNodes.length; i++){
			var c=obj.childNodes[i];
			if(c.localName=="text") this.property('label',c.childNodes.length?c.childNodes[0].nodeValue:'');
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
			}
		}
	};
	p.initialize=function(obj){
		//	create, based on passed DOM node if available.
		//var font=(ta.ShapeBase.labelFont)?ta.ShapeBase.labelFont:{family:"Times", size:"16px"};
		this.apply(obj);

		//	calculate the other positions
		this._pos();

		/*	rotation matrix
		var rot=this.rotation;
		if(this.control.x>=this.end.x&&this.control.x<this.start.x) rot+=Math.PI;
		var tRot=dojox.gfx.matrix.rotate(rot);*/

		//	draw the shapes
		this.shape=this.figure.group.createGroup();
		this.shape.getEventSource().setAttribute("id", this.id);
		if(this.transform.dx||this.transform.dy) this.shape.setTransform(this.transform);

		this.rectShape=this.shape.createRect({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y, r:this.radius})
					.setFill(this.property('shapeFill'))
					.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	
					
		this.labelShape=this.shape.createText({
			x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));
			
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
		return { x:x-2, y:y-2, width:w+4, height:h+4 };
	};
	p.duplicate=function(shape){ };
	/*p.getShape=function(){
		return this.rectShape.getShape();
	};*/
	p.getTextPosition=function(){
		return this.textPosition;
	};
	p.getTextAlign=function(){
		return this.textAlign;
	};
	p.setCurrentAnchor=function(id){
		this.currentAnchor=id;
	};
	p.getCurrentAnchor=function(){
		return this.currentAnchor;
	};
	p.getCenter=function(obj){
		var matrix = this.rectShape._getRealMatrix();
		var center = dojox.gfx.matrix.multiplyPoint(matrix, this.rectShape.getShape().x+this.rectShape.getShape().width/2, this.rectShape.getShape().y+this.rectShape.getShape().height/2);
		return center;
	};
	p.setStartAttachments=function(obj){
		this.hasAttachments=true;
		this.startAttachments.push(obj);
	}
	p.getStartAttachments=function(){
		return this.startAttachments;
	}
	p.setEndAttachments=function(obj){
		this.hasAttachments=true;
		this.endAttachments.push(obj);
	}
	p.getEndAttachments=function(){
		return this.endAttachments;
	}
	p.draw=function(obj){
		this.apply(obj);
		//this._rot();
		this._pos();

		/*	rotation matrix
		var rot=this.rotation;
		if(this.control.x<this.start.x) rot+=Math.PI;
		var tRot=dojox.gfx.matrix.rotate(rot);*/

		this.shape.setTransform(this.transform);

		this.rectShape.setShape({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y, r:this.radius})
					.setFill(this.property('shapeFill'))
					.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	

		this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));
	};
	
	p.serialize=function(){
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
	ta.ShapeBase.register("RoundRect");
})();
