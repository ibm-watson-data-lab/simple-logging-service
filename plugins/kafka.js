var  MessageHub = require('message-hub-rest'),
   hub = new MessageHub(JSON.parse(process.env.VCAP_SERVICES)),
   queue_name = process.env.QUEUE_NAME || "mcqueue";
 
console.log("Connecting to Kafka server");  

hub.topics.create(queue_name)
  .then(function(response) {
    console.log("Created topic '%s'",queue_name);
  })
  .fail(function(error) {
    throw new Error(error);
  });

// write the data to a Kafka topic
var add = function(payload, callback) {
  var list = new MessageHub.MessageList([
    JSON.stringify(payload)
  ]);
  hub.produce(queue_name, list.messages).then(function() {
    callback(null, null)
  }).fail(function(error) {
    callback(error, null);
  });
};

module.exports = {
  add: add
};