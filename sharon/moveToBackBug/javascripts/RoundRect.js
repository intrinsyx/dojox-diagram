dojo.provide("dojox.diagram.RoundRect");
dojo.require("dojox.diagram.ShapeBase");
//dojo.require("dojox.diagram.Anchor");
//debugger;
//dojo.require("Anchor");

(function(){
	var ta=dojox.diagram;
	ta.RoundRect=function(figure, id){
		ta.ShapeBase.call(this, figure, id);
		this.transform={ dx:0, dy:0 };
		/*this.start={x:0, y:0};
		this.N={x:100,y:0}; // the north point
		this.NE={x:200, y:0}; // the north east point
		this.E={x:200,y:100}; // the east point;
		this.end={ x:200, y:200 }; // the south-east point, keep the name - 'end' as from dojox.sketch.
		this.S={ x:100, y:200 }; //the south point
		this.SW={ x:0, y:200 }; // the south-west point
		this.W={ x:0, y:100 }; // the west point/corner*/
		this.start={x:0, y:0}; // the north-west point, keep the name = 'start' as from dojox.sketch.
		this.N={x:0, y:0}; // the north point
		this.NE={x:0, y:0}; // the north east point
		this.E={x:0, y:0}; // the east point;
		this.end={x:0, y:0}; // the south-east point, keep the name - 'end' as from dojox.sketch.
		this.S={x:0, y:0}; //the south point
		this.SW={x:0, y:0}; // the south-west point
		this.W={x:0, y:0};
		this.radius=15;
		this.textPosition={ x:196, y:196 };
		//this.textPosition={ x:0, y:0 };
		this.textOffset=4;
		//this.textAlign="middle";
		//this.textYOffset=10;
		//this.rotation=0;		
		this.textAlign="end";

		this.property('label',this.id);
//		this.label=this.id;
		//this.pathShape=null;
		//this.arrowhead=null;
		//this.arrowheadGroup=null;
		this.labelShape=null;
		this.rectShape=null;

		this.anchors.start=new Anchor(this, "start");
		//this.anchors.N=new Anchor(this, "N");
		//this.anchors.NE=new Anchor(this, "NE");
		//this.anchors.E=new Anchor(this, "E");
		this.anchors.end=new Anchor(this, "end");
		//this.anchors.S=new Anchor(this, "S");
		//this.anchors.SW=new Anchor(this, "SW");
		//this.anchors.W=new Anchor(this, "W");
		
		this.currentAnchor = null;
		this.hasAttachments=false;
		this.startAttachments=[]; // // for the connectors with 'start' id, there should be a better db for this
		this.endAttachments=[]; // for the connectors with 'end' id
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
		/*	text position
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
		this.textPosition={ x:x/2, y:y/2 };*/
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
		this.textPosition={ x:(this.start.x+w)/2, y:(this.start.y+h)/2 };
		
	};
	
	p.apply=function(obj){
		if(!obj) return;
		if(obj.documentElement) obj=obj.documentElement;
		this.readCommonAttrs(obj);
		
		for(var i=0; i<obj.childNodes.length; i++){
			var c=obj.childNodes[i];
			if(c.localName=="text") this.property('label',c.childNodes.length?c.childNodes[0].nodeValue:'');
			//else if(c.localName=="path"){
			else if(c.localName=="rect"){
				/*	the line
				var d=c.getAttribute('d').split(" ");
				var s=d[0].split(",");
				this.start.x=parseFloat(s[0].substr(1),10);
				this.start.y=parseFloat(s[1],10);
				s=d[1].split(",");
				this.control.x=parseFloat(s[0].substr(1),10);
				this.control.y=parseFloat(s[1],10);
				s=d[2].split(",");
				this.end.x=parseFloat(s[0],10);
				this.end.y=parseFloat(s[1],10);*/
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
		var font=(ta.ShapeBase.labelFont)?ta.ShapeBase.labelFont:{family:"Times", size:"16px"};
		this.apply(obj);

		//	calculate the other positions
		//this._rot();
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
					.setFill("#def")
					.setStroke(this.property('stroke'))
					;	
					
		this.labelShape=this.shape.createText({
			x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign
		}).setFont(font).setFill(this.property('fill'));
			
	};
	p.destroy=function(){
		if(!this.shape) return;
		//this.arrowheadGroup.remove(this.arrowhead);
		//this.shape.remove(this.arrowheadGroup);
		//this.shape.remove(this.pathShape);
		this.shape.remove(this.labelShape);
		
		this.shape.remove(this.rectShape);
		
		this.figure.group.remove(this.shape);
		//=this.arrowheadGroup=this.arrowhead
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
	p.getShape=function(){
		//console.log("Rectangle.getShape:x:"+this.rectShape.getShape().x+",y:"+this.rectShape.getShape().y+
	    //",width:"+this.rectShape.getShape().width+",height:"+this.rectShape.getShape().height);
		return this.rectShape.getShape();
	};
	/*p.getFont=function(){
		return this.rectShape.getFont();
	};*/
	p.getStart=function(){
		//console.log("Rectangle.start:"+this.start.x+","+this.start.y);
		return this.start;
	};
	p.getEnd=function(){
		return this.end;
	};
	p.getRadius=function(){
		return this.radius;
	};
	p.getTextPosition=function(){
		return this.textPosition;
	};
	p.getTextAlign=function(){
		return this.textAlign;
	};
	/*p.setID=function(id){
		this.shape.getEventSource().setAttribute("id", id);
	}*/
	p.setCurrentAnchor=function(id){
		this.currentAnchor=id;
	};
	p.getCurrentAnchor=function(){
		return this.currentAnchor;
	};
	p.getCenter=function(obj){
		//this.draw(obj); // why it's divided by 4 instead of 2, to get the center?
		return {x:this.rectShape.getTransformedBoundingBox()[0].x+(this.getBBox().width)/4
					, y:this.rectShape.getTransformedBoundingBox()[0].y+(this.getBBox().height)/4};
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
					.setFill("#def")
					.setStroke(this.property('stroke'))
					;	
		this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFill(this.property('fill'));
	};
	p.serialize=function(){
		var s=this.property('stroke');
		/*var r=this.rotation*(180/Math.PI);
		if(this.start.x>this.end.x) r-=180;
		r=Math.round(r*Math.pow(10,4))/Math.pow(10,4);*/
		r=0;
		return '<g '+this.writeCommonAttrs()+'>'
			/*+ '<path style="stroke:'+s.color+';stroke-width:'+s.width+';fill:none;" d="'
			+ "M"+this.start.x+","+this.start.y+" "
			+ "Q"+this.control.x+","+this.control.y+" "
			+ this.end.x+","+this.end.y
			+ '" />'
			+ '<g transform="translate(' + this.start.x + "," + this.start.y + ") "
			+ 'rotate(' + r + ')">'
			+ '<path style="fill:'+s.color+';" d="M0,0 l20,-5, -3,5, 3,5 Z" />'
			+ '</g>'*/
			+ '<rect style="stroke:'+s.color+';stroke-weight:1;fill:none;" '
			+ 'x="' + this.start.x + '" '
			+ 'width="' + (this.end.x-this.start.x) + '" '
			+ 'y="' + this.start.y + '" '
			+ 'height="' + (this.end.y-this.start.y) + '" '
			+ 'rx="' + this.radius + '" '
			+ 'ry="' + this.radius + '" '
			+ ' />'
			+ '<g transform="translate(' + this.start.x + "," + this.start.y + ") "
			+ 'rotate(' + r + ')">'
			+ '<path style="fill:'+s.color+';" d="M0,0 l20,-5, -3,5, 3,5 Z" />'
			+ '</g>'
			+ '<text style="fill:'+s.color+';text-anchor:'+this.textAlign+'" font-weight="bold" '
			+ 'x="' + this.textPosition.x + '" '
			+ 'y="' + this.textPosition.y + '">'
			+ this.property('label')
			+ '</text>'
			+ '</g>';
	};

	ta.ShapeBase.register("RoundRect");
})();
