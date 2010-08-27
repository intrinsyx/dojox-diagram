dojo.provide("dojox.diagram.Polyline");
dojo.require("dojox.diagram.ShapeBase");

(function(){
	var ta=dojox.diagram;
	ta.Path=function(figure, id){
		//summary:
		//		A free path drawing with text annotation, extended from ShapeBase
		
		//		ta.ShapeBase.call(this, figure, id) - call ShapeBase.constructor
		
		//serialized attributes:
		//		start (x, y): the start point of the path.
		//		control(x, y): the control point of the path.
		//		end (x, y): the end point of the path.
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
		//		texOffset, textYOffset: offset numbers used for text position calculation
		//		pathShape(object): free path shape
		//		labelShape(object): text annotation
		//		property('label',this.id): set "item"+id to shape's label/text
		//		anchors(object): 3 corner rectangles: start, control and end.

		ta.ShapeBase.call(this, figure, id);
		this.start={ x:0, y:0 };
		this.control={x:100, y:-50};
		this.end={ x:200, y:0 };
		this.textPosition={ x:0, y:0 };
		this.textAlign="middle";
		
		this.textOffset=4;		
		this.textYOffset=10;
		this.property('label',this.id);
		this.pathShape=null;
		this.labelShape=null;
		this.anchors.start=new Anchor(this, "start");
		this.anchors.control=new Anchor(this, "control");
		this.anchors.end=new Anchor(this, "end");
	};
	ta.Path.prototype=new ta.ShapeBase;
	var p=ta.Path.prototype;
	p.constructor=ta.Path;

	p.type=function(){ return 'Path'; }
	p.getType=function(){ return ta.Path; };

	//calculate the text position
	p._pos=function(){
		var offset=this.textOffset, x=0, y=0;
		var slope=this.calculate.slope(this.control, this.end);
		if(Math.abs(slope)>=1){
			x=this.end.x+this.calculate.dx(this.control, this.end, offset);
			if(this.control.y>this.end.y) y=this.end.y-offset;
			else y=this.end.y+offset+this.textYOffset;
		} else if(slope==0){
			x=this.end.x+offset;
			y=this.end.y+this.textYOffset;
		} else {
			if(this.start.x>this.end.x){
				x=this.end.x-offset;
				this.textAlign="end";
			} else {
				x=this.end.x+offset;
				this.textAlign="start";
			}
			if(this.start.y<this.end.y) y=this.end.y+this.calculate.dy(this.control, this.end, offset)+this.textYOffset;
			else y=this.end.y+this.calculate.dy(this.control, this.end, -offset);
		}
		this.textPosition={ x:x/2, y:y/2 };
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
	};

	p.initialize=function(obj){
		var font=(ta.ShapeBase.labelFont)?ta.ShapeBase.labelFont:{family:"Times", size:"16px"};
		this.apply(obj);
		this._pos();

		//	create either from scratch or based on the passed node
		this.shape=this.figure.group.createGroup();
		this.shape.getEventSource().setAttribute("id", this.id);
		if(this.transform.dx || this.transform.dy) this.shape.setTransform(this.transform);
		this.pathShape=this.shape.createPath("M"+this.start.x+","+this.start.y+" Q"+this.control.x+","+this.control.y+" "+this.end.x+","+this.end.y+" l0,0")
						.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')});
		this.labelShape=this.shape.createText({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
						.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
						.setFill(this.property('fontFill'));
	};
	p.destroy=function(){
		if(!this.shape) return;
		this.shape.remove(this.pathShape);
		this.shape.remove(this.labelShape);
		this.figure.group.remove(this.shape);
		this.shape=this.pathShape=this.labelShape=null;
	};
	p.getBBox=function(){
		var x=Math.min(this.start.x, this.control.x, this.end.x);
		var y=Math.min(this.start.y, this.control.y, this.end.y);
		var w=Math.max(this.start.x, this.control.x, this.end.x)-x;
		var h=Math.max(this.start.y, this.control.y, this.end.y)-y;
		return { x:x, y:y, width:w, height:h };
	};

	p.draw=function(obj){
		this.apply(obj);
		this._pos();
		this.shape.setTransform(this.transform);
		this.pathShape.setShape("M"+this.start.x+","+this.start.y+" Q"+this.control.x+","+this.control.y+" "+this.end.x+","+this.end.y+" l0,0")
					.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')});
		this.labelShape.setShape({ x:this.textPosition.x, y:this.textPosition.y, text:this.property('label') })
					.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
					.setFill(this.property('fontFill'));
	};
	p.serialize=function(){
		r=0;
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

	ta.ShapeBase.register("Path");
})();
