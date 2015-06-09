

# metrics-collector
* Implements a collector for tracking web site usage data. The data is stored into a cloudant database.
* Includes a piwik based implementation fo the tracking client code.

## Usage
**Configuring the Application:**

1. Request a tracking id for your application (at the moment, you can generate your own unique id).
2. Include the tracker.js as a script tag in every page you want to track. Include the site application id from #1
   
``` javascript
     <script src="http://metrics-collectors.mybluemix.net/js/tracker.js" siteid="my.unique.id"/>
```

That's it! Tracking events will be generated and sent to the collector. You can peek at the data by looking at the cloudant dashbaord for the database used by the collector.

**Configuring the collector**

You can specify the cloudant url as a System variable e.g:
CLOUDANT_URL=https://userid:password@dtaieb.cloudant.com

If you are deploying the app to Bluemix, then you have more database configuration options:

1. Add a Cloudant Service and bind it to the app.
2. Specify the CLOUDANT_URL system variable as a user-defined environment variable in the Application properties

## Developing
