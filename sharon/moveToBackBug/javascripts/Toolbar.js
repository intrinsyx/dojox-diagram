dojo.provide("dojox.diagram.Toolbar");
//dojo.provide("Toolbar");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Slider");
//dojo.require("dojox.diagram._Plugin");

dojo.declare("dojox.diagram.ButtonGroup", null, {
	constructor: function(){
		this._childMaps={};
		this._children=[];
	},
	add: function(/*_Plugin*/ plugin){
		this._childMaps[plugin]=plugin.connect(plugin,'onActivate',dojo.hitch(this,'_resetGroup',plugin));
		this._children.push(plugin);
	},
//	remove: function(/*_Plugin*/ plugin){
//		widget.disconnect(this._childMaps[widget.id]);
//		delete this._childMaps[widget.id];
//		this._children.splice(this._children.indexOf(widget.id),1);
//	},
	_resetGroup: function(p){
		var cs=this._children;
		dojo.forEach(cs,function(c){
			if(p!=c && c['attr']){
				c.attr('checked',false);
			}
		});
	}
});

dojo.declare("dojox.diagram.Toolbar", dijit.Toolbar, {
//dojo.declare("Toolbar", dijit.Toolbar, {
	figure: null,
	plugins: null,
	postCreate: function(){
		this.inherited(arguments);
		this.shapeGroup=new dojox.diagram.ButtonGroup;

		this.connect(this.figure,'onLoad','reset');
		//debugger;
		if(!this.plugins){
			this.plugins=['Rectangle','RoundRect','Ellipse'];
		}
		this._plugins=[];

		dojo.forEach(this.plugins,function(obj){
			var name=dojo.isString(obj)?obj:obj.name;
			var p=new dojox.diagram.tools[name](obj.args||{});
			this._plugins.push(p);
			p.setFigure(this.figure);
			p.setToolbar(this);
			if(!this._defaultTool && p.button){
				this._defaultTool=p;
			}
		},this);
	},
	destroy: function(){
		dojo.forEach(this._plugins,function(p){
			p.destroy();
		});
		this.inherited(arguments);
		delete this._defaultTool;
		delete this._plugins;
	},
	addGroupItem: function(/*_Plugin*/item,group){
		if(group!='toolsGroup'){
			console.error('not supported group '+group);
			return;
		}

		this.shapeGroup.add(item);
	},
	reset: function(){
		this._defaultTool.activate();
	},
	_setShape: function(s){
		if(!this.figure.surface) return;
		//	now do the action.
		if(this.figure.hasSelections()){
			for(var i=0; i<this.figure.selected.length; i++){
				var before=this.figure.selected[i].serialize();
				this.figure.convert(this.figure.selected[i], s);
				this.figure.history.add(ta.CommandTypes.Convert, this.figure.selected[i], before);
			}
		}
	}
});

dojox.diagram.makeToolbar=function(node,figure){
	var toolbar=new dojox.diagram.Toolbar({"figure":figure});
	//debugger;
	node.appendChild(toolbar.domNode);
	return toolbar;
};
