angular.module('starter.controllers', ['ngDraggable'])

.service('loginCred', function($ionicPopup) {
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
  
  this.showPopup = function(msg,title) {
      title = title || "Alert"; 
    var alertPopup = $ionicPopup.alert({
      title: 'Alert!',
      template: msg
    });
    alertPopup.then(function(res) {
      console.log('Thank you for not eating my delicious ice cream cone');
    });
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

.controller('summaryCtrl', function($scope,$http,loginCred,$state) {
    $scope.init = function(){
        $scope.cartArray = {
  "shops" : [ {
    "items" : {
      "ravva" : {
        "1KGLalithaBlue" : {
          "bags" : 30,
          "discount_price" : 200,
          "name" : "1 KG Super Fine Ravva",
          "price" : 120,
          "weight" : 10
        },
        "5KGLalithaGreen" : {
          "bags" : 80,
          "discount_price" : 150,
          "name" : "5 KG Lalitha Green Ravva",
          "price" : 120,
          "weight" : 10
        }
        
      },
      "rice" : {
        "10KGLalithaBrown" : {
          "bags" : 500,
          "discount_price" : 4300,
          "name" : "10KG Lalitha Brown Rice",
          "price" : 4500,
          "weight" : 20
        },
        "5KGLalithaGreen" : {
          "bags" : 400,
          "discount_price" : 2200,
          "name" : "5KG Lalitha Green Rice",
          "price" : 2300,
          "weight" : 25
        },
        "10KGLalithaPink" : {
          "bags" : 350,
          "discount_price" : 2200,
          "name" : "10KG Lalitha Pink Rice",
          "price" : 2500,
          "weight" : 250
        }
      }
    },
    "name" : "Ram Kirana Stores"
  }, {
    "items" : {
      "ravva" : {
        "1KGLalithaBlue" : {
          "bags" : 30,
          "discount_price" : 200,
          "name" : "1 KG Super Fine Ravva",
          "price" : 120,
          "weight" : 10
        }
      },
      "rice" : {
        "10KGLalithaBrown" : {
          "bags" : 500,
          "discount_price" : 4300,
          "name" : "10KG Lalitha Brown Rice",
          "price" : 4500,
          "weight" : 20
        },
        "5KGLalithaGreen" : {
          "bags" : 400,
          "discount_price" : 2200,
          "name" : "5KG Lalitha Green Rice",
          "price" : 2300,
          "weight" : 25
        }
      }
    },
    "name" : "Tom Kirana Stores"
    
  }],
  "grossPrice" : "35700",
    "totalPrice" : "34500",
    "totalWeight" : "14500",
    "discountAmount" : "1200"
}

$scope.shopArray=$scope.cartArray.shops;

    };
    
    
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
                    alert("Your order has been successfully placed");
        }).catch(function(e){ console.log(e);alert('Some problem occured while submitting the order')})
    }

})


.controller('searchCtrl', function($scope,$http,loginCred,$state) {
    var earlySelectedTab = "rice";
    $scope.init = function(){
      //TODO - change this to call everytime shop is changed
      $scope.getItemsPrice();
      setTimeout(function(){getShopData();},0);
    };
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
                                $scope.shopDetail = shopDetail;
                     }else
                           $scope.shopArray = existingShops;
                     console.log(existingShops);
        });
    }
    
    $scope.addQuantity = function(key,masterWeight){
        var weight = masterWeight.getWeight();
        var element = document.getElementById(key+"quantity");
        var initWeight = element.value;
        if(initWeight)
            initWeight = parseInt(initWeight);
        element.value = initWeight + weight;
        $scope.textInQuantity(key,masterWeight);
    };
    $scope.minusQuantity = function(key,masterWeight){
        var weight = masterWeight.getWeight();
        var element = document.getElementById(key+"quantity");
        var initWeight = element.value;
        if(initWeight)
            initWeight = parseInt(initWeight);
        var finalWeight = initWeight - weight;
        if(finalWeight < 0)
            return;
        element.value = finalWeight;
        $scope.textInQuantity(key,masterWeight);
    };
    $scope.addBag = function(key,master_weight){
        var element = document.getElementById(key+"bag");
        element.value = ++element.value;
        $scope.textInBag(key,master_weight);
    };
    $scope.minusBag = function(key,master_weight){
        var element = document.getElementById(key+"bag");
        if(!(element.value < 1)){
         element.value = --element.value;
         $scope.textInBag(key,master_weight);
        }
    };
    
    $scope.textInBag = function(key,master_weight){
        var weight =  master_weight.getWeight();
        var bagElement = document.getElementById(key+"bag");
        var bagNumber = parseInt(bagElement.value);
        document.getElementById(key+"quantity").value = bagNumber * weight;
    }
    
    $scope.getShopItem = function(shop){
        shopDetail.name = shop.name;
        shopDetail.tin = shop.tin;
        $scope.shopDetail = shopDetail;
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
    
    $scope.getProductItems = function(){
        var productsRef = dbRef.child('products');
        productsRef.once('value').then(function(productSnapshot){
            var productsList = productSnapshot.val();
            $scope.brokenArray = productsList.broken;
            $scope.ravvaArray = productsList.ravva;
            $scope.riceArray = productsList.rice;
            document.getElementById("ricetab").className = "button button-assertive";
            $scope.selectedItem = "rice";  
            $scope.$apply();
        }).catch(function(){
            console.log("Failed to get list of product items");
        });

    };
    
    $scope.getPrice = function(key){
        //
        var type=$scope.selectedItem;
//        var shopName = "";
//        var tin = "";
//        key='10kgLalithaBrown';
        var arrayName = type + 'PriceArray';
      //  var orderContext = shop.orderContext; //orderContext = agent/outlet/user
        var orderContext = 'agent';
        var price = 'N/A';
        if($scope[arrayName] && $scope[arrayName][key] && $scope[arrayName][key][orderContext])
            price = $scope[arrayName][key][orderContext];   
            
        return price;
    }
    
    $scope.getItemsPrice = function(){
        //TODO replace areasDummy
      //  var areaId = shop.areaId;
        var areaRef = dbRef.child('areasDummy/'+'VSP_RURAL');
        areaRef.once('value').then(function(areaSnapshot){
            var productsList = areaSnapshot.val();
            console.log("Fetched list of prices for selected area" + productsList);
            $scope.brokenPriceArray = productsList.broken;
            $scope.ravvaPriceArray = productsList.ravva;
            $scope.ricePriceArray = productsList.rice;
            $scope.getProductItems();

        }).catch(function(){
            console.log("Failed to get list of product items");
        })

    };
    
    $scope.getSelectedItemArray = function(){
        $scope.selectedItem = $scope.selectedItem || "rice";
        return $scope[$scope.selectedItem+"Array"] || [];
    }

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
  
  var showPopUp = loginCred.showPopup;
  
  $scope.isChecked = true;
  // $ionicNavBarDelegate.showBackButton(false);
    
  $scope.signIn = function(){
      //$scope.showUserInputField = true;
      if(!$scope.userData.password || !$scope.userData.username){
          showPopUp("Please fill the required info");
          return;
      }
     
      var promise = authRef.signInWithEmailAndPassword($scope.userData.username,$scope.userData.password);
        promise.then(function(e) {
                       var usersRef = dbRef.child('users/'+ e.uid);
                       var userId = window.localStorage.userId = e.uid;
                       usersRef.once('value').then(function(data){
                           showPopUp("signIn successful");
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
                    showPopUp("Username password doesnt match");
                    console.log(e);
                });
  };
  
  $scope.signUp = function(){
      if(!$scope.userData.password || !$scope.userData.username){
          showPopUp("Please fill the required info");
          return;
      }
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
                               showPopUp("done");
                               //load the form page to enter profile info
                           }
                    });  	
 	 }).catch(e => console.log(e))
      
  };
  
  var validateField = function(){
      if(!$scope.signUpData.name){
          showPopUp('Enter Name Of User');
          return 0;
      }
      if(!$scope.signUpData.mobile){
          showPopUp('Enter Mobile Of User');
          return 0;
      }
      if($scope.signUpData.isAgent.constructor != Boolean){
          showPopUp('Please confirm agentType');
          return 0;
      }
      if($scope.signUpData["isAgent"])
          return 1;
      if(!$scope.signUpData.shop.name){
          showPopUp('Enter Shop Name');
          return 0;
      }
      if(!$scope.signUpData.shop.proprietor_name){
          showPopUp('Enter Proprietor Name');
          return 0;
      }
      if(!$scope.signUpData.shop.mobile){
          showPopUp('Enter Shop Mobile');
          return 0;
      }
      if(!$scope.signUpData.shop.pan){
          showPopUp('Enter Shop Pan');
          return 0;
      }
      if(!$scope.signUpData.shop.tin){
          showPopUp('Enter Shop Tin');
          return 0;
      }
      if(!$scope.signUpData.shop.state){
          showPopUp('Enter Shop State');
          return 0;
      }
      if(!$scope.signUpData.shop.district){
          showPopUp('Enter Shop District');
          return 0;
      }
      if(!$scope.signUpData.shop.city){
          showPopUp('Enter Shop City');
          return 0;
      }
      if(!$scope.signUpData.shop.address){
          showPopUp('Enter Shop address');
          return 0;
      }
      if(!$scope.signUpData.shop.tax_id.type){
          showPopUp('Enter shop tax id');
          return 0;
      }
      if(!$scope.signUpData.shop.tax_id.value){
          showPopUp('Enter shop tax id');
          return 0;
      }
      return 1;
  }
  
  $scope.fillSignUpData = function(){
      if(!validateField())
          return;
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
                     if($scope.signUpData.isAgent){
                        foo.shops = [];
                    }
                    var promise = usersRef.set(foo);
                    promise.then(function(e) {
                            showPopUp("Please Login Again");
                            $scope.showUserInputField = false;
                            $scope.$apply();
 	}).catch(e => showPopUp("Please try again"));
         
  };
  
  $scope.moveToLoginScreen = function(){
    $scope.showUserInputField = true;  
  };
  
  $scope.getIsAgent = function(data){
      //alert(data);
      if(data == true){
          $scope.signUpData["isAgent"] = true;
      }else{
          $scope.signUpData["isAgent"] = false;
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
     //var userInfo = JSON.parse(window.localStorage.userInfo);
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
                    showPopUp("submitted");
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
    $scope.deliveryArray = [];            
    var userInfo = window.localStorage.userInfo;
    console.log(userInfo);
    //$scope.userInfo = JSON.parse(window.localStorage.userInfo);
         
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
