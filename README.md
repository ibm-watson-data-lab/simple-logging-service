
# Metrics Collector Microservice

This project is based on the [Simple Metrics Collector](https://github.com/ibm-cds-labs/metrics-collector) which is a simple way of collecting web analytics and storing the data in a Cloudant database. This project breaks this concept down using a Microservices architecture, so instead of being limited to a writing data to a Cloudant database, this project will add data to a variety out outputs, depending on a runtime environment variable:

1. stdout - to the terminal only
2. redis_queue - to a Redis queue
3. redis_pubsub - to a Redis pubsub channel
4. rabbit_queue - to a RabbitMQ queue
5. rabbit_pubsub - to a RabbitMQ pubsub channel
6. kafka - to an Apache Kafka or IBM Message Hub topic

![schematic](https://github.com/glynnbird/metrics-collector-microservice/raw/master/img/mcms.png "Schematic Diagram")

## Deploy to IBM Bluemix

### One-Click Deployment

The fastest way to deploy this application to Bluemix is to click this **Deploy to Bluemix** button. Or, if you prefer working from the command line, skip to the **Deploy Manually** section.

[![Deploy to Bluemix](https://deployment-tracker.mybluemix.net/stats/c4a7dede394373547d56ebc57943206a/button.svg)](https://bluemix.net/deploy?repository=https://github.com/ibm-cds-labs/metrics-collector-microservice)

**Don't have a Bluemix account?** If you haven't already, you'll be prompted to sign up for a Bluemix account when you click the button.  Sign up, verify your email address, then return here and click the the **Deploy to Bluemix** button again. Your new credentials let you deploy to the platform and also to code online with Bluemix and Git. If you have questions about working in Bluemix, find answers in the [Bluemix Docs](https://www.ng.bluemix.net/docs/).

### Deploy Manually to Bluemix

#### Configure Cloud Foundry

If you haven't already, [install the Cloud Foundry command line interface and connect to Bluemix](https://www.ng.bluemix.net/docs/#starters/install_cli.html).

#### Deploy

To deploy to Bluemix, simply:

    $ cf push

> **Note:** You may notice that Bluemix assigns a URL to your application containing a random word. This is defined in the `manifest.yml` file where the `random-route` key set to the value of `true`. This ensures that multiple people deploying this application to Bluemix do not run into naming collisions. To specify your own route, remove the `random-route` line from the `manifest.yml` file and add a `host` key with the unique value you would like to use for the host name.

_**Privacy Notice:**_ _This web application includes code to track deployments to [IBM Bluemix](https://www.bluemix.net/) and other Cloud Foundry platforms. Tracking helps us measure our samples' usefulness, so we can continuously improve the content we offer to you. The following information is sent to a [Deployment Tracker](https://github.com/cloudant-labs/deployment-tracker) service on each deployment:_

* _Application Name (`application_name`)_
* _Space ID (`space_id`)_
* _Application Version (`application_version`)_
* _Application URIs (`application_uris`)_

_This data is collected from the `VCAP_APPLICATION` environment variable in IBM Bluemix and other Cloud Foundry platforms. IBM uses this data to track metrics around deployments of sample applications to Bluemix._

_To disable deployment tracking, remove the following line from `server.js`:_

```
require("cf-deployment-tracker-client").track();
```

_Once that line is removed, you may also uninstall the `cf-deployment-tracker-client` npm package._


## Environment variables

The installation can be configured by adding a number of custom environment variables and then restarting the application

### QUEUE_TYPE

The value of QUEUE_TYPE can be one of stdout, redis_queue, redis_pubsub, rabbit_queue, rabbit_pubsub or kafka. If a value is not set, then 'stdout' is assumed.

### QUEUE_NAME

The value of QUEUE_NAME determines which queue/topic the data is written to. If omitted, it takes the following values for each of the queue types:

1. stdout - n/a
2. redis_queue - mcqueue
3. redis_pubsub - mcpubsub
4. rabbit_queue - mcqueue
5. rabbit_pubsub - mcpubsub
6. kafka - mcqueue

### VCAP_SERVICES

`VCAP_SERVICES` is created for you by the Bluemix Cloud Foundry service. It defines the credentials of the attached services that this app can connect to. 

...

## Client-side code

Once the application is installed and configured, then your web-page needs to have code inserted into it to allow data to be collected e.g.

```html
<html>
<body>
<div>
  <a href="https://www.google.com" title="this will be tracked">Tracked Link</a>
</div>
<div>
  <a href="#" onclick="javascript:_paq.push(['trackEvent', 'Menu', 'Freedom']);" title="this will be tracked">Async Tracked Link</a>
</div>
<script type="text/javascript">
   var _paq = _paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="http://mydomain.mybluemix.net/";
    _paq.push(['setTrackerUrl', u+'tracker']);
    _paq.push(['setSiteId', "mysite"]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
</body>
</html>
```

The main script tag loads the `piwik.js` JavaScript from the server and records a page tracking event. It also ensures that any link clicks being tracked too (enableLinkTracking). The example above also shows how asynchronous actions can be recorded too by calling `_paq.push` when the event occurs.

The only things you need to alter from this code snippet is the URL assigned to variable `u` which should be the URL of your installation and the value passed to setSiteId.
 
## Running with QUEUE_TYPE=stdout

To stream the events to `stdout` is the default behaviour of the Metrics Collector Microservice. Simply run the app and events will appear on the terminal.

## Running with Redis

Read the [Getting Started with Redis on Compose.io](https://www.compose.io/articles/get-started-with-redis-on-compose/). Spin up a new Redis cluster on Compose.io and use the credentials you get to feed into your Bluemix Redis by Compose service 

### Running with QUEUE_TYPE=redis_queue

Define your environment variable and run the process

```sh
> export QUEUE_TYPE=redis_queue
> node server.js
Queue mode: redis_queue
Connecting to Redis server on localhost:6379
CDS Labs Metrics Collector Microservice started on port 8081 : Thu Nov 26 2015 16:32:15 GMT+0000 (GMT)
```

After generating some data, in your web application, the Redis command-line interface can be used to check the collected data. The `LLEN` command can tell you how many items have accumlated on the queue:

```sh
> redis-cli
127.0.0.1:6379> LLEN mcqueue
(integer) 26
```

while the `RPOP` command will retrieve the oldest item on the queue:

```sh
> redis-cli
127.0.0.1:6379> RPOP mcqueue
"{\"action_name\":\"\",\"idsite\":\"mysite\",\"rec\":1,\"r\":176450,\"h\":16,\"m\":28,\"s\":14,\"url\":\"http://localhost:8000/metrics.html#\",\"$_id\":\"772aa0d070215d3b\",\"$_idts\":1448553217,\"$_idvc\":1,\"$_idn\":0,\"$_refts\":0,\"$_viewts\":1448553217,\"cs\":\"windows-1252\",\"send_image\":0,\"pdf\":1,\"qt\":0,\"realp\":0,\"wma\":0,\"dir\":0,\"fla\":1,\"java\":1,\"gears\":0,\"ag\":0,\"cookie\":1,\"res\":\"1440x900\",\"gt_ms\":7,\"type\":\"pageView\",\"ip\":\"::1\"}"
```

N.B if you have supplied a `QUEUE_NAME` environment variable, then use that value rather than 'mcqueue' in the above examples

### Running with QUEUE_TYPE=redis_pubsub

Define your environment variable and run the process

```sh
> export QUEUE_TYPE=redis_pubsub
> node server.js
Queue mode: redis_pubsub
Connecting to Redis server on localhost:6379
CDS Labs Metrics Collector Microservice started on port 8081 : Thu Nov 26 2015 16:32:15 GMT+0000 (GMT)
```

Using the Redis command-line interface, we can subscribe to the pubsub channel (mcpubsub or the value of `QUEUE_NAME` you supplied):

```
> redis-cli
127.0.0.1:6379> SUBSCRIBE mcpubsub
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "mcpubsub"
3) (integer) 1
```

As you generate data in the application, you will see it appear in your `redis-cli` terminal:

```
1) "message"
2) "mcpubsub"
3) "{\"action_name\":\"\",\"idsite\":\"mysite\",\"rec\":1,\"r\":578292,\"h\":16,\"m\":35,\"s\":44,\"url\":\"http://localhost:8000/metrics.html#\",\"$_id\":\"772aa0d070215d3b\",\"$_idts\":1448553217,\"$_idvc\":1,\"$_idn\":0,\"$_refts\":0,\"$_viewts\":1448553217,\"cs\":\"windows-1252\",\"send_image\":0,\"pdf\":1,\"qt\":0,\"realp\":0,\"wma\":0,\"dir\":0,\"fla\":1,\"java\":1,\"gears\":0,\"ag\":0,\"cookie\":1,\"res\":\"1440x900\",\"gt_ms\":13,\"type\":\"pageView\",\"ip\":\"::1\"}"
```

## Running with RabbitMQ

Read the [Getting Started with RabbitMQ on Compose.io](https://www.compose.io/articles/getting-started-with-rabbitmq/). You'll need to create a RabbitMQ cluster and create a user with `.*` access, as described in that document. As the Compose.io RabbitMQ service is very new and there isn't a Bluemix service for it yet, you will need to define the URL of your RabbitMQ service as a custom environment variable `RABBITMQ_URL` in Bluemix or in the local environment:

```sh
export RABBITMQ_URL=amqps://myrabbbituser:mybunnyrabbit99@aws-us-east-1-portal.8.dblayer.com:10705/amazing-rabbitmq-72
```sh

or

```sh
export RABBITMQ_URL=amqp://localhost
```

### Running with QUEUE_TYPE=rabbit_queue

Define your environment variable and run the process

```sh
> export QUEUE_TYPE=rabbit_queue
> node server.js
Queue mode: rabbit_queue
Connecting to Rabbit MQ server on amqps:*****@aws-us-east-1-portal.8.dblayer.com:10705/dazzling-rabbitmq-72
CDS Labs Metrics Collector Microservice started on port 8081 : Fri Nov 27 2015 14:04:35 GMT+0000 (GMT)
Connected to RabbitMQ queue 'mcqueue'
```

After generating some data, in your web application, you should be able to use Compose.io's RabbitMQ Admin page to see the data coming in:

![RabbitMQ queue drilldown](https://github.com/glynnbird/metrics-collector-microservice/raw/master/img/rabbitmq2.png)

### Running with QUEUE_TYPE=rabbit_pubsub

Define your environment variable and run the process

```sh
> export QUEUE_TYPE=rabbit_pubsub
> node server.js
Queue mode: rabbit_pubsub
Connecting to Rabbit MQ server on amqps:*****@aws-us-east-1-portal.8.dblayer.com:10705/dazzling-rabbitmq-72
CCDS Labs Metrics Collector Microservice started on port 8081 : Fri Nov 27 2015 15:08:53 GMT+0000 (GMT)
Connected to RabbitMQ pubsub channel 'mcpubsub'
```

After generating some data, in your web application, you should be able to use Compose.io's RabbitMQ Admin page to see the data coming in:

![RabbitMQ queue drilldown](https://github.com/glynnbird/metrics-collector-microservice/raw/master/img/rabbitmq3.png)


## Running with IBM Message Hub (Apache Kafka)

Create an Message Hub instance in Bluemix. Bluemix will create the necessary environment variables 

Define your environment variable and run the process

```sh
> export QUEUE_TYPE=kafka
> node server.js
Queue mode: kafka
Connecting to Kafka MQ server
CDS Labs Metrics Collector Microservice started on port 8081 : Fri Nov 27 2015 15:57:31 GMT+0000 (GMT)
Created topic 'mcqueue'
```

## Conclusion

The Metrics Collector Microservice is a Bluemix app that collects web metrics. Instead of storing the metrics directly in a database, it writes the data to choice of queues (Redis, RabbitMQ and Apache Kafka). This app can be run on many instances to share the data collection load and coupled with other microservices that consume and analyse the data, it could be used as the basis of a high volume metrics collection service.

-----

_<sup>© "Apache", "CouchDB", "Apache CouchDB" and the CouchDB logo are trademarks or registered trademarks of The Apache Software Foundation. All other brands and trademarks are the property of their respective owners.</sup>_

