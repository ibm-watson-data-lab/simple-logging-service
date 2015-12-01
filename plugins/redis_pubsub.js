var redis = require('node-redis'),
  credentials = require('../lib/bmservice').getCredentials(/^Redis by Compose/) || { username: "", password: "", public_hostname: "localhost/6379"};
  bits = credentials.public_hostname.split('/'),
  hostname = bits[0],
  port = parseInt(bits[1]),
  client = redis.createClient(port, hostname, credentials.password),
  queue_name = process.env.QUEUE_NAME || "mcpubsub";

console.log("Connecting to Redis server on", credentials.public_hostname);
  
// PUBLISH the data to a Redis pubsub channel
var add = function(payload, callback) {
  
   client.publish(queue_name, JSON.stringify(payload), function(err, buffer) {
    console.log(err, buffer);
    callback(null,null);
  });
  
};

module.exports = {
  add: add  
};