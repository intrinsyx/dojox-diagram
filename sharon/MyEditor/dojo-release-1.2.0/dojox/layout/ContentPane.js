/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.layout.ContentPane"]){
dojo._hasResource["dojox.layout.ContentPane"]=true;
dojo.provide("dojox.layout.ContentPane");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.html._base");
(function(){
dojo.declare("dojox.layout.ContentPane",dijit.layout.ContentPane,{adjustPaths:false,cleanContent:false,renderStyles:false,executeScripts:true,scriptHasHooks:false,constructor:function(){
this.ioArgs={};
this.ioMethod=dojo.xhrGet;
this.onLoadDeferred=new dojo.Deferred();
this.onUnloadDeferred=new dojo.Deferred();
},postCreate:function(){
this._setUpDeferreds();
dijit.layout.ContentPane.prototype.postCreate.apply(this,arguments);
},onExecError:function(e){
},_setContentAttr:function(_2){
if(!this._isDownloaded){
var _3=this._setUpDeferreds();
}
this.inherited(arguments);
return _3;
},cancel:function(){
if(this._xhrDfd&&this._xhrDfd.fired==-1){
this.onUnloadDeferred=null;
}
dijit.layout.ContentPane.prototype.cancel.apply(this,arguments);
},_setUpDeferreds:function(){
var _t=this,_5=function(){
_t.cancel();
};
var _6=(_t.onLoadDeferred=new dojo.Deferred());
var _7=(_t._nextUnloadDeferred=new dojo.Deferred());
return {cancel:_5,addOnLoad:function(_8){
_6.addCallback(_8);
},addOnUnload:function(_9){
_7.addCallback(_9);
}};
},_onLoadHandler:function(){
dijit.layout.ContentPane.prototype._onLoadHandler.apply(this,arguments);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
},_onUnloadHandler:function(){
this.isLoaded=false;
this.cancel();
if(this.onUnloadDeferred){
this.onUnloadDeferred.callback(true);
}
dijit.layout.ContentPane.prototype._onUnloadHandler.apply(this,arguments);
if(this._nextUnloadDeferred){
this.onUnloadDeferred=this._nextUnloadDeferred;
}
},_onError:function(_a,_b){
dijit.layout.ContentPane.prototype._onError.apply(this,arguments);
if(this.onLoadDeferred){
this.onLoadDeferred.errback(_b);
}
},_prepareLoad:function(_c){
var _d=this._setUpDeferreds();
dijit.layout.ContentPane.prototype._prepareLoad.apply(this,arguments);
return _d;
},_setContent:function(_e){
var _f=this._contentSetter;
if(!(_f&&_f instanceof dojox.html._ContentSetter)){
_f=this._contentSetter=new dojox.html._ContentSetter({node:this.containerNode,_onError:dojo.hitch(this,this._onError),onContentError:dojo.hitch(this,function(e){
var _11=this.onContentError(e);
try{
this.containerNode.innerHTML=_11;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
this._contentSetterParams={adjustPaths:Boolean(this.adjustPaths&&this.href),referencePath:this.href,renderStyles:this.renderStyles,executeScripts:this.executeScripts,scriptHasHooks:this.scriptHasHooks,scriptHookReplacement:"dijit.byId('"+this.id+"')"};
this.inherited("_setContent",arguments);
}});
})();
}
