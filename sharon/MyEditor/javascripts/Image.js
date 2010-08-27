dojo.provide("dojox.diagram.Image");
dojo.require("dojox.diagram.ShapeBase");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

(function(){
	var ta=dojox.diagram;
	ta.Image=function(figure, id){
		//summary:
		//		A image with text annotation, extended from ShapeBase
		
		//		ta.ShapeBase.call(this, figure, id) - call ShapeBase.constructor
		
		//serialized attributes:
		//		start (x, y): the north-west point coordinate of the image, keep the name = 'start' as from dojox.sketch.
		//		end (x, y): the south-east point coordinate, keep the name - 'end' as from dojox.sketch.
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
		// 			'imgSrc':"../MyEditor/images/image.gif"				//image source	
		//				}; from ShapeBase
		
		//local variables:
		//		imageShape(object): the image
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
		this.textPosition={ x:196, y:196 };		
		this.textAlign="middle"; //"middle", or "start"
		
		this.imageShape=null;
		this.labelShape=null;
		this.property('label',this.type());
		//this.N={x:this.start.x+(this.end.x-this.start.x)/2, y:this.start.y};
		this.N={x:0,y:0};
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
		//for text wraping
		this.eachLine=[];
		this.maxLineNumber=20; // for text wrap, maxim 20 lines of text. 
	};
	
	ta.Image.prototype=new ta.ShapeBase;
	var p=ta.Image.prototype;
	p.constructor=ta.Image;
	p.type=function(){ return 'Image'; };
	p.getType=function(){ return ta.Image; };

	//calculate text position
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
		/*var x=Math.min(this.start.x, this.NE.x, this.end.x);
		var y=Math.min(this.NE.y, this.end.y);
		var w=Math.max(this.start.x, this.NE.x, this.end.x);
		var h=Math.max(this.start.y, this.NE.y, this.end.y);
		this.start={ x:x, y:y };
		this.end={ x:w, y:h };*/
		
		this.textPosition={ x:this.start.x+(w/2),y:this.start.y+(h/2) };
		
	};
	
	// load the image from svg file
	p.apply=function(obj){
		if(!obj) return;
		if(obj.documentElement) obj=obj.documentElement;
		this.readCommonAttrs(obj);
		
		for(var i=0; i<obj.childNodes.length; i++){
			var c=obj.childNodes[i];
			if(c.localName=="text") {
				this.property('label',c.childNodes.length?c.childNodes[0].nodeValue:'');
				if(c.getAttribute('style')!==null){
					var fontstyle=c.getAttribute('style');
					var ss1=fontstyle.split(";"); 
					var fontcolor=ss1[0].split(":");
					this.property('fontFill',fontcolor[1]);//font's color
					var fontsize=ss1[1].split(":");
					this.property('fontSize',fontsize[1]);//font's size
					var fontfamily=ss1[2].split(":");
					this.property('fontFamily',fontfamily[1]); //font's family
					var fontweight=ss1[3].split(":");
					this.property('fontWeight',fontweight[1]); //font's weight
					var fontstyle=ss1[4].split(":");
					this.property('fontStyle',fontstyle[1]); //font's style
				}
			}
		
			else if(c.localName=="img"){				
				if(c.getAttribute('style')!==null){
					var shapestyle=c.getAttribute('style'); 
					var url=shapestyle.split(":");
					this.property('imgSrc',url);//image's source file	
				}
				if(c.getAttribute('x')!==null) this.start.x=parseFloat(c.getAttribute('x'), 10);
				if(c.getAttribute('width')!==null) this.end.x=parseFloat(c.getAttribute('width'), 10)+parseFloat(c.getAttribute('x'), 10);
				if(c.getAttribute('y')!==null) this.start.y=parseFloat(c.getAttribute('y'), 10);
				if(c.getAttribute('height')!==null) this.end.y=parseFloat(c.getAttribute('height'), 10)+parseFloat(c.getAttribute('y'), 10);
				
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
		//this._rot();
		this._pos();

		//	draw the shapes
		this.shape=this.figure.group.createGroup();
		this.shape.getEventSource().setAttribute("id", this.id);
		if(this.transform.dx||this.transform.dy) this.shape.setTransform(this.transform);

		this.property('imgSrc',"../MyEditor/images/image.gif");
		this.imageShape=this.shape.createImage({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y, src:this.property('imgSrc')})
					//.setFill(this.property('shapeFill'))
					//.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	
					
		this.labelShape=this.shape.createText({
			x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));	
		for(var i=0; i<this.maxLineNumber; i++){ 
			this.eachLine[i]=this.shape.createText(dojox.gfx.defaultText);
		}
		//this.wordWrap();
	};
	p.destroy=function(){
		if(!this.shape) return;
		this.shape.remove(this.labelShape);		
		this.shape.remove(this.imageShape);		
		this.figure.group.remove(this.shape);
		this.shape=this.labelShape=this.imageShape=null;
	};
	p.getBBox=function(){
		var x=Math.min(this.start.x, this.end.x);
		var y=Math.min(this.start.y, this.end.y);
		var w=Math.max(this.start.x, this.end.x)-x;
		var h=Math.max(this.start.y, this.end.y)-y;
		//console.log("p.getBBox:"+x+","+y+","+w+","+h);
		return { x:x-2, y:y-2, width:w+4, height:h+4 };
	};

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
		var matrix = this.imageShape._getRealMatrix();
		var center = dojox.gfx.matrix.multiplyPoint(matrix, this.imageShape.getShape().x+this.imageShape.getShape().width/2, this.imageShape.getShape().y+this.imageShape.getShape().height/2);
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

		//debugger;
		this.shape.setTransform(this.transform);
		
		this.imageShape.setShape({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y, src:this.property('imgSrc')})
					//.setFill(this.property('shapeFill'))
					//.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	
		this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));
		
		//this.wordWrap();
	};
	
	// right click to load an image file from local file system or internet.
	// overide ShapeBase.addMenu
	p.addMenu=function(shape,e){
		if(shape.property('imgSrc')==null){
			shape.property('imgSrc',"../MyEditor/images/image.gif");
		}
		// an example of uploading files:
		//http://dojotoolkit.org/forum/dojo-core-dojo-0-9/dojo-core-support/file-upload-iframe-not-working-ie

		var pane = dojo.byId('fileForm1');
		filedialog = new dijit.Dialog({ title: "Import an image file", id: "filedlg", execute:"alert('submitted w/args:\n' + dojo.toJson(arguments[0], true));" },pane );
		dojo.connect(filedialog,"onCancel",function(){
													//alert("dialog on close!");
													//fix the directory name
													var dirname="../MyEditor/file_uploads/"
													if(dojo.byId("fileInput1").value!=false){
													var filename=dojo.byId("fileInput1").value;
													}
													console.log("file path:"+dirname);	
													console.log("file name:"+filename);
													if(filename!=false){			
														// if the browser is IE, just get the file name, instead of the full path
														if(dojo.isIE||dojo.isSafari){
															var temp = filename.toString().split('\\');
															console.log("splited file name:"+temp);
															console.log("length:"+temp.length);
															var i;
															for(i=0;i<temp.length; i++){
															console.log("files:"+temp[i]);
															}
															filename = temp[i-1];															
															console.log("IE file name:"+filename);
														}									
														shape.beginEdit(ta.CommandTypes.Modify);
														shape.property('imgSrc', (dirname+filename));
														shape.draw();
														shape.endEdit();
													}
													if(dijit.byId('filedlg')) dijit.byId('filedlg').destroy();													
													});		
		filedialog.show();
		filedialog.resize({ w:400, h:150 });

/*
	 * <form id="mainForm" enctype="multipart/form-data" name="fileTest" action="file_upload.jsp" method="post">
	<div id="uploadContainer">
		<input type="hidden" name="MAX_FILE_SIZE" value="1000000">
		<span id="preamble">File to Upload:</span><br>
		<span id="inputField">
			<input type="file" id="fileInput1" name="filename">
		</span>
		<span id="progressField" style="display:none;">
			<div dojoType="dijit.ProgressBar" style="width:200px" indeterminate="true"></div>
		</span>L364
	</div>
	<button type="button" value="upload" dojoType="dijit.form.Button" onclick="sendForm()">Upload</button> 
	</form>
	* 
	
		var div1 = dojo.doc.createElement('div');
		dojo.byId("canvas").appendChild(div1);
		var div2 = dojo.doc.createElement('div');
		dojo.place(div2, div1, 0);
		var br1=dojo.doc.createElement('br');
		dojo.place(br1,div1, 0);
		var div3 = dojo.doc.createElement('div');
		dojo.place(div3, div1, 0);
		filedialog = new dijit.Dialog({ title: "Import an image file", id: "filedlg", execute:"alert('submitted w/args:\n' + dojo.toJson(arguments[0], true));"},div1 );
		var textbox=new dijit.form.TextBox({type:"file", name:'filename', id:"fileInput"}, div3);
		var button=new dijit.form.Button({label:"Submit",type:"submit", onClick:function(e){
																			//alert('Submit button clicked!');
																			dojo.io.iframe.send({
																				url: "file_upload.jsp",
																				method: "post",
																				handleAs: "html",
																				//form: dojo.byId('filedlg'),
																				handle: function(data,ioArgs){
																					//alert("inside handle"+", ioArgs:"+ioArgs);
																					alert("the data:"+data);
																					var obj = data.getElementById("responsetext");
																					if(obj!=null){
																						alert("file uploaded successfully! The response:"+obj.innerHTML);
																					}
																					else{
																						alert("file uploaded failed! data:"+obj);
																					}
																				}
																			});
																			var dirname="../MyEditor/file_uploads/"
																			if(dojo.byId("fileInput").value!=false){
																			var filename=dojo.byId("fileInput").value;
																			}
																			alert("file path and name:"+(dirname+filename));	
																			if(filename!=false){												
																				shape.beginEdit(ta.CommandTypes.Modify);
																				shape.property('imgSrc', (dirname+filename));
																				shape.draw();
																				shape.endEdit();
																			}
																			if(dijit.byId('filedlg')) dijit.byId('filedlg').destroy();
																			
																		}}, div2);	
		filedialog.show();
		filedialog.resize({ w:300, h:150 });*/
	
	};
	
	/* an example of creating a Editor programmatically
	 * function brandNewFloater(){
		var node1 = dojo.doc.createElement('div');
		dojo.place(node1, dojo.body(), 0);
		var node2 = dojo.doc.createElement('div');
		dojo.place(node2, node1, 0);
		dojo.addClass(node1,"testFixedSize");
		var tmp = new dojox.layout.FloatingPane({
		title:" New Floater",
		dockable: false,
		maxable: true,
		closable: true,
		resizable: false
		},node1);
		var editor = new dijit.Editor({}, node2);
		tmp.startup();
		tmp.resize({ w:300, h:125 });
	}*/

	
	p.serialize=function(){
		return '<g '+this.writeCommonAttrs()+'>'
			+ '<img style="url:'+this.property('imgSrc')+ '" '
			+ 'x="' + this.start.x + '" '
			+ 'width="' + (this.end.x-this.start.x) + '" '
			+ 'y="' + this.start.y + '" '
			+ 'height="' + (this.end.y-this.start.y) + '" '
			+ ' />'
			+ '<text style="fill:'+this.property('fontFill')+';size:'+this.property('fontSize')+';family:'+this.property('fontFamily')+';weight:'+this.property('fontWeight')+';fontstyle:'+this.property('fontStyle')+';text-anchor:'+this.textAlign+'" '
			+ 'x="' + this.textPosition.x + '" '
			+ 'y="' + this.textPosition.y + '">'
			+ this.property('label')
			+ '</text>'
			+ '</g>';
	};
	ta.ShapeBase.register("Image");
})();
