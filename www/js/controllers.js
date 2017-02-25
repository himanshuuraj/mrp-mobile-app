angular.module('starter.controllers', ['ngDraggable'])

.service('loginCred', function() {
    var config = {
    apiKey: "AIzaSyD3C0GHIqn8g-CMATS60LDcoQotkqM3ex8",
    authDomain: "stage-db-b035c.firebaseapp.com",
    databaseURL: "https://stage-db-b035c.firebaseio.com",
    storageBucket: "stage-db-b035c.appspot.com",
    messagingSenderId: "950510485815"
  };
  firebase.initializeApp(config);
  var authRef = this.authRef = firebase.auth();
  this.dbRef = firebase.database().ref();
  this.moveToUrl = function(urlToMove){
      var currentUrl = window.location.href.toString();
      var index = currentUrl.indexOf("/app/");
      currentUrl = currentUrl.substring(0,index);
      currentUrl += '/app/' + urlToMove;
      window.location.href = currentUrl;
  };
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  
  $scope.showHeader = true;
  if(window.location.href.includes("login"))
      $scope.showHeader = false;
  
  $scope.loginData = {};
  
  $rootScope.$on('agent',function(){
      $scope.isAgent = window.localStorage.isAgent;
  });
  $scope.isAgent = false;// window.localStorage.isAgent;

    $scope.signOut = function(){
        window.localStorage.clear();
        window.location.href = "http://localhost:8383/lalitha/index.html#/app/login";//"/app.login";
    };
})
.controller('searchCtrl', function($scope,$http,loginCred,$state,$ionicNavBarDelegate) {
    var earlySelectedTab = "rice";
    var userId = window.localStorage.userId;
    var existingShops;
    $scope.urlOfImage = "https://mrps-orderform.firebaseapp.com/";
    var dbRef = loginCred.dbRef;
    var shopDetail = {name : "",tin : ""};
    $scope.cartArray = {};
    $scope.cartArray = {};//[shopDetail.tin] = [];
    $scope.tabArray = ['rice','ravva','broken'];
    
    $scope.isAgent = window.localStorage.isAgent;
    
     var getShopData = function(){
        var shopsRef = dbRef.child('users/'+userId + '/shops');
        shopsRef.once('value', function(snap) {
                     existingShops = snap.val();
                     if(existingShops.length == 1){
                                window.localStorage.shopName = shopDetail.name = existingShops[0].name;
                                window.localStorage.tin = shopDetail.tin = existingShops[0].tin;
                                $scope.cartArray[shopDetail.tin] = [];
                     }else
                           $scope.shopArray = existingShops;
                     console.log(existingShops);
        });
    }
    
    $scope.getShopItem = function(shop){
        shopDetail.name = shop.name;
        shopDetail.tin = shop.tin;
        if(!$scope.cartArray[shopDetail.tin] )
            $scope.cartArray[shopDetail.tin] = [];
    };
    
    $scope.init = function(){
        getShopData();
    }
    
    String.prototype.getWeight = function(){
        var x = this.toString();
        return parseInt(x.substring(0,x.length-2));
    }

    $scope.changeContent = function(type){
        earlySelectedTab = $scope.selectedItem;
        $scope.selectedItem = type;
        document.getElementById(type+"tab").className = "button button-assertive";
        document.getElementById(earlySelectedTab+"tab").className = "button button-positive";
    };

    $scope.addToCart = function(key,value){
        var tickElement = document.getElementById(key+"button");
        if(tickElement.style.backgroundColor == "white"){
            var x = {};
            var quantityElement = document.getElementById(key+"quantity");
            var bagElement = document.getElementById(key+"bag");
            var quantity = quantityElement.value;
            var bag = bagElement.value;
            if(!bag && !quantity){
                alert("Please insert bag or quantity");
                return;
            }
            tickElement.style.backgroundColor = "green";
            x = value;
            
            x["productId"] = key;
            x["quantity"] = quantity;
            x["bag"] = bag;
            x["price"] = "Rs 1200";
            delete x.description;
            delete x.available;
            $scope.cartArray[shopDetail.tin].push(x);
        }else{
            tickElement.style.backgroundColor = "white";
            var length = $scope.cartArray[shopDetail.tin].length;
            for(var index = 0; index<length; index++){
                if($scope.cartArray[shopDetail.tin][index].productId == key){
                    $scope.cartArray[shopDetail.tin].splice(index,1);
                    break;
                }
            }
        }
        window.sessionStorage.cartArray = JSON.stringify($scope.cartArray);
        console.log($scope.cartArray);
    };
    
    $scope.proceedToSaveInCart = function(){
        var x = {};
        angular.forEach($scope.cartArray[shopDetail.tin],function(item,index){
            x[index] = item;
        });
        window.sessionStorage.cartArray = JSON.stringify($scope.cartArray);
        //$state.go('app.cart', {arg:'arg'});
        //loginCred.moveToUrl("cart");
        //saveInCart(x);
    };
    
    var saveInCart = function(x){
        var ordersRef =  dbRef.child('orders');

          var newOrder = {
            userid : window.localStorage.userId,
            orderId : "12345",
            time : "1458903245",
            userName : "Rama Raju",
            district :"East Godavari",
            city : "Kakinda",
            state : "Andhra Pradesh",
            status : "in-cart",
            shops : {
              0 : {
                name : window.localStorage.shopName,
                TIN : window.localStorage.tin,
                items : x
              },
             }
          };
          console.log(newOrder);
          ordersRef.push(newOrder);
    }
    
    $scope.getImageUrl = function(key){
        return $scope.urlOfImage+$scope.selectedItem+"_200/"+key+".png";
    };
    
   $http.get("https://mrps-orderform.firebaseio.com/products.json")
   .success(function(data){
        console.log(data);
        $scope.brokenArray = data.broken;
        $scope.ravvaArray = data.ravva;
        $scope.riceArray = data.rice;
        document.getElementById("ricetab").className = "button button-assertive";
        $scope.selectedItem = "rice";
   }).error(function(err){
        console.log(err);
   });

    $scope.textInQuantity = function(key,weight){
       var quantityElement = document.getElementById(key+"quantity");
       var quantity = Number(quantityElement.value);
       var bag = document.getElementById(key+"bag");
       weight = weight.getWeight();//Number(weight.substring(0,weight.length - 2));
       bag.value =  quantity/weight;
       if((quantity/weight).constructor != Number)
           quantityElement.style.border = "1px solid red";
    };
})

.controller('loginCtrl', function($scope,$http,$state,loginCred,$rootScope,$ionicNavBarDelegate) {
  var dbRef = loginCred.dbRef;
  var authRef = loginCred.authRef;
  $scope.userData = {};
  $scope.loginAgain = false;
  $scope.signUpData = {
      shop :{
         tax_id : {}
      }
  };
    
   $ionicNavBarDelegate.showBackButton(false);
    
  $scope.signIn = function(){
      //$scope.showUserInputField = true;
      if(!$scope.userData.password || !$scope.userData.username){
          alert("Please fill the required info");
          return;
      }
     
      var promise = authRef.signInWithEmailAndPassword($scope.userData.username,$scope.userData.password);
        promise.then(function(e) {
                       var usersRef = dbRef.child('users/'+ e.uid);
                       var userId = window.localStorage.userId = e.uid;
                       usersRef.once('value').then(function(data){
                           alert("signIn successful");
                           var data = data.val();
                           console.log(data);
                           if(data){
                               window.localStorage.userInfo = JSON.stringify(data);
                               window.localStorage.isAgent = data.isAgent;
                               $rootScope.$broadcast('isAgent',{});
                               //getShopData();
                               $state.go('app.search', {name:'name',tin:'tin'});
                           }
                           else{
                               $scope.showUserInputField = true;
                               $scope.$apply();
                           }
                       }).catch(function(e){console.log(e)});	
        }).catch(
                function(e){
                    alert("Username password doesnt match")
                    console.log(e);
                });
  };
  
  $scope.signUp = function(){
      if(!$scope.userData.password || !$scope.userData.username){
          alert("Please fill the required info");
          return;
      }
      //var dbRef = firebase.database().ref();
      var promise = authRef.createUserWithEmailAndPassword($scope.userData.username,$scope.userData.password);
      promise.then(function(e) {
 	 	 	var usersRef = dbRef.child('users');
 			var userId=e.uid;
                        window.localStorage.userId = userId;
 	 	 	 usersRef.once('value', function(snap){
 	 	 	 	if(snap.hasChild(userId)){
 	 	 	 		alert("exists");
                                        $state.transitionTo('app.search', {arg:'arg'});
 	 	 	 		//proceed to load the main page
 	 	 	 	}else{
                                    $scope.showUserInputField = true;
                                    $scope.$apply();
                                    alert("done");
                                    //load the form page to enter profile info
                                    
 	 	 	 	}
 	 	 	 });  	
 	 }).catch(e => console.log(e))
      
  };
  $scope.fillSignUpData = function(){
      var usersRef = dbRef.child('users/'+ window.localStorage.userId );
	var foo = {};
                    foo = {
                            email : $scope.userData.username,
                            name : $scope.signUpData.name,
                            mobile : $scope.signUpData.mobile,
                            isAgent : $scope.signUpData.isAgent,
                            address : $scope.signUpData.address,
                            shops : [{
                                    name: $scope.signUpData.shop.name,
                                    proprietor_name : $scope.signUpData.shop.proprietor_name,
                                    mobile : $scope.signUpData.shop.mobile,
                                    pan : $scope.signUpData.shop.pan,
                                    tin : $scope.signUpData.shop.tin,
                                    state : $scope.signUpData.shop.state,
                                    district : $scope.signUpData.shop.district,
                                    city : $scope.signUpData.shop.city,
                                    address : $scope.signUpData.shop.address,
                                    tax_id : {
                                     type : $scope.signUpData.shop.tax_id.type,
                                     value : $scope.signUpData.shop.tax_id.value
                                    }
                            }]
                    };
                    var promise = usersRef.set(foo);
                        promise.then(function(e) {
                            alert("Please Login Again");
                            $scope.loginAgain = true;
                            $scope.$apply();
 	}).catch(e => console.log(e))
         
  };
  
  $scope.moveToLoginScreen = function(){
    $scope.showUserInputField = true;  
  };
  
  $scope.getIsAgent = function(data){
      if(data == 'true'){
          $scope.signUpData.isAgent = true;
      }else{
          $scope.signUpData.isAgent = false;
      }
  };
  
})
.controller('shopCtrl', function($scope,$http,$state) {
  var userInfo = JSON.parse(window.localStorage.userInfo);
  $scope.shopArray = userInfo.shops;
  $scope.showShopInput = false;
  $scope.shop = {
      tax_id : {}
  };
  $scope.createNewShop = function(){
      $scope.showShopInput = true;
  };
  $scope.showItems = function(name,tin){
      window.localStorage.tin = tin;
      window.localStorage.shopName = name;
      $state.go('app.search', {name:name,tin:tin});
  };
})

.controller('cartCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate) {
    
     var userId = window.localStorage.userId;
     var userInfo = JSON.parse(window.localStorage.userInfo);
     var dbRef = loginCred.dbRef;
     var ordersRef =  dbRef.child('orders');
    $scope.init = function(){
        var temp = JSON.parse(window.sessionStorage.cartArray);
        $scope.cartArray = temp;//[tin];
        console.log($scope.cartArray);
        //$ionicNavBarDelegate.showBackButton(false);
    };
    $scope.deliveryArray = {};
    var selectedLorrySize = 25;
    $scope.submitOrder = function(){
            
        var x = {};
        angular.forEach($scope.cartArray,function(item,index){
            x[index] = item;
            delete x[index].$$hashKey;
        });
        console.log(x);
        var newOrder = {
                userid : window.localStorage.userId,
                orderId : "2016",
                time : new Date().getTime(),
                userName : userInfo.name,
                district : userInfo.shops[0].district,
                city : userInfo.shops[0].city,
                state : userInfo.shops[0].state,
                status : "in-cart",
                shops : {
                        0 : {
                                name : userInfo.shops[0].name,
                                TIN : userInfo.shops[0].tin,
                                items : x
                        }
                }

        }
        var promise = ordersRef.push(newOrder);
                promise.then(function(e) {
                    alert("submitted");
        }).catch(e => console.log(e))
    }
            
    $scope.addToDeliveryArray = function(key,value){
        var x = {};
        x[key] = value;
        if(!$scope.deliveryArray[selectedLorrySize]){
            $scope.deliveryArray[selectedLorrySize] = {};
            $scope.deliveryArray[selectedLorrySize][key] = [];
        }
        if(!$scope.deliveryArray[selectedLorrySize][key])
            $scope.deliveryArray[selectedLorrySize][key] = [];
        $scope.deliveryArray[selectedLorrySize][key].push(value);
        console.log($scope.deliveryArray);
        /*
         * $scope.deliveryArray = {
         *      25 : {
         *              tin :[] 
         * */
    };
    
    $scope.removeItemFromDeliverable = function(key,value){
        var x = {};
        x[key] = value;
        if(!$scope.deliveryArray[selectedLorrySize] || !$scope.deliveryArray[selectedLorrySize][key])
            return;
        var lengthOfArray = $scope.deliveryArray[selectedLorrySize][key].length;
        for(var index = 0; index <  lengthOfArray; index++){
            if($scope.deliveryArray[selectedLorrySize][key][index].productId == value.productId){
                $scope.deliveryArray[selectedLorrySize][key].splice(index,1);
                if($scope.deliveryArray[selectedLorrySize][key].length == 0)
                    delete $scope.deliveryArray[selectedLorrySize][key];
                if(Object.keys($scope.deliveryArray[selectedLorrySize]).length == 0)
                    delete $scope.deliveryArray[selectedLorrySize];
                break;
            }
        }
        console.log($scope.deliveryArray);
    }
         
    $scope.onDropComplete = function(data,event){
        console.log(data);
        $scope.deliveryArray.push($scope.cartArray[data]);
        $scope.cartArray.slice(data,1);
        console.log(event);
    }
         
})

.controller('orderCtrl', function($scope,$http) {
  $scope.shopArray = ["shop1","shop2","shop3"];
  $scope.showShopInput = false;
  $scope.shop = {
      tax_id : {}
  };
  $scope.createNewShop = function(){
      $scope.showShopInput = true;
  };
  $scope.selectedLorry = "17 kg";
})
        
.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
