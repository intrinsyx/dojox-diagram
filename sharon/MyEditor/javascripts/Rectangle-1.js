dojo.provide("dojox.diagram.Rectangle");
dojo.require("dojox.diagram.ShapeBase");

(function(){
	var ta=dojox.diagram;
	ta.Rectangle=function(figure, id){
		//summary:
		//		A rectangle shape with text annotation, extended from ShapeBase
		
		//		ta.ShapeBase.call(this, figure, id) - call ShapeBase.constructor
		
		//serialized attributes:
		//		start (x, y): the north-west point coordinate of the rectangle, keep the name = 'start' as from dojox.sketch.
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
		//				}; from ShapeBase
		
		//local variables:
		//		rectShape(object): rectangle shape
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
		
		this.rectShape=null;
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
		//this.eachLine=[];
		//this.maxLineNumber=20; // for text wrap, maxim 20 lines of text. 
	};
	
	ta.Rectangle.prototype=new ta.ShapeBase;
	var p=ta.Rectangle.prototype;
	p.constructor=ta.Rectangle;
	p.type=function(){ return 'Rectangle'; };
	p.getType=function(){ return ta.Rectangle; };

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
	
	// load the rectangle from svg file
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
		
			else if(c.localName=="rect"){				
				if(c.getAttribute('style')!==null){
					var shapestyle=c.getAttribute('style');
					var sstring1=shapestyle.split(";"); 
					var linecolor=sstring1[0].split(":");
					this.property('strokeColor',linecolor[1]);//shape's outline color
					var linewidth=sstring1[1].split(":");
					this.property('strokeWidth',linewidth[1]);//shape's outline width
					var shapefill=sstring1[2].split(":");
					this.property('shapeFill',shapefill[1]); //shape's fill color		
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

		this.rectShape=this.shape.createRect({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y})
					.setFill(this.property('shapeFill'))
					.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	
					
		this.labelShape=this.shape.createText({
			x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));	
		for(var i=0; i<this.maxLineNumber; i++){ 
			this.eachLine[i]=this.shape.createText(dojox.gfx.defaultText);
		}
		this.wordWrap();
	};
	p.destroy=function(){
		if(!this.shape) return;
		this.shape.remove(this.labelShape);		
		this.shape.remove(this.rectShape);		
		this.figure.group.remove(this.shape);
		this.shape=this.labelShape=this.rectShape=null;
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
		var matrix = this.rectShape._getRealMatrix();
		var center = dojox.gfx.matrix.multiplyPoint(matrix, this.rectShape.getShape().x+this.rectShape.getShape().width/2, this.rectShape.getShape().y+this.rectShape.getShape().height/2);
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

		this.rectShape.setShape({x:this.start.x, y: this.start.y, 
					width: this.end.x-this.start.x, height:this.end.y-this.start.y})
					.setFill(this.property('shapeFill'))
					.setStroke({color:this.property('strokeColor'), width:this.property('strokeWidth')})
					;	
		/*this.labelShape.setShape({x:this.textPosition.x, y:this.textPosition.y, text:this.property('label'), align:this.textAlign})
			.setFont({family:this.property('fontFamily'), size: this.property('fontSize'), weight: this.property('fontWeight'), style:this.property('fontStyle')})
			.setFill(this.property('fontFill'));*/
		//console.log("rectangle:id:"+this.id+", this.transform: "+this.transform.dx+", "+this.transform.dy);
		this.wordWrap();
	};
	
	/*p.wordWrap=function(){
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
		 * 
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
	};*/
	
	p.serialize=function(){
		return '<g '+this.writeCommonAttrs()+'>'
			+ '<rect style="stroke-color:'+this.property('strokeColor')+';stroke-width:'+this.property('strokeWidth')+';fill:'+this.property('shapeFill')+ '" '
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
	
	ta.ShapeBase.register("Rectangle");
})();
