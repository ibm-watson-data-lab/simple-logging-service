/**
 * Encapsulate the tracking logic
 */

//Init the piwik queue
var _paq = _paq || [];

//Asynchronous loading of the piwik tracking framework
(function(){
	var trackerProtocal = "http";
	var trackerHost = "metrics-collector.mybluemix.net";
	var geo = null;
	var geoError = null;
	if (navigator.geolocation) {
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
		return ret;
	}
	
	//Get the site id from custom script data attribute
	var scripts = document.getElementsByTagName("script");
    var siteid = null;
    if ( scripts && scripts.length > 0 ){
    	siteid = scripts[scripts.length - 1].getAttribute("siteid");
    }
    if ( !siteid ){
    	console.log('siteid attribute missing in the script tag for tracker.js');
    }
	_paq.push(['setSiteId', siteid]);
	_paq.push(['addPlugin', 'cds_custom_data', {'link': customDataFn, 'sitesearch':customDataFn, 'log': customDataFn}]);
	_paq.push(['setTrackerUrl', trackerProtocal + "://" + trackerHost + "/tracker"]);
	_paq.push(['trackPageView']);
	_paq.push(['enableLinkTracking']);
	var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; 
	g.defer=true; g.async=true; g.src='js/piwik.js';
	s.parentNode.insertBefore(g,s); 
})();

//dynamicall enable link tracking starting from provided DOM Element
var enableLinkTrackingForNode = function( node ){
  var _tracker = this;
  node.find('a,area').each(function(link){
	  _tracker.addClickListener($(this)[0], true);
  });
};

var useGoogleAnalytics = false;
if ( useGoogleAnalytics ){
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-63840342-1', 'auto');
	  ga('send', 'pageview');
}