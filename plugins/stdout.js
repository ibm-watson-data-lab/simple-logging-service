// write data to stdout
var add = function(payload, callback) {
  console.log(JSON.stringify(payload));
  callback(null, null);
};

module.exports = {
  add: add
};