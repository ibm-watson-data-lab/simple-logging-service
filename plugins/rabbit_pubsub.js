var url = process.env.RABBITMQ_URL || 'amqp://localhost',
  safeurl =  url.replace(/:.*@/,":*****@"),
  context = null,
  queue_name = process.env.QUEUE_NAME || "mcpubsub",
  q = null;
  
console.log("Connecting to Rabbit MQ server on", url.replace(/:.*@/,":*****@"));  

setInterval(function() {
  if (context == null) {
    console.log("Attempting connection to ",safeurl);
    context = require('rabbit.js').createContext(url, {"rejectUnauthorized": false});
    context.on('ready', function() {
      q = context.socket('PUBLISH');
      q.connect(queue_name, function() {
        console.log("Connected to RabbitMQ pubsub '%s'",queue_name);
      });
    }).on('error', function(e) {
      console.error("Connection error",e);
      context = null;
      q = null;
    });
  }
}, 2000);


// write the data to a RabbitMQ pubsub channel
var add = function(payload, callback) {
  if (q) {
    q.write(JSON.stringify(payload), 'utf8');
    callback(null, null);
  } else {
    callback("Not ready", null);
  }
};

module.exports = {
  add: add
};