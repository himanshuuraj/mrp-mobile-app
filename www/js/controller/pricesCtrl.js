app.controller('pricesCtrl',
  function ($scope, $http, $stateParams, loginCred, $ionicNavBarDelegate,
            $ionicPopup, $timeout, $rootScope) {

  var config = loginCred.config;
  $scope.intVsDisp = {};

  $scope.loadPrices = function () {
    var usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid);

    var internalVsDisplay = loginCred.dbRef.child('internalVsDisplay');
    internalVsDisplay.once('value', function (data) {
      $scope.intVsDisp = data.val();
    })

    var areas = [];
    var userInfo = JSON.parse(window.localStorage.userInfo);

    var shops = userInfo.shops;
    if (shops != null) {
      for (i = 0; i < shops.length; i++) {
        var found = false;
        for (ky = 0; ky < areas.length; ky++) {
          if (areas[ky] == shops[i].areaId) {
            found = true;
            break;
          }
        }
        if (!found)
          areas.push(shops[i].areaId);
      }
    }

    $scope.getKey = function(item){
      var productJSON = loginCred.config.products;
      for(var key in productJSON){
        if(item.includes(key))
          return key;
      }
    }

    $scope.pricesForAreas = {};
    var priorityAreaJSON = {};
    var itemJSON = config.products;
    for(var keyINProduct in itemJSON) {
      var localStoragePriorityArray = keyINProduct + "ItemsPriorityArray";
      var priorityArray = keyINProduct + "PriorityArray";
      if(!window.localStorage[localStoragePriorityArray])
        continue;
      priorityAreaJSON[priorityArray] = JSON.parse(window.localStorage[localStoragePriorityArray]);
    }
      for (j = 0; j < areas.length; j++) {
        (function (j) {
          var ordersRef = loginCred.dbRef.child('priceList/' + areas[j]);
          ordersRef.once('value', function (data) {
            //console.log(areas[j]);
            var items = data.val();
            var priceArray = {};
            for(var key in itemJSON){
              priceArray[key + "Array"] = items[key];
            }
            var foobar = {};
            var bar = [];
            var userType = 'Agent';
            if (!window.localStorage.isAgent)
              userType = 'Outlet';

            for(var area in priorityAreaJSON){
              priorityAreaJSON[area].forEach(function (object) {
                var key = $scope.getKey(area);
                var itemArray = priceArray[key+"Array"];
                if(!itemArray)
                  return;
                var displayNameOfProduct = $scope.intVsDisp[object['key']];
                if (displayNameOfProduct == null)
                  displayNameOfProduct = object['key'];

                if ((!itemArray[object['key']])
                  || (!itemArray[object['key']][userType])
                  || (itemArray[object['key']][userType] == ""))
                  return;
                var foo = {
                  name: displayNameOfProduct,
                  price: itemArray[object['key']][userType]
                };
                bar.push(foo);
              });
              foobar[area] = bar;
              bar = [];
            }

            $scope.pricesForAreas[$scope.intVsDisp[areas[j]]] = foobar;
            console.log($scope.pricesForAreas);
            if(!$scope.$$phase)
              $scope.$apply();
            $rootScope.$broadcast("cached", {});

          })
        })(j);
      }

    $rootScope.$broadcast("cached", {});
  };
});
