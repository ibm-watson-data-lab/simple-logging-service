(function() {
  window.addEventListener('DOMContentLoaded', function () {
    // Tell Vue to use Socket.io
    var socketUrl = `${location.protocol}//${location.hostname}${(location.port ? ':'+location.port: '')}`;
    Vue.use(VueSocketio, socketUrl);

    var ABOUT = Vue.extend({
      template: '#about'
    });
    
    var STREAM = Vue.extend({
      template: '#stream',
      data: function() {
        return { logs: [] };
      },
      methods: {
        clear: function() {
          this.logs = [];
        }
      },
      computed: {
        reverse: function() {
          return this.logs.reverse();
        }
      },
      sockets:{
        output: function(log) {
          this.logs.push(JSON.stringify(log, null, 1));
        }
      }
    });

    var INGREDIENTS = Vue.extend({
      template: '#ingredients'
    });

    var app = Vue.extend({});
    var router = new VueRouter();

    router.map({
      '/': {
          component: ABOUT
      },
      '/stream': {
          component: STREAM
      },
      '/ingredients': {
          component: INGREDIENTS
      }
    });

    router.start(app, '#loggingservice');
  });
}());
