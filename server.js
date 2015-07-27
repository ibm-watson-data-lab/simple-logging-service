'use strict';

/**
 * Cloud Data Services Tracker Collector main module
 * 
 *   Collect client tracking data
 * 
 * @author David Taieb
 */

var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var _ = require('lodash');
var cloudant = require('./lib/storage');
var misc = require('./lib/misc');

var dbName =  process.env.CLOUDANT_DB_NAME || "tracker_db";
var type_pageView = "pageView";
var type_search = "search";
var type_link = "link";
var trackerDb = new cloudant(dbName, {
	views:{
		 "all_trackers":{
			 map: function(doc){
				 emit( doc._id, {'_id': doc._id} );
			 }
		  },
		  "all_pageview_events":{
			  map: function( doc ){
				  if ( doc.type == "pageView"){
					  emit( doc._id, {'_id': doc._id} );
				  }
			  }
		  },
		  "all_search_events":{
			  map: function( doc ){
				  if ( doc.type == "search"){
					  emit( doc._id, {'_id': doc._id} );
				  }
			  }
		  },
		  "all_link_events":{
			  map: function( doc ){
				  if ( doc.type == "link"){
					  emit( doc._id, {'_id': doc._id} );
				  }
			  }
		  }
	},
	designName: '_design/application'
});

trackerDb.on( "cloudant_ready", function(){
	console.log("Tracker database (" + dbName + ") ready");
});

trackerDb.on("cloudant_error", function(){
	throw new Error("Fatal error from Cloudant database: unable to initialize " + dbName);
});

//Create and configure the express app
var app = express();
app.use(express.static(path.join(__dirname, 'js')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler({ dumpExceptions:true, showStack:true }));

//Configure tracker end point
app.get("/tracker", function( req, res ){
	var type = null;
	var jsonPayload = _.chain( req.query )
		.mapValues( function(value){
			try{
				return JSON.parse(value);
			}catch(e){
				return value;
			};
		}).mapKeys( function( value, key ){
			if ( key === "action_name"){
				type = type_pageView;
			}else if ( key === "link"){
				type = type_link;
			}else if ( key === "search" ){
				type = type_search;
			}
			if ( _.startsWith( key, '_') ){
				//Cloudant doesn't authorize key starting with _
				return "$" + key;
			}
			return key;
		}).value();
	
	if ( type ){
		jsonPayload.type = type;
	}
	
	//Capture the IP address
	var ip = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if ( ip ){
		jsonPayload.ip = ip;
	}
	
	console.log(JSON.stringify(jsonPayload));
	
	//Insert payload in db
	trackerDb.run( function( err, db ){
		if ( err ){
			return misc.jsonError( res, err );
		}
		db.insert( jsonPayload, function( err, data ){
			if ( err ){
				return console.log( "Error storing client tracking data: " + misc.jsonError( res, err ) );
			}
			return res.status(200).end();
		});
	});
});

app.get("*", function(request, response){
    console.log("GET request url %s : headers: %j", request.url, request.headers);
    
    response.status(500).send('<h1>Invalid Request</h1><p>Simple Metrics Collector captures web metrics data and stores it in <a href="https://cloudant.com">Cloudant</a>. There are no web pages here. This is middleware.</p><p>For more information check out <a href="https://github.com/ibm-cds-labs/metrics-collector/">the GitHub repo</a></p>');
});

//If Cloud Foundry
var port = process.env.VCAP_APP_PORT || 8081;
var connected = function() {
	console.log("CDS Labs Tracker Collector started on port %s : %s", port, Date(Date.now()));
};

if (process.env.VCAP_APP_HOST){
	http.createServer(app).listen(process.env.VCAP_APP_PORT,
                         process.env.VCAP_APP_HOST,
                         connected);
}else{
	http.createServer(app).listen(port,connected);
}

require("cf-deployment-tracker-client").track();
