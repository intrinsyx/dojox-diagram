//dojo.provide("dojox.diagram.Figure");
dojo.provide("Figure");
dojo.require("dojox.gfx");
dojo.require("dijit.form.ValidationTextBox");

(function(){
	var ta=dojox.diagram;
	ta.tools={};
	ta.registerTool=function(type, fn){ ta.tools[type]=fn; };
	//ta.Figure = function(){
	Figure = function(){
		//summary:
		//		the main file to handle all the mouse/key board events
		
		var self=this;
		var shapeCounter=1;
		this.shapes=[];
		this.image=null;
		this.imageSrc=null;
		this.size={ w:0, h:0 };
		this.surface=null;
		this.group=null;
		this.node=null;
		this.zoomFactor=1.00;	//	multiplier for zooming.	
		this.tools=null;	//	toolbar reference.
		this.nextKey=function(){ return shapeCounter++; };
		this.obj={};		//	lookup table for shapes.  Not keen on this solution.
		this.groupSelt=false; // for group selection
		this.subGroup=null;
		this.initUndoStack();
	
		//	what is selected.
		this.selected=[];
		this.hasSelections=function(){ return this.selected.length>0 };
		this.isSelected=function(obj){
			for(var i=0; i<self.selected.length; i++){
				if(self.selected[i]==obj) return true;
			}
			return false;
		};
		this.select=function(obj){		
			if(self.groupSelt){//multiple selections
				//self.subGroup=self.surface.createGroup();
				if(!self.isSelected(obj)){
					//debugger;
					//self.subGroup.add(obj);
					self.selected.push(obj);
				}
				else{
					//self.subGroup.remove(obj.getShape());
					self.deselect(obj);
				}
			}
			else{//	 single selection
				if(!self.isSelected(obj)){
					self.clearSelections();
					self.selected=[ obj ];
				}
				//else
				//self.deselect(obj);
				//self.selected=[];
			}

			//	force a bbox update, regardless
			obj.setMode(ta.ShapeBase.Modes.View);
			obj.setMode(ta.ShapeBase.Modes.Edit);
		};
		this.deselect=function(obj){
			var idx=-1;
			for(var i=0; i<self.selected.length; i++){
				if(self.selected[i]==obj){
					idx=i;
					break;
				}
			}
			if(idx>-1){
				obj.setMode(ta.ShapeBase.Modes.View);
				self.selected.splice(idx,1);
			}
			return obj;
		};
		this.clearSelections=function(){
			for(var i=0; i<self.selected.length; i++) {
				if(self.selected[i])
				self.selected[i].setMode(ta.ShapeBase.Modes.View);
			}
			self.selected=[]; 
		};
		this.replaceSelection=function(n, o){
			if(!self.isSelected(o)){
				self.select(n);
				return;
			}
			var idx=-1;
			for(var i=0; i<self.selected.length; i++){
				if(self.selected[i]==o){
					idx=i; break;
				}
			}
			if(idx>-1){
				self.selected.splice(idx,1,n);
			}
		};

		//	for the drag and drop handlers.
		this._c=null;		//	current shape
		this._ctr=null;	//	container measurements
		this._lp=null;		//	last position
		this._action=null;
		this._prevState=null;
		this._startPoint=null;	//	test to record a move.

		//	if an object isn't selected and we're dragging anyways.
		this._ctool=null;	//	default current tool is selection mode.
		this._start=null;
		this._end=null;
		this._absEnd=null;
		this._cshape=null;
		this.st=null;//for connectors
		this.en=null;//for connectors
		this.o_start=null;//for connectors
		this.o_end=null;//for connectors
		
		this.connectorGroup=[]; // connectors during group selection
		this.connectorStartGroup=[];
		this.connectorEndGroup=[];
		
		this._click=function(e){
			console.log("this._click:");
			if(self._c){
				dojo.stopEvent(e);
				return;
			}
			var o=self._fromEvt(e);
			if(!o){
				self.clearSelections();
				dojo.stopEvent(e);
			} else if(!o.setMode){
				//	skip me.
			} else self.select(o);
		};
		this._dblclick=function(e){
			//debugger;
			var o=self._fromEvt(e);
			if(o){
				self.onDblClickShape(o,e);
			}
			else{ // just for double click testing
				// dynamic widget creation example - button  
				 var div = dojo.doc.createElement('div');
				dojo.body().appendChild(div);
				var buttonNode = dojo.doc.createElement('div');
				div.appendChild(buttonNode);
				// now the widget stuff:
				var button = new dijit.form.Button({ label: "button test" },buttonNode);
				button.startup();
				
				var div = dojo.doc.createElement('div');
				dojo.byId("canvas").appendChild(div);
				var textNode = dojo.doc.createElement('textarea');
				//div.appendChild(textNode);
				var textbox=new dijit.form.TextBox({value: "textbox test"},textNode);
				//self.surface.getEventSource().appendChild(textbox.domNode);
				//self.surface.rawNode.appendChild(textbox.domNode);
				div.appendChild(textbox.domNode);
				textbox.startup();
			}
		};

		this._keydown=function(e){
			var prevent=false;
			//self.groupSelt=false;
			if(e.ctrlKey){
				//console.log("ctrl key pressed.this.groupSelt:"+self.groupSelt);
					if(e.keyCode==90|| e.keyCode==122){ //ctrl+z for undo
					//debugger;
						self.undo();
						self.groupSelt=false;
						prevent = true;
					}else if(e.keyCode==89 || e.keyCode==121){ //ctrl+y for redo
						self.redo();
						self.groupSelt=false;
						prevent = true;
					}
					if(e.keyCode==86){ //ctrl+v for duplicate
					//debugger;
					    if(self._c){
					    	self.cloneShape(self.group, self._c);
					    }
					    self.groupSelt=false;
					    prevent = true;
					}
					else self.groupSelt = true;
			}
			
			if(e.keyCode==dojo.keys.DOWN_ARROW||e.keyCode==dojo.keys.UP_ARROW||e.keyCode==dojo.keys.LEFT_ARROW||e.keyCode==dojo.keys.RIGHT_ARROW){
					//debugger;
					self.pan(e);	
					self.groupSelt=false;
					prevent = true;
			}
				
			if(e.keyCode==70 || e.keyCode==102){ //press 'f' or 'F' to bring the selected shape to front
				if(self._c){
					//console.log("movetofront:"+self._c.getBBox());
					self._c.shape.moveToFront();
				}
				self.groupSelt=false;
				prevent = true;
			}
			
			if(e.keyCode==66 || e.keyCode==98){ //press 'b' or 'B' to bring the selected shape to back
				if(self._c){
					//debugger;
					//var id = self._c.getID();
					self._c.shape.moveToBack();
					self.select(self._c);
					//self._c.setID(id);
				}
				self.groupSelt=false;
				prevent = true;
			}
					
			if(e.keyCode==46){//delete,     <!-- || e.keyCode==8){ //delete or backspace -->
				self._delete(self.selected);
				self.groupSelt=false;
				prevent = true;
			}

			if(prevent){
				dojo.stopEvent(e);
			}
		};
	
		//	drag handlers.
		this._md=function(e){
			var o=self._fromEvt(e);
			self._startPoint={ x:e.pageX, y:e.pageY };
			var win = dijit.getDocumentWindow(self.node.ownerDocument);
			//	figure out the coordinates within the iframe
			self._ctr=dojo._abs(self.node);
			var scroll=dojo.withGlobal(win,dojo._docScroll);
			//self._ctr={x:self._ctr.x-scroll.x, y:self._ctr.y-scroll.y};
			var X=e.clientX-self._ctr.x, Y=e.clientY-self._ctr.y;
			self._lp={ x:X, y:Y };
			//console.log("self.node:"+self.node);
			//console.log("self._ctr:"+self._ctr.x+","+self._ctr.y);
			//console.log("e.client:"+e.clientX+","+e.clientY);
			
			//	capture it separately
			self._start={ x:X, y:Y };
			self._end={ x:X, y:Y };
			self._absEnd={ x:X, y:Y };
			// drawing connectors
			if(self._ctool&&self._ctool.shape=="Connector"&&o&&(o.type()=="Rectangle"||o.type()=="RoundRect"||o.type()=="Ellipse"||o.type()=="Circle"||o.type()=="Triangle"||o.type()=="Hexagon")){
				self.groupSelt=false;
				self.select(o);
				self.st={x:o.getCenter().x, y: o.getCenter().y};
				self.o_start=o;
				self._c=o;
			}
			// selection mode
			else if(self._ctool&&self._ctool.shape=="Select"){
				if(!o){
					self.clearSelections();
					self._ctool.onMouseDown(e);//_Plugin.onMouseDown
					self.groupSelt=false;
					self._c=null;
				}
				else {
					if(o.type && o.type()!="Anchor"){
						self.select(o);	
						if (e.button==2) {self._rightClick(o,e);}			
					}
					if(self.groupSelt){	
						//debugger;					
						//self.findConnectorGroup(self.selected);
						for(var i=0; i<self.selected.length; i++) {
							self.selected[i].beginEdit();
							if(self.selected[i].getStartAttachments()){
								var sa_md=self.selected[i].getStartAttachments();
								for(var j=0; j<sa_md.length; j++) {
									if(sa_md[j]){//temporary solution
									//sa_md[i].anchors.start.beginEdit();
									self.connectorStartGroup.push(sa_md[j]);
									}	
								}
							}
							if(self.selected[i].getEndAttachments()){
								var ea_md=self.selected[i].getEndAttachments();
								for(var k=0; k<ea_md.length; k++) {
									if(ea_md[k]){ //temporary solution
									//ea_md[i].anchors.end.beginEdit();
									self.connectorEndGroup.push(ea_md[k]);	
									}
								}
							}
							
						}
						//connectors
						if(self.connectorStartGroup||self.connectorEndGroup){
							for(var i=0;i<self.connectorStartGroup.length;i++){
								var idx=-1, jdx=-1;
								for(var j=0;j<self.connectorEndGroup.length;j++){
									if(self.connectorStartGroup[i]==self.connectorEndGroup[j]){
										idx=i;
										jdx=j;
										self.connectorGroup.push(self.connectorStartGroup[i]);
										break;
									}
								}
								if(idx>-1&&jdx>-1){
									 self.connectorStartGroup.splice(idx, 1);
								     self.connectorEndGroup.splice(jdx, 1);
								}
							}							
						}
						
						if(self.connectorGroup){
							for(var i=0;i<self.connectorGroup.length; i++)
							self.connectorGroup[i].beginEdit();
						}
						if(self.connectorStartGroup){
							for(var i=0;i<self.connectorStartGroup.length; i++)
							self.connectorStartGroup[i].anchors.start.beginEdit();
						}
						if(self.connectorEndGroup){
							for(var i=0;i<self.connectorEndGroup.length; i++)
							self.connectorEndGroup[i].anchors.end.beginEdit()
						}
					}
					else{						
						o.beginEdit();
						if(o.type && o.type()!="Anchor"){
							if(o.getStartAttachments()){
								//debugger;
								var sa_md=o.getStartAttachments();
								for(var i=0; i<sa_md.length; i++) {
									if(sa_md[i])//temporary solution
									sa_md[i].anchors.start.beginEdit();
								}
							}
							if(o.getEndAttachments()){
								var ea_md=o.getEndAttachments();
								for(var i=0; i<ea_md.length; i++) {
									if(ea_md[i])//temporary solution
									ea_md[i].anchors.end.beginEdit();
								}
							}
						}
						//self._c=o;
					}
					self._c=o;
				}	
			}
			// drawing shapes: rectangle, round rectangle, ellipse, circle, triangle, path
			else if(self._ctool&&self._ctool.shape!="Connector"&&self._ctool.shape!="Select"){
				self.clearSelections();
				self._ctool.onMouseDown(e);//_Plugin.onMouseDown
				self.groupSelt=false;
				self._c=null;
			}
		};
		this._mm=function(e){
			if(!self._ctr &&!self.groupSelt&&(self._ctool.shape=="Connector"||self._ctool.shape=="Select")){
				var o_m;
				o_m=self._fromEvt(e);
				if(o_m&&!self._c){
					if(o_m.type && o_m.type()!="Anchor"){
						//self.select(o_m);
						o_m.setMode(ta.ShapeBase.Modes.View);
					}
				}
				else{
					 o_m=null;
				}
			}
			//if(!self._ctr) return;
			/*var x=e.clientX-self._ctr.x;
			var y=e.clientY-self._ctr.y;
			var dx=x-self._lp.x;
			var dy=y-self._lp.y;
			self._absEnd={x:x, y:y};*/
			if(self._ctr){//&&self._ctool&&self._ctool.shape!="Connector"){
				var x=e.clientX-self._ctr.x;
				var y=e.clientY-self._ctr.y;
				var dx=x-self._lp.x;
				var dy=y-self._lp.y;
				self._absEnd={x:x, y:y};
				if(self._c&&self._ctool&&self._ctool.shape!="Connector"){
					//if(self._c.type()!="Anchor") console.log("self._c:"+self._c.getID());
					//debugger;
					if(self.groupSelt){
						//debugger;
						for(var i=0; i<self.selected.length; i++) {
							self.selected[i].doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
							self.selected[i].setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
							
							self._lp={x:x, y:y};
						}
						// for connectors 	
						//debugger;
					 	if(self.connectorGroup){
							for(var i=0;i<self.connectorGroup.length; i++){
								self.connectorGroup[i].doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
								self.connectorGroup[i].setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
							}
						}
						if(self.connectorStartGroup){
							for(var i=0;i<self.connectorStartGroup.length; i++){
								self.connectorStartGroup[i].anchors.start.doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
								self.connectorStartGroup[i].anchors.start.setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
							}
						}
						if(self.connectorEndGroup){
							for(var i=0;i<self.connectorEndGroup.length; i++){
								self.connectorEndGroup[i].anchors.end.doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
								self.connectorEndGroup[i].anchors.end.setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
							}
						}// end for connectors
					}
					//don't move connectors
					else if(!self.groupSelt&&self._c.type && self._c.type()!="Connector"){
						//debugger;
						self._c.doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
						self._c.setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
						if(self._c.type && self._c.type()!="Anchor"){
							var sa_mm=self._c.getStartAttachments();
							if(sa_mm){								
								for(var i=0; i<sa_mm.length; i++) {
									if(sa_mm[i]){//temporary solution
										sa_mm[i].anchors.start.doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
										sa_mm[i].anchors.start.setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
									}
								}
							}
							var ea_mm=self._c.getEndAttachments();
							if(ea_mm){								
								for(var i=0; i<ea_mm.length; i++) {
									if(ea_mm[i]){//temporary solution
										ea_mm[i].anchors.end.doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
										ea_mm[i].anchors.end.setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
									}
								}
							}
						}
						self._lp={x:x, y:y};
					}				
				}
				else if(!self._c||(self._ctool&&self._ctool.shape=="Connector")){
					//debugger;
					console.log("current tool:"+self._ctool.shape);
					// no drawing in selection mode
					if(self._ctool&&self._ctool.shape=="Select"){
						return;
					}
					self._end={x:dx, y:dy};
					var rect={
						x:Math.min(self._start.x,self._absEnd.x),
						y:Math.min(self._start.y,self._absEnd.y),
						width:Math.abs(self._start.x-self._absEnd.x),
						height:Math.abs(self._start.y-self._absEnd.y)
					}
					var line={x1:self._start.x, y1:self._start.y,x2:self._absEnd.x,y2:self._absEnd.y}
					//debugger;
					if(self._ctool.shape!="Connector"){
						self._ctool.onMouseMoveRect(e,rect); //ShapeBase.onMouseMove
					}
					else if(self._ctool.shape=="Connector"){
						self._ctool.onMouseMoveLine(e,line);
					}
				}	
			}	
		};
		this._mu=function(e){
			//debugger;
			//drawing connector
			if(self._ctool&&self._ctool.shape=="Connector") {
				//debugger;
				o_mu = self._fromEvt(e);
				if (o_mu&&(o_mu.type()=="Rectangle"||o_mu.type()=="RoundRect"
				||o_mu.type()=="Ellipse"||o_mu.type()=="Circle"||o_mu.type()=="Triangle"||o_mu.type()=="Hexagon")){
					//console.log("on mouse up, the object is:"+o_mu.getID());
					if(self.st){
						self.en={x:o_mu.getCenter().x, y: o_mu.getCenter().y};
						self.o_end=o_mu;
					}
					if(self.st&&self.en&&self.st.x!=self.en.x&&self.st.y!=self.en.y){						
						var c=self._ctool._create(self.st,{x:self.en.x-self.st.x,y:self.en.y-self.st.y} ); //ShapeBase._create
						self.o_start.setStartAttachments(c);
						self.o_end.setEndAttachments(c);
						c.shapeIDforStart=self.o_start.getID();
						c.shapeIDforEnd=self.o_end.getID();
						//c.moveToBack(); //move the connector to the back of connected shapes.
						self.o_start.shape.moveToFront();
						self.o_end.shape.moveToFront();
						self.st=null;
						self.en=null;
						self.o_start=null;
						self.o_end=null;	
					}
				}
				self._ctool.onMouseUpLine(e);
			}
			else{
				if(self._c){
					//debugger;
					if(self.groupSelt){
						for(var i=0; i<self.selected.length; i++) {
							self.selected[i].endEdit();			
						}
						//for connectors
						if(self.connectorGroup){
							for(var i=0;i<self.connectorGroup.length; i++){
								self.connectorGroup[i].endEdit();
							}
						}
						if(self.connectorStartGroup){
							for(var i=0;i<self.connectorStartGroup.length; i++){
								self.connectorStartGroup[i].anchors.start.endEdit();
							}
						}
						if(self.connectorEndGroup){
							for(var i=0;i<self.connectorEndGroup.length; i++){
								self.connectorEndGroup[i].anchors.end.endEdit();
							}
						}//end for connectors
					}
					else if(!self.groupSelt&&self._c.type && self._c.type()!="Connector"){
						//	record the event.
						self._c.endEdit();
						if(self._c.type && self._c.type()!="Anchor"){
							var sa_mu=self._c.getStartAttachments();
							if(sa_mu){								
								for(var i=0; i<sa_mu.length; i++) {
									if(sa_mu[i])//temporary solution
									sa_mu[i].anchors.start.endEdit();
								}
							}
							var ea_mu=self._c.getEndAttachments();
							if(ea_mu){								
								for(var i=0; i<ea_mu.length; i++) {
									if(ea_mu[i])//temporary solution
									ea_mu[i].anchors.end.endEdit();
								}
							}
							
						}
						//self._c.setMode(ta.ShapeBase.Modes.Edit);
					}
				}else{
					
					self._ctool.onMouseUpRect(e);
				}
			}
			
			//	clear the stuff out.
			//self._c= //modified  for moveToFront and moveToBack
			self._ctr=self._lp=self._action=self._prevState=self._startPoint=null;
			self._cshape=self._start=self._end=self._absEnd=null;
			//clean the connectors group
			self.connectorStartGroup=[];
			self.connectorEndGroup=[];
			self.connectorGroup=[];
		};

		this._delete=function(arr,noundo){
			//debugger;
			if(!arr) return;
			for(var i=0; i<arr.length; i++){		
				if(arr[i]){
					//delete shape's connectors
					if(arr[i].hasAttachments&&!noundo) {
						arr[i].removeAttachments();
					}
					
					if(!noundo){
						//console.log("arr[i]:"+arr[i]);
						arr[i].remove();
					}
					arr[i].setMode(ta.ShapeBase.Modes.View);
					arr[i].destroy();
					self.remove(arr[i]);
					self._remove(arr[i]);
				}				
			}
			arr.splice(0,arr.length); // needs change for the connector removal
		};
		
		//add a pull down menu when right click the shape.
		this._rightClick=function(o,e){
			//alert("You clicked the right mouse button!");
			if(o&&(o.type()=="Rectangle"||o.type()=="RoundRect"||o.type()=="Ellipse"||o.type()=="Circle"||o.type()=="Triangle"||o.type()=="Hexagon")||o.type()=="Path"){
				//o.addMenu(o, e);
				o.addMenu(o, self._ctr);
			}
		};
	
	};

	//var p=ta.Figure.prototype;
	var p=Figure.prototype;
	p.initUndoStack=function(){
			this.history=new ta.UndoStack(this);
	};
	p.setTool=function(/*dojox.diagram._Plugin*/t){
		//debugger;
		this._ctool=t;
		//if(t.shape=="Connector") this.connectorDraw=false;
		//this._c=null;// for moveToFront and moveToBack
		//this.clearSelections();
		//console.log("setTool, the current shape:"+t.shape);
	};
	p.onDblClickShape=function(shape,e){
		var newtext;
		if(shape['onDblClick']){
			shape.onDblClick(shape, e);
		}
	};
	p.onCreateShape=function(shape){};
	p.onBeforeCreateShape=function(shape){};
	p.initialize=function(node){
		//debugger;
		this.node=node;
		this.surface=dojox.gfx.createSurface(node, this.size.w, this.size.h);
		this.surface.createRect({ x:0, y:0, width:this.size.w, height:this.size.h })
			.setFill("white");
		this.group=this.surface.createGroup();
		this.subGroup=this.surface.createGroup();//for group selection;

		//	kill any dragging events.
		this._cons=[];
		this._cons.push(dojo.connect(this.node, "ondragstart",   dojo, "stopEvent"));
		this._cons.push(dojo.connect(this.node, "onselectstart", dojo, "stopEvent"));

		//	hook up the drag system.
		/*this._cons.push(dojo.connect(this.surface.getEventSource(), 'onmousedown', this._md));
		this._cons.push(dojo.connect(this.surface.getEventSource(), 'onmousemove', this._mm));
		this._cons.push(dojo.connect(this.surface.getEventSource(), 'onmouseup', this._mu));*/
		//change from above code to the following to improve performance
		this._cons.push(dojo.connect(this.node, 'onmousedown', this._md));
		this._cons.push(dojo.connect(this.node, 'onmousemove', this._mm));
		this._cons.push(dojo.connect(this.node, 'onmouseup', this._mu));

		//this._cons.push(dojo.connect(this.surface.getEventSource(), 'ondblclick', this._dblclick));
		this._cons.push(dojo.connect(this.node, 'ondblclick', this._dblclick));
		this._cons.push(dojo.connect(this.surface.getEventSource().ownerDocument, 'onkeydown', this._keydown));
		
		//	rect hack.  for VML
		this.group.createRect({ x:0, y:0, width:this.size.w, height:this.size.h });
		this.image=this.group.createImage({ width:this.size.w, height:this.size.h, src:this.imageSrc });
	};
	p.destroy=function(isLoading){
		if(!this.node){
			return;
		}
		if(!isLoading){
			if(this.history) this.history.destroy();
			if(this._subscribed){
				dojo.unsubscribe(this._subscribed);
				delete this._subscribed;
			}
		}
		dojo.forEach(this._cons,dojo.disconnect);
		this._cons=[];

		this.node.removeChild(this.surface.getEventSource());
		this.group=this.subGroup=this.surface=null;
		this.obj={};
		this.shapes=[];
	};
	p.draw=function(){ };
	p.zoom=function(pct){
		//	first get the new dimensions
		this.zoomFactor=pct/100;
		var w=this.size.w*this.zoomFactor;
		var h=this.size.h*this.zoomFactor;
		//this.surface.setDimensions(w, h);
		//	then scale it.
		this.group.setTransform(dojox.gfx.matrix.scale(this.zoomFactor, this.zoomFactor));
		if(dojo.isIE){
			this.image.rawNode.style.width=Math.max(w,this.size.w);
			this.image.rawNode.style.height=Math.max(h,this.size.h);
		}
		//this.rect.setShape({width:w,height:h});
	};
	p.getFit=function(){
		//	assume fitting the parent node.
//		var box=dojo.html.getContentBox(this.node.parentNode);
		//the following should work under IE and FF, not sure about others though
		var wF=(this.node.parentNode.clientWidth-5)/this.size.w;
		var hF=(this.node.parentNode.clientHeight-5)/this.size.h;
		return Math.min(wF, hF)*100;
	};
	p.unzoom=function(){
		//	restore original size.
		this.zoomFactor=1;
		this.surface.setDimensions(this.size.w, this.size.h);
		this.group.setTransform();
	};
	
	p.pan=function(e){
		//console.log("test pan");
		if(e.keyCode==dojo.keys.LEFT_ARROW){
			this.group.applyLeftTransform({dx:-5, dy:0});
		}
		if(e.keyCode==dojo.keys.RIGHT_ARROW){
			this.group.applyLeftTransform({dx:5, dy:0});
		}
		if(e.keyCode==dojo.keys.UP_ARROW){
			this.group.applyLeftTransform({dx:0, dy:-5});
		}
		if(e.keyCode==dojo.keys.DOWN_ARROW){
			this.group.applyLeftTransform({dx:0, dy:5});
		}
	};
   
   // for shape clone by press ctrl+v
    p.cloneShape=function(base, shape){
	    // base: surface or group
	    // shape: any non-group shape
	    var offset = 20;
	    var newID = "item-"+this.nextKey();
	    //var font=(ta.ShapeBase.labelFont)?ta.ShapeBase.labelFont:{family:"Times", size:"16px"};
	    if(shape){	    	
			var node=dojox.xml.DomParser.parse('<g </g>'+shape.serialize()).documentElement;	//	should be either the document or the docElement
			//console.log("Figure.cloneShape-shape.serialize():"+shape.serialize());
			//console.log("Figure.cloneShape-node:"+node);
			var g=node.childrenByName("g")[0];
			//console.log("Figure.cloneShape-g.transform:"+g.getAttribute('transform'));
			//switch(shape.getShape().type){
			switch(shape.type()){
				//case "rect":{
				case "Rectangle":{
					var a=new ta["Rectangle"](this,newID); 
					break;
				}
				case "RoundRect":{
					var a=new ta["RoundRect"](this,newID); 
					break;
				}
				//case "ellipse":{
				case "Ellipse":{
					var a=new ta["Ellipse"](this, newID); 
					break;
				}
				//case "circle":{
				case "Circle":{
					var a=new ta["Circle"](this, newID);
					break;
				}
				//case "polyline":{
				case "Triangle":{
					var a=new ta["Triangle"](this, newID); 
					break;
				}
				case "Hexagon":{
					var a=new ta["Hexagon"](this, newID); 
					break;
				}
				//case "line":{
				case "Connector":{	
					var a=new ta["Connector"](this, newID);
					break;
				}
				//case "path":{
				case "Path":{
					var a=new ta["Path"](this, newID);
					break;
				}
			}

			a.initialize(g);
			this._add(a);
	    }
	    //this.select(a);
	    a.setID(newID);
		this.history.add(ta.CommandTypes.Create,a);
	};
	
	p.findConnectorGroup=function(selected){
		for(var i=0; i<selected.length; i++) {
			if(selected[i].getStartAttachments()){
				var sa_md=selected[i].getStartAttachments();
				for(var i=0; i<sa_md.length; i++) {
					if(sa_md[i]){//temporary solution
					//sa_md[i].anchors.start.beginEdit();
					self.connectorStartGroup.push(sa_md[i]);
					}	
				}
			}
			if(selected[i].getEndAttachments()){
				var ea_md=selected[i].getEndAttachments();
				for(var i=0; i<ea_md.length; i++) {
					if(ea_md[i]){ //temporary solution
					//ea_md[i].anchors.end.beginEdit();
					self.connectorGroup.push(ea_md[i]);	
					}
				}
			}
			
		}
		//connectors
		if(self.connectorStartGroup||self.connectorEndGroup){
			for(var i=0;i=self.connectorStartGroup.length;i++){
				var idx=-1, jdx=-1;
				for(var j=0;j=self.connectorEndGroup.length;j++){
					if(self.connectorStartGroup[i]==self.connectorEndGroup[j]){
						idx=i;
						jdx=j;
						self.connectorGroup.push(self.connectorStartGroup[i]);
						break;
					}
				}
				if(idx>-1&&jdx>-1){
					 self.connectorStartGroup.splice(idx, 1);
				     self.connectorEndGroup.splice(jdx, 1);
				     i--;
				}
			}							
		}
	};
	
	//	object registry for drag handling.
	p._add=function(obj){ this.obj[obj._key]=obj; };
	p._remove=function(obj){
		if(this.obj[obj._key]){
			delete this.obj[obj._key];
		}
	};
	p._get=function(key){
		if(key&&key.indexOf("bounding")>-1) key=key.replace("-boundingBox","");
		return this.obj[key];
	};
	p._fromEvt=function(e){
		var key=e.target.id+"";
		//debugger;
		if(key.length==0){
			//	ancestor tree until you get to the end (meaning this.surface)
			var p=e.target.parentNode;
			var node=this.surface.getEventSource();
			while(p && p.id.length==0 && p!=node){
				p=p.parentNode;
			}
			key=p.id;
			if(!key) {
				key=p.getAttribute("id");
			}
		}
		return this._get(key);
	};

	p.add=function(shape){
		 for(var i=0; i<this.shapes.length; i++){
			if(this.shapes[i]==shape){ return true; }
		}
		if(shape){
		//console.log("Figure.add.shape.id:"+shape.id);
		}
		this.shapes.push(shape);
		return true;
	};
	p.remove=function(shape){
		var idx=-1;
		for(var i=0; i<this.shapes.length; i++){
			if(this.shapes[i]==shape){
				idx=i;
				break;
			}
		}
		if(idx>-1) this.shapes.splice(idx, 1);
		return shape;
	};
	p.get=function(id){
		for(var i=0; i<this.shapes.length; i++){
			if(this.shapes[i].id==id) {
				console.log("the shape obtained is: "+this.shapes[i].getID());
				return this.shapes[i];
			}
		}
		return null;
	};

	/*p.convert=function(ann, t){
		//	convert an existing annotation to a different kind of annotation
		var ctor=t+"Annotation";
		if(!ta[ctor]) return;
		var type=ann.type(), id=ann.id, label=ann.label, mode=ann.mode; tokenId=ann.tokenId;
		var start, end, control, transform;
		switch(type){
			case "Preexisting":
			case "Lead":{
				transform={dx:ann.transform.dx, dy:ann.transform.dy };
				start={x:ann.start.x, y:ann.start.y};
				end={x:ann.end.x, y:ann.end.y };
				var cx=end.x-((end.x-start.x)/2);
				var cy=end.y-((end.y-start.y)/2);
				control={x:cx, y:cy};
				break;
			}
			case "Rectangle":
			case "RoundRect":
			case "Circle":
			case "Triangle":
			case "SingleArrow":
			case "DoubleArrow":{
				transform={dx:ann.transform.dx, dy:ann.transform.dy };
				start={x:ann.start.x, y:ann.start.y};
				end={x:ann.end.x, y:ann.end.y };
				control={x:ann.control.x, y:ann.control.y};
				break;
			}
			case "Underline":{
				transform={dx:ann.transform.dx, dy:ann.transform.dy };
				start={x:ann.start.x, y:ann.start.y};
				control={x:start.x+50, y:start.y+50 };
				end={x:start.x+100, y:start.y+100 };
				break;
			}
			case "Brace":{ }
		}
		var n=new ta[ctor](this, id);

		if(n.type()=="Underline"){
			//	special handling, since we never move the start point.
			n.transform={dx:transform.dx+start.x, dy:transform.dy+start.y };
		} else {
			if(n.transform) n.transform=transform;
			if(n.start) n.start=start;
		}
		if(n.end) n.end=end;
		if(n.control) n.control=control;
		n.label=label;
		n.token=dojo.lang.shallowCopy(ann.token);
		n.initialize();

		this.replaceSelection(n, ann);
		this._remove(ann);
		this.remove(ann);
		ann.destroy();

		//	this should do all the things we need it to do for getting it registered.
		n.setMode(mode);
	};*/
	p.setValue=function(text){
		var obj=dojox.xml.DomParser.parse(text);
		var node=this.node;
		this.load(obj,node);
		this.zoom(this.zoomFactor*100); //zoom to orignal scale
	};
	p.load=function(obj, n){
		//	create from pseudo-DOM
		if(this.surface){ this.destroy(true); }
		//console.log("Figure.p.load, obj:"+obj);
		var node=obj.documentElement;	//	should be either the document or the docElement
		//console.log("Figure.p.load, node:id, data:"+node.id+","+node.data);
		this.size={ w:parseFloat(node.getAttribute('width'),10), h:parseFloat(node.getAttribute('height'),10) };
		var g=node.childrenByName("g")[0];
		//console.log("Figure.p.load, g, id, data:"+g.id+","+g.data);
		var img=g.childrenByName("image")[0];
		this.imageSrc=img.getAttribute("xlink:href");
		this.initialize(n);

		//	now let's do the annotations/shapes
		var ann=g.childrenByName("g");
		for(var i=0; i<ann.length; i++) {
			//console.log("Figure.p.load, ann[i]:"+ann[i].id+",transform:"+ann[i].getAttribute('transform'));
			this._loadShape(ann[i]);
		}
		if(this._loadDeferred){
			this._loadDeferred.callback(this);
			this._loadDeferred=null;
		}
		this.onLoad();
	};
	p.onLoad=function(){};
	p._loadShape=function(obj){
		var ctor=obj.getAttribute('dojoxdiagram:type');
		//debugger;
		if(ta[ctor]){
			var a=new ta[ctor](this, obj.id);
			//debugger;
			a.initialize(obj);
			this.nextKey();
			a.setMode(ta.ShapeBase.Modes.View);
			this._add(a);
			return a;
		}
		return null;
	};
	   
	p.onUndo=function(){};
	p.onBeforeUndo=function(){};
	p.onRedo=function(){};
	p.onBeforeRedo=function(){};
	p.undo=function(){
		if(this.history){
			this.onBeforeUndo();
			this.history.undo();
			this.onUndo();
		}
	};
	p.redo=function(){
		if(this.history){
			this.onBeforeRedo();
			this.history.redo();
			this.onRedo();
		}
	};
	p.serialize=function(){
		var s='<svg xmlns="http://www.w3.org/2000/svg" '
			+ 'xmlns:xlink="http://www.w3.org/1999/xlink" '
			+ 'xmlns:dojoxdiagram="http://dojotoolkit.org/dojox/sketch" '
			+ 'width="' + this.size.w + '" height="' + this.size.h + '">'
			+ '<g>'
			+ '<image xlink:href="' + this.imageSrc + '" x="0" y="0" width="' 
			+ this.size.w + '" height="' + this.size.h + '" />';
		for(var i=0; i<this.shapes.length; i++) {
			//console.log("i:"+i+",serializing:");
			//try{
			s+= this.shapes[i].serialize();
			//}
			//catch(e){
				//alert(e.message);
			//}
			//var num = i+1;
			//console.log("this.shapes.length:"+this.shapes.length+",current shape:"+num+",shapesi]:"+this.shapes[i].type);
		}
		s += '</g></svg>';
		return s;
	};
	p.getValue=p.serialize;
})();
