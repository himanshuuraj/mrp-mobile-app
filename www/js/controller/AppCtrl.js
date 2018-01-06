app.controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope,loginCred) {
  // Form data for the login modal
  $scope.showHeader = true;
  if(window.location.href.includes("login"))
    $scope.showHeader = false;

  $scope.loginData = {};

  $rootScope.$on('isAgent',function(){
    if(window.localStorage.isAgent == "true")
      $scope.isAgent = true;
  });
  $scope.isAgent = false;// window.localStorage.isAgent;
  if(window.localStorage.isAgent == "true")
    $scope.isAgent = true;

  $scope.signOut = function(){
    var cartArray = window.localStorage.cartArray;
    var favouriteObject = window.localStorage.favouriteObject;
    var shopInfoObject = window.localStorage.shopInfo;
    window.localStorage.clear();
    if(cartArray)
      window.localStorage.cartArray = cartArray;
    if(favouriteObject)
      window.localStorage.favouriteObject = favouriteObject;
    if(shopInfoObject)
      window.localStorage.shopInfo = shopInfoObject

    window.sessionStorage.clear();
    window.location.hash = "#/app/login";
  };

  $scope.continue = function(){
    $rootScope.$broadcast("continue",{});
  };
  var addToCartElement;
  $rootScope.$on('cached',function (data) {
    $timeout(function() {
      updateCart();
      var x = document.getElementById("ricetab");
      if(x){
        x.className = "button btnSelected";
      }
    },1000);
  });

  var updateCart = loginCred.updateCart;

  $scope.redirect = function(type){
    type = "#/app/"+type;
    window.location.hash = type;
  }

});
