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
		this.transform={ dx:0, dy:0 }; // translate
		this.rotate =0; // rotation angle in degree
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
			'fontStyle':"normal",    //text annotation's font style, either normal or italic		
			'imgSrc':"../MyEditor/images/image.gif" 	//image source,for image object
		};
		
		this.figure=figure;
		this.mode=ta.ShapeBase.Modes.Edit;
		this.shape=null;	
		this.boundingBox=null;	
		this.hasAttachments=false;
		this.anchors={};
		//for text wraping
		this.eachLine=[];
		this.maxLineNumber=20; // for text wrap, maxim 20 lines of text.
		
		if(this.figure) this.figure.add(this);
	};
	
	dojo.declare("dojox.diagram.ShapeBaseTool", ta._Plugin, {
		onMouseMoveLine: function(e,line){
			//	e: 'onmousemove' event from Figure._mm(e)
			//	line: a visual line during 'connector' mode with the mouse movement
				if(this._cshape){ 
					//console.log("ShapeBase.onMouseMove-this._cShape");
					this._cshape.setShape(line);
				} else {
					//console.log("ShapeBase.onMouseMove- !this._cShape");
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
		//TD
		onMouseMovePoly: function(e,rect){
			//	e: 'onmousemove' event from Figure._mm(e)
			//	poly: each side of the polygon
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
		onMouseUpLine: function(e){
			//	e: 'onmouseup' event from Figure._mu(e)
			
			var f=this.figure;
			if(this._cshape) {
				f.surface.remove(this._cshape);
				this._cshape=null;
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
		//TD
		onMouseUpPoly: function(e){
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
		_create: function(start,end){
			//	create a new shape, needs to be accessible from the dragging functions.
			//	start: Figure._start - the mouse-click start point
			//	end: Figure._end - the mouse-move end point
			
			var f=this.figure;
			
			//the next key/id - shape count number
			var _=f.nextKey();
			
			//if the id already exists, generate the next key number.
			while(this.figure.get("item-"+_)!==null){
				_=f.nextKey();
			}
			//individual shape constructor - polymorphism
			var a=new (this.shapebase)(f, "item-"+_);
			
			//shape id - ShapeBase.setID(id)
			a.setID("item-"+_);

			//initial transform information, combined with the zoom and pan effects
			//a.transform={dx:(start.x/f.zoomFactor - f.panMove.x), dy:(start.y/f.zoomFactor - f.panMove.y )};
			if(f.zoomFactor==1){
				a.transform={dx:(start.x/f.zoomFactor - f.panMove.x), dy:(start.y/f.zoomFactor - f.panMove.y )};
			}
			else {//if(f.zoomFactor<1.0){
				//console.log("zoomfactor:"+f.zoomFactor);
				a.transform={dx:((start.x- (f.size.w/2)*(1-f.zoomFactor))/f.zoomFactor - f.panMove.x), dy:((start.y-(f.size.h/2)*(1-f.zoomFactor))/f.zoomFactor - f.panMove.y)};
			}
			/*else if(f.zoomFactor>1.0){
				a.transform={dx:((start.x- (f.size.w/2)*(1-f.zoomFactor))/f.zoomFactor - f.panMove.x), dy:((start.y-(f.size.h/2)*(1-f.zoomFactor))/f.zoomFactor - f.panMove.y)};
			}*/
			
			a.end={ x:end.x/f.zoomFactor, y:end.y/f.zoomFactor};

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
		/*this.property('label','');
		this.draw();
		this.property('label',previousText);*/
		
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
	p.addMenu=function(shape,e){
		//alert("You clicked the right mouse button on a rectangle!");
		var menu = new dijit.Menu({style:'width: 40px',targetNodeIds:["container"], popupDelay: 0});
		
		var shapeSubMenu= new dijit.Menu({parentMenu:menu,style: 'width: 40px'});
		var lineColors=new dijit.ColorPalette();
		// the shape's outline color menu
		var lineColorMenu=new dijit.PopupMenuItem({label: 'Line color', iconClass:"dojoxDiagramIconLineColor",popup:lineColors});
		//the shape's outline width menu
		var lineSizeMenu=new dijit.MenuItem({label: 'Line width', iconClass:"dojoxDiagramIconLineSize"});
		// shape top corner's x coordinate
		var shapeTopMenu=new dijit.MenuItem({label: 'Top'});
		// shape top corner's y coordinate
		var shapeLeftMenu=new dijit.MenuItem({label: 'Left'});
		// shape's width
		var shapeWidthMenu=new dijit.MenuItem({label: 'Width'});
		// shape's height
		var shapeHeightMenu=new dijit.MenuItem({label: 'Height'});
		var rotateCCWMenu=new dijit.MenuItem({label: 'Rotate CCW'});
		var rotateCWMenu=new dijit.MenuItem({label: 'Rotate CW'});
		var fillColors=new dijit.ColorPalette();
		var fillColorMenu=new dijit.PopupMenuItem({label: 'Fill color', iconClass:"dojoxDiagramIcon dojoxDiagramIconFillColor",popup:fillColors});
		shapeSubMenu.addChild(lineColorMenu);
		shapeSubMenu.addChild(lineSizeMenu);
		shapeSubMenu.addChild(new dijit.MenuSeparator());		
		shapeSubMenu.addChild(shapeTopMenu);
		shapeSubMenu.addChild(shapeLeftMenu);
		shapeSubMenu.addChild(new dijit.MenuSeparator());		
		shapeSubMenu.addChild(shapeWidthMenu);
		shapeSubMenu.addChild(shapeHeightMenu);		
		shapeSubMenu.addChild(new dijit.MenuSeparator());
		shapeSubMenu.addChild(rotateCCWMenu);
		shapeSubMenu.addChild(rotateCWMenu);
		shapeSubMenu.addChild(new dijit.MenuSeparator());
		shapeSubMenu.addChild(fillColorMenu);
		
		menu.addChild(new dijit.PopupMenuItem({label: 'shape', popup:shapeSubMenu}));
		menu.addChild(new dijit.MenuSeparator());
		
		var fontSubMenu= new dijit.Menu({parentMenu:menu,style: 'width: 40px'});
		var fontColors=new dijit.ColorPalette();
		var fontColorMenu=new dijit.PopupMenuItem({label: 'Font color', iconClass:"dojoxDiagramIcon dojoxDiagramIconFontColor",popup:fontColors});
		var fontSizeMenu=new dijit.MenuItem({label: 'Font size'});
		var fontFamilyMenu=new dijit.MenuItem({label: 'Font family'});
		var weightMenu = new dijit.MenuItem({label:'Bold', iconClass:"dojoxDiagramIcon dojoxDiagramIconBold"});
		var styleMenu = new dijit.MenuItem({label:'Italic', iconClass:"dojoxDiagramIcon dojoxDiagramIconItalic"});
		fontSubMenu.addChild(fontColorMenu);
		fontSubMenu.addChild(fontSizeMenu);
		fontSubMenu.addChild(fontFamilyMenu);		
		fontSubMenu.addChild(new dijit.MenuSeparator());
		fontSubMenu.addChild(weightMenu);
		fontSubMenu.addChild(styleMenu);
		
		menu.addChild(new dijit.PopupMenuItem({label: 'font', popup:fontSubMenu}));
		
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
		
		shapeTopMenu.onClick=function(e){
			var l=prompt("Shape's y coordinate:",(shape.start.y+shape.transform.dy));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				//update connectors , TD.
				//debugger;
				var start=shape.getStartAttachments();
				if(start){
					console.log("start is true.");
					for(var i=0; i<start.length; i++) {
						if(start[i])//temporary solution
						start[i].anchors.start.beginEdit(ta.CommandTypes.Modify);
					}
				}
				var end=shape.getEndAttachments();
				if(end){
					for(var i=0; i<end.length; i++) {
						if(end[i])//temporary solution
						end[i].anchors.end.beginEdit(ta.CommandTypes.Modify);
					}
				}

				shape.doChange({dx:Math.round(0), dy: Math.round(l-shape.start.y-shape.transform.dy)});
				shape.setBinding({dx:Math.round(0), dy: Math.round(l-shape.start.y-shape.transform.dy)});	
				// update connectors, connector's start or end point changes are dx/2, dy/2
				if(start){
					for(var i=0; i<start.length; i++) {
						if(start[i])//temporary solution
						start[i].anchors.start.doChange({dx:Math.round(0), dy: Math.round(l-shape.start.y-shape.transform.dy)});
						start[i].anchors.start.setBinding({dx:Math.round(0), dy: Math.round(l-shape.start.y-shape.transform.dy)});
					}
				}
				if(end){
					for(var i=0; i<end.length; i++) {
						if(end[i])//temporary solution
						end[i].anchors.end.doChange({dx:Math.round(0), dy: Math.round(l-shape.start.y-shape.transform.dy)});
						end[i].anchors.end.setBinding({dx:Math.round(0), dy: Math.round(l-shape.start.y-shape.transform.dy)});
					}		
				}
				
				shape.endEdit();
				//update connectors
				if(start){
					for(var i=0; i<start.length; i++) {
						if(start[i])//temporary solution
						start[i].anchors.start.endEdit();
					}
				}
				if(end){
					for(var i=0; i<end.length; i++) {
						if(end[i])//temporary solution
						end[i].anchors.end.endEdit();
					}
				}
			}			
		};
		
		shapeLeftMenu.onClick=function(e){
			var l=prompt("Shape's x coordinate:",(shape.start.x+shape.transform.dx));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.setBinding({dx:Math.round(l-shape.start.x-shape.transform.dx), dy: Math.round(0)});
				shape.endEdit();
			}			
		};
		
		shapeWidthMenu.onClick=function(e){
			var l=prompt("Shape's width:",(shape.end.x-shape.start.x));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.anchors.E.setBinding({dx:Math.round(l-shape.end.x+shape.start.x), dy: Math.round(0)});
				shape.endEdit();
			}			
		};
		
		shapeHeightMenu.onClick=function(e){
			var l=prompt("Shape's height:",(shape.end.y-shape.start.y));
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.anchors.S.setBinding({dx: Math.round(0),dy:Math.round(l-shape.end.y+shape.start.y) });
				shape.endEdit();
			}			
		};
		
		rotateCCWMenu.onClick=function(e){
			var l=prompt("Enter an angle in degrees to rotate the shape counter clockwise(0-180):",0);
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.shape.setTransform([dojox.gfx.matrix.rotategAt(-l,shape.getCenter().x, shape.getCenter().y), shape.shape.getTransform()]);
				shape.transform= shape.shape.getTransform();
				shape.rotate -=parseFloat(l,10);; // rotation angle in degree
				shape.draw();						
				shape.endEdit();
			}			
		};
		
		rotateCWMenu.onClick=function(e){
			var l=prompt("Enter an angle in degrees to rotate the shape clockwise(0-180):",0);
			if(l!==false){
				shape.beginEdit(ta.CommandTypes.Modify);
				shape.shape.setTransform([dojox.gfx.matrix.rotategAt(l,shape.getCenter().x, shape.getCenter().y), shape.shape.getTransform()]);
				shape.transform= shape.shape.getTransform();
				shape.rotate +=parseFloat(l,10);; // rotation angle in degree
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
		
		//menu.bindDomNode(dojo.byId("canvas"));
		//debugger;
		menu.startup();
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

	p.setTransform=function(t){
		//console.log("ShapeBase.getTranform:"+this.transform.dx+","+this.transform.dy);
		this.transform=t;
	};
	
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
	
	p.wordWrap=function(){
		/*
		 * greedy algorithm for word wrap:
		 * http://en.wikipedia.org/wiki/Word_wrap
		 * SpaceLeft := LineWidth
			for each Word in Text
			    if Width(Word) > SpaceLeft
			        insert line break before Word in Text
			        SpaceLeft := LineWidth - Width(Word)
			    else
			        SpaceLeft := SpaceLeft - (Width(Word) + SpaceWidth)
		 * */
		//debugger;
		var linewidth= this.getBBox().width-8;
		//console.log("line width:"+linewidth);
		var spaceleft=linewidth;
		var linebreaks=0;
		var wordposition=[];
		var words = this.property('label').split(" ");
		//console.log("words length:"+words.length);
		for(var i=0;i<words.length;i++){
			try{
				// catch the the string with the space ending
				//console.log("i:"+i);
				if(!words[i]) break;				
			}
			catch(e){
				console.log(e.message);	
				i--;
				break;				
			}
			var eachword=this.shape.createText({text:words[i]})
				.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
				.setFill(this.property('fontFill'));
			//console.log("eachword textwidth:"+eachword.getTextWidth());
			if(eachword.getTextWidth() > (spaceleft-4)){
				//insert line break before Word in Text
				linebreaks++;
				wordposition.push(i);
				spaceleft=linewidth - eachword.getTextWidth()-4;
				//console.log("eachword.getTextWidth() > spaceleft, space left:"+spaceleft+", linebreaks:"+linebreaks);
			}
			else {
				spaceleft=spaceleft-eachword.getTextWidth()-4; // 4 is the estimated pixel numbers for the space between words.
				//console.log("eachword.getTextWidth() <= spaceleft, space left:"+spaceleft);
			}
			this.shape.remove(eachword);
		}
		//debugger;
		//console.log("line breaks:"+linebreaks+ ", text annotation:"+this.property('label'));
		if(linebreaks>0) {
			//this.shape.remove(this.labelShape);
			//debugger;
			this.labelShape.setShape(dojox.gfx.defaultText);
			var wordat=0;
			var j;
			var previousWords="";
			for(j=0; j<linebreaks; j++){
				var thisline="";
				for(k=wordat; k<wordposition[j];k++){
					thisline=thisline+words[k]+" ";
				}
				wordat=k;
				//console.log("font size:"+this.property('fontSize'));
				this.eachLine[j].setShape({x:this.textPosition.x, y:((this.textPosition.y)+((j-Math.ceil(linebreaks/2))*(this.property('fontSize')))), text:thisline, align:this.textAlign})
					.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
					.setFill(this.property('fontFill'));
				previousWords= previousWords+thisline;
			}
			//the last line after the line break.
			var lastline=(this.property('label')).substring(previousWords.length);

			this.eachLine[j].setShape({x:this.textPosition.x, y:((this.textPosition.y)+((j-Math.ceil(linebreaks/2))*(this.property('fontSize')))), text:lastline, align:this.textAlign})
					.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
					.setFill(this.property('fontFill'));
			j++;
			while(j<this.maxLineNumber){
				this.eachLine[j].setShape(dojox.gfx.defaultText);
				j++;
			}
		}
		else if(linebreaks==0){
			try{
				if(this.eachLine[0]){
					this.eachLine[0].setShape(dojox.gfx.defaultText);
					this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
						.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
						.setFill(this.property('fontFill'));
				}
				if(this.eachLine[1]){
					this.eachLine[1].setShape(dojox.gfx.defaultText);
				}
			}catch(e){
				alert(e.message);
			}
			return;
		}
		//console.log("------------------------------------");
		//console.log("------------------------------------");
	};
	
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
			+ ' transform="rotate(' + this.rotate +') translate('+ this.transform.dx + "," + this.transform.dy + ') "'
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
			/*var t=obj.getAttribute('transform').replace("translate(","");
			var pt=t.split(",");
			this.transform.dx=parseFloat(pt[0],10);
			this.transform.dy=parseFloat(pt[1],10);*/
			var rt = obj.getAttribute('transform').split(" ");
			var r=rt[0].replace("rotate(","");
			this.rotate=parseFloat(r,10);
			var angle=this.rotate/180*Math.PI;
			if(this.rotate<0){
				this.transform.xx=Math.cos(angle);
				this.transform.xy=-Math.sin(angle);
				this.transform.yx=Math.sin(angle);
				this.transform.yy=Math.cos(angle);
			}
			else if(this.rotate>0){
				this.transform.xx=Math.cos(angle);
				this.transform.xy=Math.sin(angle);
				this.transform.yx=-Math.sin(angle);
				this.transform.yy=Math.cos(angle);
			}
			var t=rt[1].replace("translate(", "");
			var pt=t.split(",");
			this.transform.dx=parseFloat(pt[0],10);
			this.transform.dy=parseFloat(pt[1],10);
			//console.log("ShapeBase.readCommonAttrs:obj.transform:"+this.transform.dx+","+this.transform.dy);
		}
	};
})();