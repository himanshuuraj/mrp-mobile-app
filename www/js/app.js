// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.views.forwardCache(true);
  //$ionicConfigProvider.views.swipeBackEnabled(false);
  $stateProvider

    .state('app', {
        cache: false,
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    cache: false,
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'searchCtrl'
      }
    }
  })

  .state('app.shop', {
      cache: false,
      url: '/shop',
      views: {
        'menuContent': {
          templateUrl: 'templates/shop.html',
          controller: 'shopCtrl'
        }
      }
    })
    .state('app.cart', {
      cache: false,
      url: '/cart',
      views: {
        'menuContent': {
          templateUrl: 'templates/cart.html',
          controller: 'cartCtrl'
        }
      }
    })
    .state('app.orders', {
      cache: false,
      url: '/orders',
      views: {
        'menuContent': {
          templateUrl: 'templates/orders.html',
          controller: 'orderCtrl'
        }
      }
    })
     .state('app.summary', {
      cache: false,
      url: '/summary',
      views: {
        'menuContent': {
          templateUrl: 'templates/summary.html',
          controller: 'summaryCtrl'
        }
      }
    })

    .state('app.login', {
        cache: false,
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl'
        }
      }
    })
    
     .state('app.prices', {
      url: '/prices',
      views: {
        'menuContent': {
          templateUrl: 'templates/prices.html',
          controller: 'pricesCtrl'
        }
      }
    });

  
  $ionicConfigProvider.scrolling.jsScrolling(false);
 
  // Or for only a single platform, use
  // if( ionic.Platform.isAndroid() ) {
    // $ionicConfigProvider.scrolling.jsScrolling(false);
  // }

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/app/playlists');
})

.run(function($ionicPlatform,$state) {
    
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    //$ionicConfigProvider.views.swipeBackEnabled(false);
   if(window.localStorage.userId)
       window.location.hash = "#/app/search";
   else
      window.location.hash = "#/app/login";

  });
  
    //$ionicConfigProvider.views.swipeBackEnabled(false);
});
