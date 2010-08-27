dojo.provide("dojox.diagram.Triangle");
dojo.require("dojox.diagram.ShapeBase");

(function(){
	var ta=dojox.diagram;
	ta.Triangle=function(figure, id){
		//summary:
		//		A triangle shape with text annotation, extended from ShapeBase
		
		//		ta.ShapeBase.call(this, figure, id) - call ShapeBase.constructor
		
		//serialized attributes:
		//		start (x, y)/control(x,y)/end(x,y): the three points of the triangle.
		//		textPosition (x,y): the label/text position coordinate(absolute position), located in the center of the triangle.
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
		//		triShape(object): triangle shape
		//		labelShape(object): text annotation
		//		anchors(object): 3 corner rectangles at three points
		//		hasAttachments(boolean): if the shape has connectors
		//		startAttachments[](object array): for the connectors with 'start' id
		//		endAttachments[](object array): for the connectors with 'end' id

		ta.ShapeBase.call(this, figure, id);
		this.start={x:0, y:0};
		this.control={x:100, y:-50};
		this.end={x:200, y:0};
		this.textPosition={ x:0, y:0 };
		this.textAlign="middle";
		
		this.triShape=null;
		this.labelShape=null;
		this.property('label',this.id);
		this.anchors.start=new Anchor(this, "start");
		this.anchors.control=new Anchor(this, "control");
		this.anchors.end=new Anchor(this, "end");		
		this.hasAttachments=false;
		this.startAttachments=[]; 
		this.endAttachments=[]; 
	};
	ta.Triangle.prototype=new ta.ShapeBase;
	var p=ta.Triangle.prototype;
	p.constructor=ta.Triangle;

	p.type=function(){ return 'Triangle'; };
	p.getType=function(){ return ta.Triangle; };
	
	//	helper functions for rotation
	p._rot=function(){
		//	arrowhead rotation
		//console.log("before p._rot: start:"+this.start.x+","+this.start.y+",control:"+this.control.x+","+this.control.y+",end:"+this.end.x+","+this.end.y);
	
		var opp=this.start.y-this.control.y;
		var adj=this.start.x-this.control.x;
		if(!adj) adj=1;
		this.rotation=Math.atan(opp/adj);
		//console.log("p._rot: start:"+this.start.x+","+this.start.y+",control:"+this.control.x+","+this.control.y+",end:"+this.end.x+","+this.end.y);
	};
	
	p._pos=function(){
		//	text position
		var xmin=Math.min(this.start.x, this.control.x, this.end.x);
		var ymin=Math.min(this.start.y, this.control.y, this.end.y);
		var xmax=Math.max(this.start.x, this.control.x, this.end.x);
		var ymax=Math.max(this.start.y, this.control.y, this.end.y);
		this.textPosition={ x:(xmax + xmin)/2, y:(ymax + ymin)/2 };
		//console.log("p._pos: start:"+this.start.x+","+this.start.y+",control:"+this.control.x+","+this.control.y+",end:"+this.end.x+","+this.end.y);
	};
	
	p.apply=function(obj){
		if(!obj) return;
		if(obj.documentElement) obj=obj.documentElement;
		this.readCommonAttrs(obj);
		
		for(var i=0; i<obj.childNodes.length; i++){
			var c=obj.childNodes[i];
			if(c.localName=="text") this.property('label',c.childNodes.length?c.childNodes[0].nodeValue:'');
			else if(c.localName=="path"){
				//	the line
				//debugger;
				var d=c.getAttribute('d').split(" ");
				var s=d[0].split(",");
				this.start.x=parseFloat(s[0].substr(1),10);
				this.start.y=parseFloat(s[1],10);
				s=d[1].split(",");
				this.control.x=parseFloat(s[0].substr(1),10);
				this.control.y=parseFloat(s[1],10);
				s=d[2].split(",");
				this.end.x=parseFloat(s[0],10);
				this.end.y=parseFloat(s[1],10);
			}
		}
		//console.log("apply: start:"+this.start.x+","+this.start.y+",control:"+this.control.x+","+this.control.y+",end:"+this.end.x+","+this.end.y);
	};
	p.initialize=function(obj){
		//	create, based on passed DOM node if available.
		var font=(ta.ShapeBase.labelFont)?ta.ShapeBase.labelFont:{family:"Times", size:"16px"};
		this.apply(obj);

		//	calculate the other positions
		this._rot();
		this._pos();

		//	rotation matrix
		var rot=this.rotation;
		if(this.control.x>=this.end.x&&this.control.x<this.start.x) rot+=Math.PI;
		var tRot=dojox.gfx.matrix.rotate(rot);

		//	draw the shapes
		this.shape=this.figure.group.createGroup();
		this.shape.getEventSource().setAttribute("id", this.id);
		if(this.transform.dx||this.transform.dy) this.shape.setTransform(this.transform);

		//triangle
		//console.log("init: start:"+this.start.x+","+this.start.y+",control:"+this.control.x+","+this.control.y+",end:"+this.end.x+","+this.end.y);
		this.triShape=this.shape.createPolyline([{x:this.start.x, y:this.start.y},{x:this.control.x, y:this.control.y},
					{x:this.end.x, y:this.end.y},{x:this.start.x, y:this.start.y}])
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
		this.shape.remove(this.triShape);
		this.figure.group.remove(this.shape);
		this.shape=this.labelShape=this.triShape=null;
	};
	p.draw=function(obj){
		this.apply(obj);
		this._rot();
		this._pos();

		//	rotation matrix
		var rot=this.rotation;
		if(this.control.x<this.start.x) rot+=Math.PI;
		var tRot=dojox.gfx.matrix.rotate(rot);

		this.shape.setTransform(this.transform);
			
		this.triShape.setShape([{x:this.start.x, y:this.start.y},{x:this.control.x, y:this.control.y},
					{x:this.end.x, y:this.end.y},{x:this.start.x, y:this.start.y}])
					.setFill(this.property('shapeFill'))
					.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	

		this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));
	};
	p.getBBox=function(){
		var x=Math.min(this.start.x, this.control.x, this.end.x);
		var y=Math.min(this.start.y, this.control.y, this.end.y);
		var w=Math.max(this.start.x, this.control.x, this.end.x)-x;
		var h=Math.max(this.start.y, this.control.y, this.end.y)-y;
		return { x:x, y:y, width:w, height:h };
	};
	/*p.getShape=function(){
		return this.triShape.getShape();
	};*/

	p.getCenter=function(obj){ 
		var matrix = this.triShape._getRealMatrix();
		var center = dojox.gfx.matrix.multiplyPoint(matrix, (this.triShape.getShape().points[0].x+this.triShape.getShape().points[1].x+this.triShape.getShape().points[2].x)/3, 
															(this.triShape.getShape().points[0].y+this.triShape.getShape().points[1].y+this.triShape.getShape().points[2].y)/3);
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
	p.serialize=function(){
		var r=this.rotation*(180/Math.PI);
		if(this.start.x>this.end.x) r-=180;
		r=Math.round(r*Math.pow(10,4))/Math.pow(10,4);
		return '<g '+this.writeCommonAttrs()+'>'
			+ '<path style="stroke:'+this.property('strokeColor')+';stroke-width:'+this.property('strokeWidth')+';fill:none;" d="'
			+ "M"+this.start.x+","+this.start.y+" "
			+ "Q"+this.control.x+","+this.control.y+" "
			+ this.end.x+","+this.end.y
			+ '" />'
			+ '<text style="fill:'+this.property('fontFill')+';text-anchor:'+this.textAlign+'" font-weight="bold" '
			+ 'x="' + this.textPosition.x + '" '
			+ 'y="' + this.textPosition.y + '">'
			+ this.property('label')
			+ '</text>'
			+ '</g>';
	};

	ta.ShapeBase.register("Triangle");
})();
