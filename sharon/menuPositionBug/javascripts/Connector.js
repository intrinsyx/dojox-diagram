dojo.provide("dojox.diagram.Connector");
dojo.require("dojox.diagram.ShapeBase");

(function(){
	var ta=dojox.diagram;
	ta.Connector=function(figure, id){
		//summary:
		//		A connector shape(text annotation disabled currently), extended from ShapeBase 

		//		ta.ShapeBase.call(this, figure, id) - call ShapeBase.constructor
		
		//serialized attributes:
		//		start (x, y): the start point of the connector, keep the name = 'start' as from dojox.sketch.
		//		end (x, y): the end point of the connector, keep the name - 'end' as from dojox.sketch.
		//		textPosition (x,y): the label/text position coordinate(absolute position), calculated from the formula:
		//							x:this.start.x+((this.end.x-this.start.x)/2),y:this.start.y+((this.end.y-this.start.y)/2)
		//		textAlign(string): text alignment, valid values are 'start', 'middle', 'end'.
		//		property{
		//			'strokeColor':"blue", //shape's outline color
		//			'strokeWidth':2,      //shape's outline width
		//			'shapeFill': "blue",  //shape's fill color
		//			'fontColor':"blue",   //text annotation's font color
		//			'label': ""           //text annotation content
		//				}; from ShapeBase
		
		//		shapeIDforStart(string): the ID of the shape which the connector starts
		//		shapeIDforEnd(string: the ID of the shape which the connector ends
		
		//local variables:
		//		lineShape(object): the connector
		//		labelShape(object): text annotation
		//		property('label',this.id): set "item"+id to shape's label/text
		//		anchors(object): 2 corner rectangles
		
		ta.ShapeBase.call(this, figure, id);
		this.start={ x:0, y:0 };
		this.end={ x:0, y:0 };		
		this.shapeIDforStart=null;
		this.shapeIDforEnd=null;		
		// text is not displayed currently
		this.textPosition={ x:0, y:0 };
		this.textAlign="middle";
		
		this.lineShape=null;
		this.labelShape=null;
		//the text annotation is disabled currently
		this.property('label',this.id);		
		this.anchors.start=new Anchor(this, "start");
		this.anchors.end=new Anchor(this, "end");
	};
	ta.Connector.prototype=new ta.ShapeBase;
	var p=ta.Connector.prototype;
	p.constructor=ta.Connector;

	p.type=function(){ return 'Connector'; }
	p.getType=function(){ return ta.Connector; };

	p._pos=function(){
		this.textPosition={x: this.start.x+(this.end.x-this.start.x)/2, y:this.start.y+(this.end.y-this.start.y)/2}
	};
	p.apply=function(obj){
		if(!obj) return;
		if(obj.documentElement) obj=obj.documentElement;
		this.readCommonAttrs(obj);
		
		for(var i=0; i<obj.childNodes.length; i++){
			var c=obj.childNodes[i];
			if(c.localName=="text") this.property('label',c.childNodes.length?c.childNodes[0].nodeValue:'');
			else if(c.localName=="line"){
				//	the line
				var d=c.getAttribute('d').split(" ");
				var s=d[0].split(",");
				this.start.x=parseFloat(s[0].substr(1),10);
				this.start.y=parseFloat(s[1],10);
				s=d[1].split(",");
				this.end.x=parseFloat(s[0],10);
				this.end.y=parseFloat(s[1],10);
			}
			else if(c.localName=="defs"){
				if(c.getAttribute('id-start')!==null) this.shapeIDforStart=String(c.getAttribute('id-start'));
				if(c.getAttribute('id-end')!==null) this.shapeIDforEnd=String(c.getAttribute('id-end'));
				console.log("id-start:"+this.shapeIDforStart+",end:"+this.shapeIDforEnd);
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
		console.log("connector's id:"+this.id);
		if(this.transform.dx || this.transform.dy) this.shape.setTransform(this.transform);
		this.lineShape=this.shape.createLine({x1:this.start.x, y1:this.start.y,x2:this.end.x,y2:this.end.y})
			.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')});
		//this.lineShape.shape.moveToBack();
		/*this.labelShape=this.shape.createText({
			x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign
		}).setFont(font).setFill(this.property('fontFill'));*/
		if(this.shapeIDforStart!=null){
			//debugger;
			this.figure.get(this.shapeIDforStart).setStartAttachments(this.figure.get(this.id));
		}
		if(this.shapeIDforEnd!=null){
			this.figure.get(this.shapeIDforEnd).setEndAttachments(this.figure.get(this.id));
		}
	};
	p.destroy=function(){
		if(!this.shape) return;
		this.shape.remove(this.lineShape);
		//this.shape.remove(this.labelShape);
		this.figure.group.remove(this.shape);
		this.shape=this.lineShape=this.labelShape=null;
	};
	p.getBBox=function(){
		var x=Math.min(this.start.x, this.end.x);
		var y=Math.min(this.start.y, this.end.y);
		var w=Math.max(this.start.x, this.end.x)-x;
		var h=Math.max(this.start.y, this.end.y)-y;
		return { x:x, y:y, width:w, height:h };
	};
	/*p.getShape=function(){
		return this.lineShape.getShape();
	};*/
	
	p.draw=function(obj){
		if(!this.shape) return;
		this.apply(obj);
		this._pos();
		this.shape.setTransform(this.transform);
		this.lineShape.setShape({x1:this.start.x, y1:this.start.y,x2:this.end.x,y2:this.end.y})
			.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')});
		//this.lineShape.shape.moveToBack();
		/*this.labelShape.setShape({ x:this.textPosition.x, y:this.textPosition.y, text:this.property('label') })
			.setFill(this.property('fontFill'));*/
	};
	p.serialize=function(){
		r=0;
		return '<g '+this.writeCommonAttrs()+'>'
			+ '<line style="stroke:'+this.property('strokeColor')+';stroke-width:'+this.property('strokeWidth')+';fill:none;" d="'
			+ "M"+this.start.x+","+this.start.y+" "
			//+ "Q"+this.control.x+","+this.control.y+" "
			+ this.end.x+","+this.end.y
			+ '" />'
			+ '<defs '
			+ 'id-start="' + this.shapeIDforStart + '" '
			+ 'id-end="' + this.shapeIDforEnd + '" '
			+ ' />'
			+ '<text style="fill:'+this.property('fontFill')+';text-anchor:'+this.textAlign+'" font-weight="bold" '
			+ 'x="' + this.textPosition.x + '" '
			+ 'y="' + this.textPosition.y + '">'
			+ this.property('label')
			+ '</text>'
			+ '</g>';
	};

	ta.ShapeBase.register("Connector");
})();
