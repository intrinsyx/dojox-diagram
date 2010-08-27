dojo.provide("dojox.diagram.ShapeBase");
dojo.require("dijit.form.TextBox");
//dojo.require("Anchor");

dojo.require("dijit.Menu");
dojo.require("dijit.ColorPalette");

(function(){
	var ta=dojox.diagram;
	ta.ShapeBase=function(figure, id){
		// summary
		//		This is the constructor of the base class/object for 
		// 		shapes: rectangle, rounded rectangle, circle/ellipse, triangle, path and connector
		
		//serialzied attributes:
		//		id (number): shape unique id (accumulated by shape count number)
		//		transform (dx,dy ):shape transform (currently translate)
		//	 	_properties (string): the shape's stroke, fill, font, label properties, serialized in each shape
		
		//local variables:
		//		figure: the main mouse/keyboard event handler
		//		mode: either View (0)  or Edit (1) mode
		//		shape: dojox.gfx.Group
		//		boundingBox: rect for boundaries
		//		hasAttachments: if the shape has connectors
		// 		anchors: the shape's corner rectangles for resizing - dojox.diagram.Anchor
		
		this.id=this._key=id;
		this.transform={ dx:0, dy:0 };
		/*old settings
		 this._properties={
			'stroke':{ color:"blue", width:2 },
			'fill': "blue",//"#def",
			'label': ""
		};*/
		
		this._properties={
			'strokeColor':"blue", 	//shape's outline color
			'strokeWidth':2,      	//shape's outline width
			'shapeFill': "#def",  	//shape's fill color
			'label': "",           	//text annotation content
			'fontFill':"blue",   	//text annotation's font color
			'fontSize': 16,			//text annotation's font size
			'fontFamily':"Arial",	//text annotation's font family
			'fontWeight':"normal",  //text annotation's font style, either normal or bold
			'fontStyle':"normal"    //text annotation's font style, either normal or italic		
		};
		
		this.figure=figure;
		this.mode=ta.ShapeBase.Modes.Edit;
		this.shape=null;	
		this.boundingBox=null;	
		this.hasAttachments=false;
		this.anchors={};
		if(this.figure) this.figure.add(this);
	};
	
	dojo.declare("dojox.diagram.ShapeBaseTool", ta._Plugin, {
		onMouseMoveLine: function(e,line){
			//	e: 'onmousemove' event from Figure._mm(e)
			//	line: a visual line during 'connector' mode with the mouse movement
				if(this._cshape){ 
					console.log("ShapeBase.onMouseMove-this._cShape");
					this._cshape.setShape(line);
				} else {
					console.log("ShapeBase.onMouseMove- !this._cShape");
					this._cshape=this.figure.surface.createLine(line)
						.setStroke({color:"#999", width:3, style:"ShortDot"})
						.setFill([255,255,255,0.7]);
					this._cshape.getEventSource().setAttribute("shape-rendering","crispEdges");
				}
		},
		onMouseMoveRect: function(e,rect){
			//	e: 'onmousemove' event from Figure._mm(e)
			//	rect: a rectangle area for the shape drawing with the mouse movement
				if(this._cshape){ 
					console.log("ShapeBase.onMouseMove-this._cShape");
					this._cshape.setShape(rect);
				} else {
					console.log("ShapeBase.onMouseMove- !this._cShape");
					this._cshape=this.figure.surface.createRect(rect)
						.setStroke({color:"#999", width:1, style:"ShortDot"})
						.setFill([255,255,255,0.7]);
					this._cshape.getEventSource().setAttribute("shape-rendering","crispEdges");
				}
		},
		onMouseUpRect: function(e){
			//	e: 'onmouseup' event from Figure._mu(e)
			
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
			if(this._cshape) {
				f.surface.remove(this._cshape);
				this._cshape=null;
			}
			//console.log("Annottation.onMouseUp");
		},
		onMouseUpLine: function(e){
			//	e: 'onmouseup' event from Figure._mu(e)
			
			var f=this.figure;
			if(this._cshape) {
				f.surface.remove(this._cshape);
				this._cshape=null;
			}
		},
		_create: function(start,end){
			//	create a new shape, needs to be accessible from the dragging functions.
			//	start: Figure._start - the mouse-click start point
			//	end: Figure._end - the mouse-move end point
			
			var f=this.figure;
			
			//the next key/id - shape count number
			var _=f.nextKey();
			
			//individual shape constructor - polymorphism
			var a=new (this.shapebase)(f, "item-"+_);
			
			//shape id - ShapeBase.setID(id)
			a.setID("item-"+_);

			//initial transform information
			a.transform={dx:start.x/f.zoomFactor, dy:start.y/f.zoomFactor};
			
			a.end={ x:end.x/f.zoomFactor, y:end.y/f.zoomFactor };
			
			// other corner rectangles, for anchor initialization
			/*a.N={x: (a.start.x+(a.end.x-a.start.x)/2)/f.zoomFactor, y: a.start.y/f.zoomFactor};
			a.NE={x: a.end.x/f.zoomFactor, y: a.start.y/f.zoomFactor};
			a.E={x: a.end.x/f.zoomFactor, y: (a.start.y+(a.end.y-a.start.y)/2)/f.zoomFactor};
			a.S={x: (a.start.x+(a.end.x-a.start.x)/2)/f.zoomFactor, y: a.end.y/f.zoomFactor};
			a.SW={x: a.start.x/f.zoomFactor, y: a.end.y/f.zoomFactor};
			a.W={x: a.start.x/f.zoomFactor, y: (a.start.y+(a.end.y-a.start.y)/2)/f.zoomFactor};*/
			
			a.N={x: (a.start.x+(a.end.x-a.start.x)/2), y: a.start.y};
			a.NE={x: a.end.x, y: a.start.y};
			a.E={x: a.end.x, y: (a.start.y+(a.end.y-a.start.y)/2)};
			a.S={x: (a.start.x+(a.end.x-a.start.x)/2), y: a.end.y};
			a.SW={x: a.start.x, y: a.end.y};
			a.W={x: a.start.x, y: (a.start.y+(a.end.y-a.start.y)/2)};
			
			f.onBeforeCreateShape(a);
			
			//individual shape.initialize() - polymorphism
			a.initialize();

			f.select(a); 
			a.setMode(ta.ShapeBase.Modes.View);
			f.onCreateShape(a);
			
			//add the current shape to undo/redo stack
			f.history.add(ta.CommandTypes.Create,a);
			return a;
		}
	});
	
	var p=ta.ShapeBase.prototype;
	p.constructor=ta.ShapeBase;
	p.type=function(){ return ''; };
	p.getType=function(){ return ta.ShapeBase; };

	p.remove=function(){
		this.figure.history.add(ta.CommandTypes.Delete, this, this.serialize());
	};
	p.property=function(name,/*?*/value){
		var r;
		//name=name.toLowerCase();
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
	
	//text annotation
	p.onDblClick=function(shape, event){
		// display a dialog box that prompts the user for input. 
		/*var l=prompt('Set new text:',this.property('label'));
		if(l!==false){
			debugger;
			this.beginEdit(ta.CommandTypes.Modify);
			this.property('label',l);
			this.draw();
			this.endEdit();
		}*/
		
		// text annotation right on the top of the shape without prompting...
		var textarea = dojo.doc.createElement('textarea');
		textarea.style.position = 'absolute';
		textarea.style.overflow = 'visible';
		textarea.style.textAlign = 'left';
		textarea.style.backgroundColor = 'transparent';
		textarea.style.borderColor = 'transparent';
		textarea.style.borderWidth = 0;
		textarea.setAttribute('cols', '20');
		textarea.setAttribute('rows', '4');
		textarea.setAttribute('title','shape annotation');
		textarea.value=this.property('label');
		textarea.defaultValue=this.property('label');
		textarea.style.left = this.getCenter().x-this.getBBox().width/2+'px';
		textarea.style.top = this.getCenter().y-this.getBBox().height/2+'px';
		textarea.style.width = this.getBBox().width+'px';
		textarea.style.height = this.getBBox().height+'px';
		dojo.byId("canvas").appendChild(textarea);
		textarea.focus();
		textarea.select();
		//to make the shape text disappear during the editing, at the same time, the previous label needs to be put in the undo stack.
		var previousText=this.property('label');
		this.property('label','');
		this.draw();
		this.property('label',previousText);
		
		var l = textarea.value;
		dojo.connect(textarea, "onkeydown", function(e){
												if(e.keyCode==dojo.keys.ENTER){
													var l = textarea.value;
													textarea.parentNode.removeChild(textarea);
													if(l!==false){
														//debugger;
														shape.beginEdit(ta.CommandTypes.Modify);
														shape.property('label',l);
														shape.draw();
														shape.endEdit();
													}
												} }
												);
	};
	
	// right click the shape to add a menu for shape and font editing.
	p.addMenu=function(shape,point){
		//alert("You clicked the right mouse button on a rectangle!");
		//var div = dojo.doc.createElement('div');
		//var x=shape.getCenter().x; 
		//var y=shape.getCenter().y;
		//var menu = new dijit.Menu({style: 'width: 10px; left:100px; top:200px'});
		var menu = new dijit.Menu({style:'width: 20px'});
		/*menu.style.position='relative';
		menu.style.left=e.clientX;
		menu.style.top=e.clientY;*/
		
		var shapeSubMenu= new dijit.Menu({parentMenu:menu,style: 'width: 20px'});
		var lineColors=new dijit.ColorPalette();
		var lineColorMenu=new dijit.PopupMenuItem({label: 'Line color', popup:lineColors});
		var lineSizeMenu=new dijit.MenuItem({label: 'Line size'});
		shapeSubMenu.addChild(lineColorMenu);
		shapeSubMenu.addChild(lineSizeMenu);
		
		shapeSubMenu.addChild(new dijit.MenuSeparator());
		
		var fillColors=new dijit.ColorPalette();
		var fillColorMenu=new dijit.PopupMenuItem({label: 'Fill color', popup:fillColors});
		shapeSubMenu.addChild(fillColorMenu);
		
		var fontSubMenu= new dijit.Menu({parentMenu:menu,style: 'width: 20px'});
		var fontColors=new dijit.ColorPalette();
		var fontColorMenu=new dijit.PopupMenuItem({label: 'Font color', popup:fontColors});
		var fontSizeMenu=new dijit.MenuItem({label: 'Font size'});
		var fontFamilyMenu=new dijit.MenuItem({label: 'Font family'});
		fontSubMenu.addChild(fontColorMenu);
		fontSubMenu.addChild(fontSizeMenu);
		fontSubMenu.addChild(fontFamilyMenu);
		
		fontSubMenu.addChild(new dijit.MenuSeparator());
		//fontSubMenu.addChild(new dijit.MenuItem({label:'Bold',iconClass:"dijitEditorIcon dijitEditorIconBold", onClick:bClick}));
		//fontSubMenu.addChild(new dijit.MenuItem({label:'Italic',iconClass:"dijitEditorIcon dijitEditorIconItalic", onClick:iClick}));
		var weightMenu = new dijit.MenuItem({label:'Bold'});
		var styleMenu = new dijit.MenuItem({label:'Italic'});
		fontSubMenu.addChild(weightMenu);
		fontSubMenu.addChild(styleMenu);
		
		lineColors.onChange=function(value){
			shape.beginEdit(ta.CommandTypes.Modify);
			shape.property('strokeColor', value);
			shape.draw();
			shape.endEdit();
		};
		
		lineSizeMenu.onClick=function(e){
			var l=prompt('Set new stroke width from 1 to 10:',shape.property('strokeWidth'));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.property('strokeWidth',l);
				shape.draw();
				shape.endEdit();
			}			
		};
		
		fillColors.onChange=function(value){
			shape.beginEdit(ta.CommandTypes.Modify);
			shape.property('shapeFill', value);
			shape.draw();
			shape.endEdit();
		};
		
		fontColors.onChange=function(value){
			shape.beginEdit(ta.CommandTypes.Modify);
			shape.property('fontFill', value);
			shape.draw();
			shape.endEdit();
		};
		
		fontSizeMenu.onClick=function(e){
			var l=prompt('Set new font size from 8px to 24px:',shape.property('fontSize'));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.property('fontSize',l);
				shape.draw();
				shape.endEdit();
			}						
		};
		
		fontFamilyMenu.onClick=function(e){
			var l=prompt('Set new font family:',shape.property('fontFamily'));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.property('fontFamily',l);
				shape.draw();
				shape.endEdit();
			}						
		};
		
		weightMenu.onClick=function(e){
			shape.beginEdit(ta.CommandTypes.Modify);
			if(shape.property('fontWeight')=="normal")
				shape.property('fontWeight', "bold");
			else shape.property('fontWeight', "normal");
			shape.draw();
			shape.endEdit();
		};
		
		styleMenu.onClick=function(e){
			shape.beginEdit(ta.CommandTypes.Modify);
			if(shape.property('fontStyle')=="normal")
				shape.property('fontStyle', "italic");
			else shape.property('fontStyle', "normal");
			shape.draw();
			shape.endEdit();
		};
		
		var shapemenu = new dijit.PopupMenuItem({label: 'shape', popup:shapeSubMenu});
		var fontmenu = new dijit.PopupMenuItem({label: 'font', popup:fontSubMenu});
		
		menu.addChild(shapemenu);
		menu.addChild(new dijit.MenuSeparator());
		menu.addChild(fontmenu);
		//div.appendChild(menu);
		menu.bindDomNode(dojo.byId("canvas"));
		menu.startup();
		//dojo.byId("canvas").appendChild(div);
	};
	
	p.initialize=function(){ };
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
		if(this.shape){
			if(!this.boundingBox){
				this.boundingBox=this.shape.createRect(r)
					.moveToBack()
					.setStroke({color:"#999", width:2, style:"Dash"})
					.setFill([238,238,238,0.3]);
				this.boundingBox.getEventSource().setAttribute("id",this.id+"-boundingBox");
				this.boundingBox.getEventSource().setAttribute("shape-rendering","crispEdges");
				this.figure._add(this);
			} else this.boundingBox.setShape(r);
			this.shape.getEventSource().style.cursor="move";
		}
	};
	p.setBinding=function(pt){
		//debugger;
		//this.shape.getEventSource().style.cursor="move";
		this.transform.dx+=pt.dx;
		this.transform.dy+=pt.dy;
		this.draw();
	};
	p.doChange=function(pt){ };
	/*p.getTextBox=function(){
		return dojox.gfx._base._getTextBox(this.property('label'),ta.ShapeBase.labelFont);
	};*/

	p.getTransform=function(){
		//console.log("ShapeBase.getTranform:"+this.transform.dx+","+this.transform.dy);
		return this.transform;
	};
	p.getLabel=function(){
		return this.property('label');
	}
	p.getTextPosition=function(){};
	p.getTextAlign=function(){	};
	p.setID=function(id){
		this.id=id;
	};
	p.getID=function(){
		return this.id;
	};
	p.setCurrentAnchor=function(id){};
	p.getCurrentAnchor=function(){};
	p.getCenter=function(){};
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
			this.shape.getEventSource().style.cursor="move";
			if(this.boundingBox){
				if(this.shape) this.shape.remove(this.boundingBox);
				this.boundingBox=null;
			}
		}
		for(var p in this.anchors){ this.anchors[p][method](); }
	};
	
	// for the connectors with 'start' id, there should be a better db for this 
	p.setStartAttachments=function(obj){};
	p.getStartAttachments=function(){};
	
	// for the connectors with 'end' id
	p.setEndAttachments=function(obj){}; 
	p.getEndAttachments=function(){};
	
	p.removeAttachments=function(){
		if(!this.hasAttachments) return;
		var as=this.getStartAttachments();
		var ae=this.getEndAttachments();
		for(var i=0; i<as.length; i++){
			if(as[i]) {
				as[i].remove();
				as[i].setMode(ta.ShapeBase.Modes.View);
				as[i].destroy();
				this.figure.remove(as[i]);
				this.figure._remove(as[i]);
			}
		}
		for(var i=0; i<ae.length; i++){
			if(ae[i]){
				ae[i].remove();
				ae[i].setMode(ta.ShapeBase.Modes.View);
				ae[i].destroy();
				this.figure.remove(ae[i]);
				this.figure._remove(ae[i]);
			}
		}
		this.hasAttachments=false;
		this.startAttachments=[]; 
		this.endAttachments=[];  
	}
	
	ta.ShapeBase.Modes={ View:0, Edit:1 };
	ta.ShapeBase.labelFont={family:"Arial", size:"16px", weight:"bold"};
	ta.ShapeBase.register=function(name){
		var cls=ta[name];
		ta.registerTool(name, function(p){dojo.mixin(p,{shape: name,shapebase:cls});return new ta.ShapeBaseTool(p)});
	};
	
	// serialization - saving
	p.writeCommonAttrs=function(){
		//debugger;
		return 'id="' + this.id + '" dojoxdiagram:type="' + this.type() + '"'
			+ ' transform="translate('+ this.transform.dx + "," + this.transform.dy + ')"'
			+ (this.data?(' ><![CDATA[data:'+dojo.toJson(this.data)+']]'):'');
	};
	
	// serialization -loading
	p.readCommonAttrs=function(obj){
		var i=0,cs=obj.childNodes,c;
		//console.log("ShapeBase.readCommonAttrs:cs:"+cs);
		//debugger;
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
})();
