'use strict';

/**
 * CDS Labs Tracker Collector module
 * 
 *   Misc routine
 * 
 * @author David Taieb
 */

var _ = require('lodash');

module.exports = {
	jsonError : function( res, code, err ){		
		if ( !err ){
			err = code;
		}
		if ( !_.isFinite( code ) ){
			code = 500;
		}
		
		var message = err.message || err.statusMessage || err;
		if ( res.headersSent ){
			console.log("Error could not be sent because response is already flushed: " + message );
			return;
		}
		
		res.status( code ).json({'error': message} );
		return message;
	}
};
