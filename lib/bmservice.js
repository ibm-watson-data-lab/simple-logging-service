var getCredentials = function(service) {
  var VCAP_SERVICES = process.env.VCAP_SERVICES;
  if (!VCAP_SERVICES) {
    return null;
  }
  var services = JSON.parse(VCAP_SERVICES);
  for(var i in services["user-provided"]) {
    if (services["user-provided"][i].name.match(service)) {
      return services["user-provided"][i].credentials;
    }
  }
  return null;
};

module.exports = {
  getCredentials: getCredentials
}