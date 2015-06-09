

# metrics-collector
* Implements a collector for tracking web site usage data. The data is stored into a cloudant database.
* Includes a piwik based implementation fo the tracking client code.

## Usage
**Configuring the Application:**

1. Request a tracking id for your application (at the moment, you can generate your own unique id).
2. Include the tracker.js as a script tag in every page you want to track. Include the site application id from #1
   
``` javascript
     <script src="http://metrics-collectors.mybluemix.net/tracker.js" siteid="my.unique.id"/>
```

That's it! Tracking events will be generated and sent to the collector. You can peek at the data by looking at the cloudant dashbaord for the database used by the collector.

**Configuring the collector**

You can specify the cloudant url as a System variable e.g:
CLOUDANT_URL=https://userid:password@dtaieb.cloudant.com

If you are deploying the app to Bluemix, then you have more database configuration options:

1. Add a Cloudant Service and bind it to the app.
2. Specify the CLOUDANT_URL system variable as a user-defined environment variable in the Application properties

## Developing
If your application is dynamically updating part of DOM (based on search results for example), you will need to make extra calls to make sure the tracking click handlers are correctly updated.
For example:
``` javascript
  //Use enableLinkTrackingForNode method to install the tracking handler on all the links under a specified DOM Node
  _paq.push([ enableLinkTrackingForNode, $('#results')]);
``` 

Note: You can find additional documentation on events supported by piwik at http://developer.piwik.org/guides/tracking-javascript-guide

## Data Model of the tracking payload
``` javascript
{
  "type": "search",     //Type of event being captured (currently pageView, search and link)
  "idsite": "cds.search.engine", //app id (must be unique)
  "ip": "75.126.70.43",    //ip of the client
  "url": "http://cloudant-labs.github.io/resources.html",   //source url for the event
  "geo": {     //geo coordinates of the client (if user allowed)
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
