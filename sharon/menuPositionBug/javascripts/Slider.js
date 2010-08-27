dojo.provide("dojox.diagram.Slider");
dojo.require("dijit.form.Slider");

dojo.declare("dojox.diagram.Slider",dojox.diagram._Plugin,{
	// summary
	//		This represents the slider bar on the toolbar
	//		the left most value represents minimum:20, the right most value represents maximum:100
	//		double click the slider bar to zoom the drawing canvas to 'fit'

	_initButton: function(){
		this.slider=new dijit.form.HorizontalSlider({minimum:20,maximum:100,value:100,style:"width:200px;float:right"});
		this.connect(this.slider,'onChange','_setZoom');
		this.connect(this.slider.sliderHandle,'ondblclick','_zoomToFit');
	},
	_zoomToFit: function(){
		this.slider.setValue(this.figure.getFit(),true);
	},
	_setZoom: function(v){
		if(this.figure){
			this.figure.zoom(v);
		}
	},
	setToolbar: function(t){
		t.addChild(this.slider);
		
		// comment out the following code to eliminate the reset after each drawing
		/*if(!t._reset2Zoom){
			//t._reset2Zoom=true;
			this.connect(t,'reset','_zoomToFit');
			t._reset2Zoom=true;
		}*/
	}
});

dojox.diagram.registerTool("Slider", dojox.diagram.Slider);