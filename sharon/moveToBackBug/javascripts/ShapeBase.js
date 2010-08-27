//base class/object for shapes: rectangle, rounded rectangle, circle/ellipse, triangle, connector and
// annotations: Lead, Preexisting, SingleArrow, DoubleArrow, Underline(text only)

dojo.provide("dojox.diagram.ShapeBase");
//dojo.require("dojox.diagram.Anchor");
//dojo.require("dojox.diagram._Plugin");
dojo.require("dijit.form.TextBox");
dojo.require("Anchor");


(function(){
	var ta=dojox.diagram;
	dojo.declare("dojox.diagram.ShapeBaseTool", ta._Plugin, {
//		constructor: function(){
////			console.log('this.shape',this.shape);
////			this.annotation=ta.tools[this.shape];
//		},
		onMouseMove: function(e,rect){
				if(this._cshape){ 
					//console.log("ShapeBase.onMouseMove-this._cShape");
					this._cshape.setShape(rect);
				} else {
					//console.log("ShapeBase.onMouseMove- !this._cShape");
					this._cshape=this.figure.surface.createRect(rect)
						.setStroke({color:"#999", width:1, style:"ShortDot"})
						.setFill([255,255,255,0.7]);
					this._cshape.getEventSource().setAttribute("shape-rendering","crispEdges");
				}
		},
		onMouseUp: function(e){
			var f=this.figure;
			if(!(f._startPoint.x==e.pageX&&f._startPoint.y==e.pageY)){
				if(this._cshape){
					//	The minimum number of pixels one has to travel before a shape
					//		gets drawn.
					var limit=40;
					if(Math.max(
						limit, 
						Math.abs(f._absEnd.x-f._start.x), 
						Math.abs(f._absEnd.y-f._start.y)
					)>limit){
						this._create(f._start, f._end);
					}
				}
			}
			if(this._cshape) f.surface.remove(this._cshape);
			//console.log("Annottation.onMouseUp");
		},
		_create: function(start,end){
			//	create a new shape, needs to be accessible from the
			//		dragging functions.
			//console.log("Annottation._create");
			var f=this.figure;
			var _=f.nextKey();
			var a=new (this.shapebase)(f, "item-"+_);
			a.setID("item-"+_);
			//debugger;
			a.transform={dx:start.x/f.zoomFactor, dy:start.y/f.zoomFactor};
			a.end={ x:end.x/f.zoomFactor, y:end.y/f.zoomFactor };
			console.log("figure.zoomfactor:"+f.zoomFactor);
			/*if(a.control){
				a.control={ x:Math.round((end.x/2)/f.zoomFactor),y:Math.round((end.y/2)/f.zoomFactor) };
			}*/
			f.onBeforeCreateShape(a);
			a.initialize();
			f.select(a); // fix the bug: corner-rectangles are not in the correct location when created.
			a.setMode(ta.ShapeBase.Modes.View);
			f.onCreateShape(a);
			f.history.add(ta.CommandTypes.Create,a);
			return a;
		}
	});
	ta.ShapeBase=function(figure, id){
		//	for editing stuff.
		this.id=this._key=id;
		this.figure=figure;
		this.mode=ta.ShapeBase.Modes.View;
		this.shape=null;	// dojox.gfx.Group
		this.boundingBox=null;	// rect for boundaries
		this.hasAnchors=true;
		this.hasAttachments=false;
		this.anchors={};	//	ta.Anchor
		this._properties={
			'stroke':{ color:"blue", width:2 },
			'fill': "blue",//"#def",
			'label': ""
		};

		if(this.figure) this.figure.add(this);
	};
	var p=ta.ShapeBase.prototype;
	p.constructor=ta.ShapeBase;
	p.type=function(){ return ''; };
	p.getType=function(){ return ta.ShapeBase; };

	p.remove=function(){
		this.figure.history.add(ta.CommandTypes.Delete, this, this.serialize());
	};
	p.property=function(name,/*?*/value){
		var r;
		name=name.toLowerCase();
		if(this._properties[name]!==undefined){
			r=this._properties[name];
		}
		if(arguments.length>1){
			this._properties[name]=value;
		}
		if(r!=value){
			this.onPropertyChange(name,r);
		}
		return r;
	};
	p.onPropertyChange=function(name,oldvalue){};
	p.onCreate=function(){
		this.figure.history.add(ta.CommandTypes.Create,this);
	}
	p.onDblClick=function(event){
		//console.log("ShapeBase.onDblclick");
		//debugger;
		var l=prompt('Set new text:',this.property('label'));
		if(l!==false){
			this.beginEdit(ta.CommandTypes.Modify);
			this.property('label',l);
			this.draw();
			this.endEdit();
		}
	}
	p.initialize=function(){ };
	p.clone=function(obj){};
	p.destroy=function(){ };
	p.draw=function(){ };
	p.apply=function(obj){ };
	p.serialize=function(){ };
	p.getBBox=function(){ };
	p.beginEdit=function(type){
		this._type=type||ta.CommandTypes.Move;
		this._prevState=this.serialize();
	};
	p.endEdit=function(){
		var newstep=true;
		if(this._type==ta.CommandTypes.Move){
			var f=this.figure;
			if(f._absEnd.x==f._start.x&&f._absEnd.y==f._start.y){
				newstep=false;
			}
		}
		if(newstep){
			this.figure.history.add(this._type,this,this._prevState);
		}
		this._type=this._prevState='';
	};
	p.calculate={
		slope:function(p1, p2){
			if(!(p1.x-p2.x)) return 0;
			return ((p1.y-p2.y)/(p1.x-p2.x));
		},
		dx:function(p1, p2, dy){
			var s=this.slope(p1,p2);
			if(s==0) return s;
			return dy/s; 
		},
		dy:function(p1, p2, dx){ return this.slope(p1,p2)*dx; }
	};
	p.drawBBox=function(){
		var r=this.getBBox();
		if(!this.boundingBox){
			this.boundingBox=this.shape.createRect(r)
				.moveToBack()
				.setStroke({color:"#999", width:1, style:"Dash"})
				.setFill([238,238,238,0.3]);
			this.boundingBox.getEventSource().setAttribute("id",this.id+"-boundingBox");
			this.boundingBox.getEventSource().setAttribute("shape-rendering","crispEdges");
			this.figure._add(this);
		} else this.boundingBox.setShape(r);
	};
	p.setBinding=function(pt){
		//debugger;
		this.shape.getEventSource().style.cursor="move";
		this.transform.dx+=pt.dx;
		this.transform.dy+=pt.dy;
		this.draw();
	};
	p.doChange=function(pt){ };
	p.getTextBox=function(){
		return dojox.gfx._base._getTextBox(this.property('label'),ta.ShapeBase.labelFont);
	};
	p.getShape=function(){
		return this.shape;
	};
	p.getTransform=function(){
		//console.log("ShapeBase.getTranform:"+this.transform.dx+","+this.transform.dy);
		return this.transform;
	};
	p.getStroke=function(){
		return this.property('stroke');
	};
	p.getFill=function(){
		return "#def"//this.property('fill');
	};
	p.getLabel=function(){
		return this.property('label');
	}
	p.getTextPosition=function(){};
	p.getTextAlign=function(){	};
	p.getStart=function(){};
	p.getEnd=function(){};
	p.getRadius=function(){};
	p.setID=function(id){
		this.id=id;
	};
	p.getID=function(){
		return this.id;
	};
	p.setCurrentAnchor=function(id){};
	p.getCurrentAnchor=function(){};
	p.getCenter=function(){};
	//test if a point is within certain shape
	p.ifWithin=function(pt){};
	p.setMode=function(m){
		if(this.mode==m) return;
		this.mode=m;
		var method="disable";
		if(m==ta.ShapeBase.Modes.Edit) method="enable";
		if(method=="enable"){
			//	draw the bounding box
			this.drawBBox();
			this.figure._add(this);
		} else {
			if(this.boundingBox){
				if(this.shape) this.shape.remove(this.boundingBox);
				this.boundingBox=null;
			}
		}
		for(var p in this.anchors){ this.anchors[p][method](); }
	};

	p.setStartAttachments=function(obj){};// for the connectors with 'start' id, there should be a better db for this 
	p.getStartAttachments=function(){};
	p.setEndAttachments=function(obj){}; // for the connectors with 'end' id
	p.getEndAttachments=function(){};
//	p.writeProperties=function(){
//		var ps=this._properties;
//		return "<!CDATA[properties:"+dojo.toJson(ps)+"]]>";
//	};
	p.writeCommonAttrs=function(){
		return 'id="' + this.id + '" dojoxdiagram:type="' + this.type() + '"'
			+ ' transform="translate('+ this.transform.dx + "," + this.transform.dy + ')"'
			+ (this.data?(' ><![CDATA[data:'+dojo.toJson(this.data)+']]'):'');
	};
	p.readCommonAttrs=function(obj){
		var i=0,cs=obj.childNodes,c;
		//console.log("ShapeBase.readCommonAttrs:cs:"+cs);
		while(cs&&(c=cs[i++])){
			if(c.nodeType==4){ //CDATA
				if(c.nodeValue.substr(0,11)=='properties:'){
					this._properties=dojo.fromJson(c.nodeValue.substr(11));
				}else if(c.nodeValue.substr(0,5)=='data:'){
					this.data=dojo.fromJson(c.nodeValue.substr(5));
				}else{
					console.error('unknown CDATA node in node ',obj);
				}
			}
		}
		//console.log("ShapeBase.readCommonAttrs:obj:"+obj);
		if(obj.getAttribute('transform')){
			var t=obj.getAttribute('transform').replace("translate(","");
			var pt=t.split(",");
			this.transform.dx=parseFloat(pt[0],10);
			this.transform.dy=parseFloat(pt[1],10);
			//console.log("ShapeBase.readCommonAttrs:obj.transform:"+this.transform.dx+","+this.transform.dy);
		}
	};
	ta.ShapeBase.Modes={ View:0, Edit:1 };
	ta.ShapeBase.labelFont={family:"Arial", size:"16px", weight:"bold"};
	ta.ShapeBase.register=function(name){
		var cls=ta[name];
		ta.registerTool(name, function(p){dojo.mixin(p,{shape: name,shapebase:cls});return new ta.ShapeBaseTool(p)});
	};
})();
