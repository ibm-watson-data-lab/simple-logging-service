var url = process.env.RABBITMQ_URL || 'amqp://localhost'
  context = require('rabbit.js').createContext(url, {"rejectUnauthorized": false}),
  queue_name = process.env.QUEUE_NAME || "mcpubsub",
  q = null;
  
console.log("Connecting to Rabbit MQ server on", url.replace(/:.*@/,":*****@"));  

context.on('ready', function() {
  q = context.socket('PUBLISH');
  q.connect(queue_name, function() {
    console.log("Connected to RabbitMQ pubsub channel '%s'",queue_name);
  });
}).on('error', function(e) {
  console.log("Connection error",e);
});

// write the data to a RabbitMQ pubsub channel
var add = function(payload, callback) {
  if (q) {
    q.write(JSON.stringify(payload), 'utf8').then(function() {
      callback(null, null);
    });
  } else {
    callback("Not ready", null);
  }
};

module.exports = {
  add: add
};