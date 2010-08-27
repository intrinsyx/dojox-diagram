dojo.provide("dojox.diagram");
try{
	// fix IE image caching issue
	document.execCommand("BackgroundImageCache", false, true);
}catch(e){ }
dojo.require("dojox.xml.DomParser");
