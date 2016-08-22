'use strict';

/**
 * Cloud Data Services - Metrics Collector Microservice main module
 * 
 *   Collect client tracking data
 * 
 * @author David Taieb and Glynn Bird
 */

var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  _ = require('lodash');

// cfenv provides access to your Cloud Foundry environment
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//Create and configure the express app
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

// global action types
var type_pageView = "pageView";
var type_search = "search";
var type_link = "link";

// establish which mode the metrics collector is use
var queue_types = fs.readdirSync("./plugins").map(function (v) { return v.replace(".js", "") });
var queue_type = "stdout";
if (queue_types.indexOf(process.env.QUEUE_TYPE) > -1) {
  queue_type = process.env.QUEUE_TYPE;
}
console.log("Queue mode:", queue_type);
var q = require('./plugins/' + queue_type);

//Configure tracker end point
app.get("/tracker", function (req, res) {
  var type = null;
  var jsonPayload = _.chain(req.query)
    .mapValues(function (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      };
    }).mapKeys(function (value, key) {
      if (key === "action_name") {
        type = type_pageView;
      } else if (key === "link") {
        type = type_link;
      } else if (key === "search") {
        type = type_search;
      }
      if (_.startsWith(key, '_')) {
        //Cloudant doesn't authorize key starting with _
        return key.replace(/^_/, '');
      }
      return key;
    }).value();

  if (type) {
    jsonPayload.type = type;
  }

  //Capture the IP address
  var ip = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip) {
    jsonPayload.ip = ip;
  }
  q.add(jsonPayload, function (err, data) {
    io.emit("output", jsonPayload)
    res.status(200).end();
  });
  res.status(200).end();

});

app.get("/output", function(request, response) {

  return response.sendFile(path.join(__dirname, 'public', 'output.html'));

})

app.get("*", function (request, response) {
  console.log("GET request url %s : headers: %j", request.url, request.headers);
  response.status(500).send('<h1>Invalid Request</h1><p>Metrics Collector Microservice captures web metrics data and writes it to a choice of queues. There are no web pages here. This is middleware.</p>');
});



//If Cloud Foundry
var port = process.env.VCAP_APP_PORT || 8081;
var connected = function () {
  console.log("CDS Labs Metrics Collector Microservice started on port %s : %s", port, Date(Date.now()));
};
var url = null;

if (process.env.VCAP_APP_HOST) {
  http.listen(process.env.VCAP_APP_PORT,
    process.env.VCAP_APP_HOST,
    connected);
  url = appEnv.url + '/tracker';
} else {
  http.listen(port, connected);
  url = 'http://localhost:' + port + '/tracker';
}

// if we detect etcd
if (process.env.ETCD_URL) {
  var Registry = require('simple-service-registry')
  var r = new Registry({ url: process.env.ETCD_URL, strictSSL: false });
  r.register('search', 'metrics-collector', { url: url, name: "Simple Metrics Collector" }, { ttl: 30 });
}
console.log('Public URL', url);

require('cf-deployment-tracker-client').track();
