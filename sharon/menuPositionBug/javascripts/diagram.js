//an entry class/object for this Dojox.diagram project

dojo.provide("dojox.diagram");
try{
	// fix IE image caching issue
	document.execCommand("BackgroundImageCache", false, true);
}catch(e){ }
dojo.require("dojox.xml.DomParser");
//dojo.require("dojox.diagram.UndoStack");
//dojo.require("dojox.diagram.Figure");
//dojo.require("dojox.diagram.Toolbar");
