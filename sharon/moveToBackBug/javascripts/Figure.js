//dojo.provide("dojox.diagram.Figure");
dojo.provide("Figure");
dojo.experimental("dojox.diagram");

dojo.require("dojox.gfx");
//dojo.require("dojox.diagram.UndoStack");

(function(){
	var ta=dojox.diagram;
	ta.tools={};
	ta.registerTool=function(type, fn){ ta.tools[type]=fn; };
	//ta.Figure = function(){
	Figure = function(){
		var self=this;
		var annCounter=1;

		this.shapes=[];
		this.image=null;
		this.imageSrc=null;
		this.size={ w:0, h:0 };
		this.surface=null;
		this.group=null;
		this.node=null;

		this.zoomFactor=1.00;	//	multiplier for zooming.
		
		this.tools=null;	//	toolbar reference.
		this.nextKey=function(){ return annCounter++; };

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
			if(!self.isSelected(obj)){
				//	force single select
				self.clearSelections();
				self.selected=[ obj ];
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
			for(var i=0; i<self.selected.length; i++) 
				self.selected[i].setMode(ta.ShapeBase.Modes.View);
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
		this._ctool=null;	//	hard code it.
		this._start=null;
		this._end=null;
		this._absEnd=null;
		this._cshape=null;
		
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
		};

		this._keydown=function(e){
			var prevent=false;
			
			if(e.ctrlKey){
					if(e.keyCode==90){ //ctrl+z
						self.undo();
						prevent = true;
					}else if(e.keyCode==89){ //ctrl+y
						self.redo();
						prevent = true;
					}
			}

			if(e.keyCode==46 || e.keyCode==8){ //delete or backspace
				self._delete(self.selected);
				prevent = true;
			}
				
			if(e.keyCode==70 || e.keyCode==102){ //f or F
			//debugger;
				if(self._c){
					//console.log("movetofront:"+self._c.getBBox());
					self._c.shape.moveToFront();
				}
				prevent = true;
			}
			
			if(e.keyCode==66 || e.keyCode==98){ //b or B
			//debugger;
				if(self._c){
					//debugger;
					//var id = self._c.getID();
					self._c.shape.moveToBack();
				}
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
			self._ctr={x:self._ctr.x-scroll.x, y:self._ctr.y-scroll.y};
			var X=e.clientX-self._ctr.x, Y=e.clientY-self._ctr.y;
			self._lp={ x:X, y:Y };

			//	capture it separately
			self._start={ x:X, y:Y };
			self._end={ x:X, y:Y };
			self._absEnd={ x:X, y:Y };
			if(!o){
				self.clearSelections();
				self._ctool.onMouseDown(e);
			}else{
				if(o.type && o.type()!="Anchor"){
					self.select(o);
				}
				o.beginEdit();
				self._c=o;
			}
		};
		this._mm=function(e){
			if(!self._ctr) return;
			var x=e.clientX-self._ctr.x;
			var y=e.clientY-self._ctr.y;
			var dx=x-self._lp.x;
			var dy=y-self._lp.y;
			self._absEnd={x:x, y:y};
			if(self._c){
				self._c.doChange({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
				self._c.setBinding({dx:Math.round(dx/self.zoomFactor), dy:Math.round(dy/self.zoomFactor)});
				self._lp={x:x, y:y};
			}
			else {
				self._end={x:dx, y:dy};
				var rect={
					x:Math.min(self._start.x,self._absEnd.x),
					y:Math.min(self._start.y,self._absEnd.y),
					width:Math.abs(self._start.x-self._absEnd.x),
					height:Math.abs(self._start.y-self._absEnd.y)
				}
				self._ctool.onMouseMove(e,rect);
			}
		};
		this._mu=function(e){
			if(self._c){
				//	record the event.
				self._c.endEdit();
			}else{
				self._ctool.onMouseUp(e);
			}

			//	clear the stuff out.
			self._c=self._ctr=self._lp=self._action=self._prevState=self._startPoint=null;
			self._cshape=self._start=self._end=self._absEnd=null;
		};

		this._delete=function(arr,noundo){
			for(var i=0; i<arr.length; i++){
				//var before=arr[i].serialize();
				if(!noundo){
					arr[i].remove();
				}
				arr[i].setMode(ta.ShapeBase.Modes.View);
				arr[i].destroy();
				self.remove(arr[i]);
				self._remove(arr[i]);
			}
			arr.splice(0,arr.length);
		};
	};

	var p=Figure.prototype;
	p.initUndoStack=function(){
			this.history=new ta.UndoStack(this);
	};
	p.setTool=function(/*dojox.diagram._Plugin*/t){
		this._ctool=t;
		this.clearSelections();
	};
	p.onDblClickShape=function(shape,e){
		if(shape['onDblClick']){
			shape.onDblClick(e);
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
		
		//	rect hack.  Fcuking VML>
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
	
	//	object registry for drag handling.
	p._add=function(obj){ this.obj[obj._key]=obj; };
	p._remove=function(obj){
		if(this.obj[obj._key]){
			delete this.obj[obj._key];
		}
	};
	p._get=function(key){
		if(key&&key.indexOf("bounding")>-1) key=key.replace("-boundingBox","");
		console.log("Figure._get(key):"+key+",obj[key]:"+this.obj[key]);
		return this.obj[key];
	};
	p._fromEvt=function(e){
		var key=e.target.id+"";
		if(key.length==0){
			//	ancestor tree until you get to the end (meaning this.surface)
			var p=e.target.parentNode;
			var node=this.surface.getEventSource();
			//console.log("p:"+p+",node:"+node+",key:"+key);
			while(p && p.id.length==0 && p!=node){
				console.log("p:"+p);
				p=p.parentNode;
			}
			console.log("id:"+p.id);
			//p.style.cursor="move";
			key=p.id;
			if(!key) key=p.getAttribute("id");
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
				return this.shapes[i];
			}
		}
		return null;
	};

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
			//console.log("this.shapes.length:"+this.shapes.length+",current shape:"+num+",shapes[i]:"+this.shapes[i].type);
		}
		s += '</g></svg>';
		return s;
	};
	p.getValue=p.serialize;
})();
