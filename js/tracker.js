/**
 * Encapsulate the tracking logic
 */

//Init the piwik queue
var _paq = _paq || [];

//Asynchronous loading of the piwik tracking framework
(function(){
	var geo = null;
	var geoError = null;
	var geoLocation = false;
	if ( geoLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( function( position ){
        	geo = position.coords;
        }, function( positionError ){
        	geoError = positionError;
        });
    }
	var customDataFn = function(){
		var ret = "";
		if ( geo ){
			ret += "&geo=" + JSON.stringify({lat:geo.latitude, long: geo.longitude});
		}else if ( geoError ){
			ret += "&message=" + (geoError.message || "Unable to retrieve client geo location");
		}
		
		if ( navigator.platform ){
			ret += "&uap=" + navigator.platform;
		}
		if ( navigator.userAgent){
			ret += "&uag=" + navigator.userAgent;
		}
		
		//date
		var d = new Date();
		ret += "&date=" + d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
		return ret;
	}
	
	var extracturl = function( url ){
		var a =  document.createElement('a');
	    a.href = url;
	    return a.protocol + "//" + a.hostname + ":" + a.port;
	}
	
	//Get the site id from custom script data attribute
	var scripts = document.getElementsByTagName("script");
  var siteid = null;
	var defTrackerProtocol = "http";
	var defTrackerHost = "metrics-collector.mybluemix.net";
	var trackerUrl = null;
	var src = null;
    if ( scripts && scripts.length > 0 ){
    	siteid = scripts[scripts.length - 1].getAttribute("siteid");
    	trackerUrl = scripts[scripts.length - 1].getAttribute("trackerurl");
    	src = scripts[scripts.length-1].src;
    }
    if ( !trackerUrl ){
    	//Compute it from the current location
    	if ( src ){
    		trackerUrl = extracturl( src ) + "/tracker";
    	}else{
    		trackerUrl = defTrackerProtocol + "://" + defTrackerHost + "/tracker";
    	}
    }
    if ( !siteid ){
    	console.log('siteid attribute missing in the script tag for tracker.js');
    }
	_paq.push(['setSiteId', siteid]);
	_paq.push(['addPlugin', 'cds_custom_data', {'link': customDataFn, 'sitesearch':customDataFn, 'log': customDataFn}]);
	_paq.push(['setTrackerUrl', trackerUrl]);
	_paq.push(['trackPageView']);
	_paq.push(['enableLinkTracking']);
	var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; 
	var index = src.lastIndexOf("/");
	g.defer=true; g.async=true; g.src= src.substr(0, index ) +'/piwik.js';
	s.parentNode.insertBefore(g,s); 
})();

//dynamically enable link tracking starting from provided DOM Element
var enableLinkTrackingForNode = function( node ){
  var _tracker = this;
  node.find('a,area').each(function(link){
	  _tracker.addClickListener($(this)[0], true);
  });
};