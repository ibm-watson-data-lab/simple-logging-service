

# Simple Metrics Tutorial Part 1: Metrics Collection
The IBM Cloud Data Services Developer Advocacy team built this lightweight web-tracking app to record user actions on our site’s AJAX-enabled search engine page. [Follow the tutorial](http://developer.piwik.org/guides/tracking-javascript-guide)
and learn how we use the open source Piwik® web analytics app to collect information and Node.js® to store that data in Cloudant. Then try it yourself by implementing tracking on a demo app we provide. Here in Part 1, we focus on data collection. When you’re done, you can try Part 2, where we show how to visualize the data you’ve gathered.


##How it works

Here’s an architectural overview of our metrics collector. Its middleware component lives on [IBM Bluemix](https://www.bluemix.net/) (IBM’s open cloud platform for building, running, and managing applications) and serves `tracker.js` and `piwik.js`, which perform the metrics collection work and persist metrics data to the database. We use Cloudant as our database, a NoSQL JSON document store based on Apache CouchDB™. 

<img src="http://developer.ibm.com/clouddataservices/wp-content/uploads/sites/47/2015/07/collector-arch-1024x327.png">

## Deploy to IBM Bluemix

###One-Click Deployment

The fastest way to deploy this application to Bluemix is to click this **Deploy to Bluemix** button. Or, if you prefer working from the command line, skip to the **Deploy Manually** section.

[![Deploy to Bluemix](https://bluemix.net/deploy/button_x2.png)](https://bluemix.net/deploy?repository=https://github.com/ibm-cds-labs/metrics-collector)

**Don't have a Bluemix account?** If you haven't already, you'll be prompted to sign up for a Bluemix account when you click the button.  Sign up, verify your email address, then return here and click the the **Deploy to Bluemix** button again. Your new credentials let you deploy to the platform and also to code online with Bluemix and Git. If you have questions about working in Bluemix, find answers in the [Bluemix Docs](https://www.ng.bluemix.net/docs/).

###Deploy Manually

#### Configure Cloud Foundry

If you haven't already, [install the Cloud Foundry command line interface and connect to Bluemix](https://www.ng.bluemix.net/docs/#starters/install_cli.html).


#### Create Backing Services

Create a Cloudant service within Bluemix if one has not already been created:

    $ cf create-service cloudantNoSQLDB Shared metrics-collector-cloudant-service

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

## Try the Tutorial

Once you deploy, [follow the tutorial](https://developer.ibm.com/clouddataservices/simple-metrics-tutorial-part-1-metrics-collection/) to understand exactly how this app works and to learn how to collect user behavior data for your own web app or page. 

When you're done, move on to [Part 2](https://developer.ibm.com/clouddataservices/simple-metrics-tutorial-part-2-d3-and-json/) of this tutorial, where you’ll learn how to display collected data graphically in a report.


_<sup>© "Apache", "CouchDB", "Apache CouchDB" and the CouchDB logo are trademarks or registered trademarks of The Apache Software Foundation. All other brands and trademarks are the property of their respective owners.</sup>_

