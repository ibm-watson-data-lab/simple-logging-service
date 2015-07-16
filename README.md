

# metrics-collector
* Implements a collector for tracking web site usage data. The data is stored into an IBM Cloudant database.
* Includes a piwik based implementation for the tracking client code.
* Tracks not only page views but also events in a single-page or async application.

## Usage
**Configuring the Application:**

1. Request a tracking id for your application (at the moment, you can generate your own unique id).
2. Include the tracker.js as a script tag in every page you want to track. Include the site application id from #1

```html
     <script src="http://metrics-collectors.mybluemix.net/tracker.js" siteid="my.unique.id"/>
```

That's it! Tracking events will be generated and sent to the collector. You can peek at the data by using the Cloudant dashboard to browse the collector database.

**Configuring the collector**

You can specify the Cloudant URL as a System variable e.g:
CLOUDANT_URL=https://userid:password@userid.cloudant.com

If you are deploying the app to Bluemix, then you have more database configuration options:

1. Add a Cloudant Service and bind it to the app.
2. Specify the CLOUDANT_URL system variable as a user-defined environment variable in the Application properties

## Developing
If your application is dynamically updating part of DOM (based on search results for example), you will need to make extra calls to make sure the tracking click handlers are correctly updated.
For example:

```javascript
  //Use enableLinkTrackingForNode method to install the tracking handler on all the links under a specified DOM Node
  //Tip: always check for null in case tracker.js cannot be loaded
  if ( typeof _paq !== 'undefined'){
      _paq.push([ enableLinkTrackingForNode, $('#results')]);
  }
```

> Note: You can find additional documentation on events supported by piwik at [http://developer.piwik.org/guides/tracking-javascript-guide](http://developer.piwik.org/guides/tracking-javascript-guide)

## Data Model of the tracking payload
```json
{
  "type": "search",              //Type of event being captured (currently pageView, search and link)
  "idsite": "cds.search.engine", //app id (must be unique)
  "ip": "75.126.70.43",          //ip of the client
  "url": "http://cloudant-labs.github.io/resources.html",   //source url for the event
  "geo": {                       //geo coordinates of the client (if available)
    "lat": 42.3596328,
    "long": -71.0535177
  }
  "search": "",         //Search text if any (specific to search events)
  "search_cat": [       //Faceted search info (specific to search events)
    {
      "key": "topic",
      "value": "Analytics"
    },
    {
      "key": "topic",
      "value": "Data Warehousing"
    }
  ],
  "search_count": 7,    //search result count (specific to search events)
  "action_name": "IBM Cloud Data Services - Developers Center - Products", //Document title (specific to pageView events)
  "link": "https://developer.ibm.com/bluemix/2015/04/29/connecting-pouchdb-cloudant-ibm-bluemix/", //target url (specific to link events)
  "rec": 1,             //always 1
  "r": 297222,          //random string
  "date": "2015-5-4",    //event date time -yyyy-mm-dd
  "h": 16,              //event timestamp - hour
  "m": 20,              //event timestamp - minute
  "s": 10,              //event timestamp - seconds
  "$_id": "0e9dcf4b6b5b0dc7", //cookie visitor
  "$_idts": 1433860426,       //cookie visitor count
  "$_idvc": 2,          //Number of visits in the session
  "$_idn": 0,           //Whether a new visitor or not
  "$_refts": 0,         //Referral timestamp
  "$_viewts": 1433881201,  //Last Visit timestamp
  "$_ref": '',          //Referral url
  "send_image": 0,      //used image to send payload
  "uap": "MacIntel",     //client platform
  "uab": "Netscape",     //client browser
  "pdf": 1,             //browser feature: supports pdf
  "qt": 0,              //browser feature: supports quickTime
  "realp": 0,           //browser feature: supports real player
  "wma": 0,             //browser feature: supports windows media player
  "dir": 0,             //browser feature: supports director
  "fla": 1,             //browser feature: supports shockwave
  "java": 1,            //browser feature: supports java
  "gears": 0,           //browser feature: supports google gear
  "ag": 0,              //browser feature: supports silver light
  "cookie": 1,          //browser feature: has cookies
  "res": "3360x2100",   //browser feature: screen resolution
  "gt_ms": 51           //Config generation performance generation time
}
```
## Deploying to IBM Bluemix

The fastest way to deploy this application to Bluemix is to click the **Deploy to Bluemix** button below. If you prefer instead to deploy manually then read the entirety of this section.

[![Deploy to Bluemix](https://bluemix.net/deploy/button_x2.png)](https://bluemix.net/deploy?repository=https://github.com/ibm-cds-labs/metrics-collector)

**Don't have a Bluemix account?** If you haven't already, you'll be prompted to sign up for a Bluemix account when you click the button.  Sign up, verify your email address, then return here and click the the **Deploy to Bluemix** button again. Your new credentials let you deploy to the platform and also to code online with Bluemix and Git. If you have questions about working in Bluemix, find answers in the [Bluemix Docs](https://www.ng.bluemix.net/docs/).

### Configure Cloud Foundry

Complete these steps first if you have not already:

1. [Install the Cloud Foundry command line interface.](https://www.ng.bluemix.net/docs/#starters/install_cli.html)
2. Follow the instructions at the above link to connect to Bluemix.
3. Follow the instructions at the above link to log in to Bluemix.

### Create Backing Services

Create a Cloudant service within Bluemix if one has not already been created:

    $ cf create-service cloudantNoSQLDB Shared metrics-collector-cloudant-service

### Deploy

To deploy to Bluemix, simply:

    $ cf push

**Note:** You may notice that Bluemix assigns a URL to your application containing a random word. This is defined in the `manifest.yml` file where the `random-route` key set to the value of `true`. This ensures that multiple people deploying this application to Bluemix do not run into naming collisions. To specify your own route, remove the `random-route` line from the `manifest.yml` file and add a `host` key with the unique value you would like to use for the host name.

### Privacy Notice

This web application includes code to track deployments to [IBM Bluemix](https://www.bluemix.net/) and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker](https://github.com/cloudant-labs/deployment-tracker) service on each deployment:

* Application Name (`application_name`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)

This data is collected from the `VCAP_APPLICATION` environment variable in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix to measure the usefulness of our examples, so that we can continuously improve the content we offer to you. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

#### Disabling Deployment Tracking

Deployment tracking can be disabled by removing the following line from `server.js`:

```
require("cf-deployment-tracker-client").track();
```

Once that line is removed, you may also uninstall the `cf-deployment-tracker-client` npm package.
