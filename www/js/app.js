
angular.module('expense_manager', ['ionic', 'controllers' ,'ngCordova', 'ionic-datepicker','nvd3','angularMoment','firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      /*cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);*/

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
   
 
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.overview', {
      url: '/overview',
      views: {
        'menuContent': {
          templateUrl: 'templates/overview.html',
          controller: 'overviewCtrl'
        }
      }
    })
    .state('app.postExpense', {
      url: '/postExpense',
      views: {
        'menuContent': {
          templateUrl: 'templates/postExpense.html',
          controller: 'postExpenseCtrl'
        }
      }
    })
    .state('app.history', {
      url: '/history',
      views: {
        'menuContent': {
          templateUrl: 'templates/history.html',
          controller: 'historyCtrl'
        }
      }
    })
    .state('app.categories', {
      url: '/categories',
      views: {
        'menuContent': {
          templateUrl: 'templates/categories.html',
          controller: 'categoriesCtrl'
        }
      }
    })
    .state('app.category', {
      url: '/category',
      views: {
        'menuContent': {
          templateUrl: 'templates/category.html',
          controller: 'categoryCtrl'
        }
      },params:{
        data:'',
        cat:''
      }
    })
    .state('app.statistics', {
      url: '/statistics',
      views: {
        'menuContent': {
          templateUrl: 'templates/statistics.html',
          controller: 'statisticsCtrl'
        }
      }
    })
    .state('app.setExpense', {
      url: '/setExpense',
      views: {
        'menuContent': {
          templateUrl: 'templates/setExpense.html',
          controller: 'setExpenseCtrl'
        }
      }
    })
    .state('app.cloud', {
      url: '/cloud',
      views: {
        'menuContent': {
          templateUrl: 'templates/cloud.html',
          controller: 'cloudCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/overview');
});
