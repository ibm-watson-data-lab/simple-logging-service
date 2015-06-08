'use strict';

/**
 * CDS Labs Tracker Collector Module
 * 
 *   Abstracted storage API layer that uses Cloudant Service coming from either bluemix service or cloudant.com
 * 
 * @author David Taieb
 */

var cfEnv = require("cfenv");
var appEnv = cfEnv.getAppEnv();
var when = require('when');
var events = require('events');
var util = require('util');
var _ = require('lodash');

//Discover cloudant service info and initialize connection
var cloudantUrl = process.env.CLOUDANT_URL;
var storageServiceName = process.env.CLOUDANT_SERVICE_NAME || new RegExp(".*cloudant.*");
var cloudantService = cloudantUrl ? 
		{ 
			name : "Cloudant Url", 
			credentials: { url: cloudantUrl} 
		} 
		: appEnv.getService(storageServiceName);
if (!cloudantService) {
    console.log("Failed to find Cloudant service");
    throw new Error( "Failed to find Cloudant service" );
}

console.log("Using cloudant service " + cloudantService.name + " url : " + cloudantService.credentials.url);
var couchDb = require('cloudant')({
	"url" : cloudantService.credentials.url, 
	"log" : function (id, args) {
		//console.log(id, args);
	}
});

//Define a storage class
function storage( serviceDbName, designDocs ){
	//Call constructor from super class
	events.EventEmitter.call(this);	
	
	//this db name and handle
	this.serviceDbName = serviceDbName || process.env.CLOUNDANT_DB_NAME;	
	this.storageDb = null;
	
	var self = this;	
	this.initCouchDb = function( resolve, reject ){
		couchDb.db.get(self.serviceDbName, function(err, body) {
			if ( designDocs && !_.isArray( designDocs )){
				designDocs = [designDocs];
			}
			if (err ) {
				//Create it
				couchDb.db.create(self.serviceDbName,function(err,body){
					if ( err ){
						reject( "Unable to create db " + self.serviceDbName + ". Error is " + err );
					}else{
						self.storageDb = couchDb.use( serviceDbName );
						if ( designDocs ){
							var bFound = false;
							_.forEach( designDocs, function( doc ){
								//Create the design doc
								if ( doc.views && doc.designName ){
									bFound = true;
									console.log("inserting design doc " + doc.designName );
									self.storageDb.insert( {'views' : doc.views}, doc.designName, function(err,b) {
										if (err) {
											reject( "Failed to create view: "+err);
										}else{
											resolve();
										}
									});
								}
							});
							if ( !bFound ){
								//Nothing to do
								resolve();
							}
						}
					}
				});
			}else{
				self.storageDb = couchDb.use( self.serviceDbName );
				
				//Make sure that the design docs exists, if not create them now
				if ( designDocs ){
					var bFound = false;
					_.forEach( designDocs, function(doc){
						//Check if docs exists
						if ( doc.views && doc.designName ){
							bFound = true;
							self.storageDb.get( doc.designName, function( err, body){
								if ( err ){
									self.storageDb.insert( {'views' : doc.views}, doc.designName, function(err,b) {
										if (err) {
											reject( "Failed to create view: "+err);
										}else{
											resolve();
										}
									});
								}else{
									resolve();
								}
							} );
						}
					});
					if ( !bFound ){
						//Nothing to do
						resolve();
					}
				}else{
					resolve();
				}
			}
		});
	};
		
	when.promise( this.initCouchDb )
		.then( function() {
			console.log("Cloudant database successfully initialized");
			self.emit("cloudant_ready");
		})
		.otherwise( function(err) {
			console.log("Error initializing cloudant database " + err);
			self.emit("cloudant_error");
		});
	
	this.isDbInitialized = function(){
		return this.storageDb;
	};
	
	this.run = function( callback ){
		if ( !self.storageDb ){
			var err = "Storage has not been correctly initialized";
			console.log( err );
			return callback( err );
		}
		
		return callback( null, self.storageDb );
	};
}

//Extend event Emitter
util.inherits(storage, events.EventEmitter);

//Export the module
module.exports = storage;
