var redis = require('redis'),
  credentials = require('../lib/bmservice').getCredentials(/^Redis by Compose/) || { username: "", password: "", public_hostname: "localhost/6379"};
  bits = credentials.public_hostname.split('/'),
  hostname = bits[0],
  port = parseInt(bits[1]),
  client = null,
  queue_name = process.env.QUEUE_NAME || "mcqueue";
  
console.log("Connecting to Redis server on", credentials.public_hostname);  

client = redis.createClient(port, hostname, credentials.password);
client.on("error", function (err) {
  console.error("Redis:" + err);
});

// LPUSH the data to a Redis queue
var add = function(payload, callback) {
  if (client) {
    client.lpush(queue_name, JSON.stringify(payload), function(err, buffer) {
      if (err) {
        console.error("Redis error", err);
      }
      callback(null,null);
    });
  }
};


module.exports = {
  add: add
};