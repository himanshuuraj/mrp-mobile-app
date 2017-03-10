angular.module('starter.controllers', ['ngDraggable','ngCordova'])

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
  
  var urlOfImage = "https://mrps-orderform.firebaseapp.com/";
  String.prototype.getWeight = function(){
        var x = this.toString();
        return parseInt(x.substring(0,x.length-2));
    }
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
  this.addQuantity = function(key,masterWeight,index){
        var weight = masterWeight.getWeight();
        var element;
        if(index != undefined)
              element  = document.getElementById(key+"quantity" + index);
        else
              element = document.getElementById(key+"quantity");
        var initWeight = element.value;
        if(initWeight)
            initWeight = parseInt(initWeight);
        element.value = initWeight + weight/100;
        if(index == undefined)
            this.textInQuantity(key,masterWeight);
        else
            this.textInQuantity(key,masterWeight,index);
    };
  this.minusQuantity = function(key,masterWeight,index){
    var weight = masterWeight.getWeight();
    var element;
    if((index === 0)  || index)
          element  = document.getElementById(key+"quantity" + index);
    else
          element = document.getElementById(key+"quantity");
    var initWeight = element.value;
    if(initWeight)
        initWeight = parseInt(initWeight);
    var finalWeight = initWeight - weight/100;
    if(finalWeight < 0)
        return;
    element.value = finalWeight;
   if((index === 0)  || index)
        this.textInQuantity(key,masterWeight,index);
    else
        this.textInQuantity(key,masterWeight);
};
  this.addBag = function(key,master_weight,index){
    var element;
    if((index === 0)  || index)
          element  = document.getElementById(key+"bag" + index);
    else
          element = document.getElementById(key+"bag");
    element.value = ++element.value;
    if((index === 0)  || index)
        this.textInBag(key,master_weight,index);
    else
        this.textInBag(key,master_weight);
};
  this.minusBag = function(key,master_weight,index){
    var element;
    if((index === 0)  || index)
          element  = document.getElementById(key+"bag" + index);
    else
          element = document.getElementById(key+"bag");
    if(!(element.value < 1)){
     element.value = --element.value;
     if((index === 0)  || index)
        this.textInBag(key,master_weight,index);
    else
        this.textInBag(key,master_weight);
    }
};
  var computePrice = this.computePrice = function(key,index) {
        var bagElement;
    if((index === 0)  || index)
        bagElement = document.getElementById(key+"bag"+index);
    else
        bagElement = document.getElementById(key+"bag");
    
    var price= this.getPrice(key);
    var bagNumber =  Number(bagElement.value);
    document.getElementById(key+"computedPrice").innerHTML="&#8377;"+bagNumber*price;
        
  };
  this.textInBag = function(key,master_weight,index){
    var weight =  master_weight.getWeight();
    var bagElement;
    if((index === 0)  || index)
        bagElement = document.getElementById(key+"bag"+index);
    else
        bagElement = document.getElementById(key+"bag");
    var bagNumber = parseInt(bagElement.value);
    if((index === 0)  || index)
        document.getElementById(key+"quantity"+index).value = (bagNumber * weight)/100 ;
    else
        document.getElementById(key+"quantity").value = (bagNumber * weight)/100;
   // computePrice(key,index);

};

  this.textInQuantity = function(key,weight,index){
   var quantityElement = !index?document.getElementById(key+"quantity"):document.getElementById(key+"quantity"+index);
   if((index === 0)  || index)
        quantityElement = document.getElementById(key+"quantity"+index);
    else
        quantityElement = document.getElementById(key+"quantity");
   var quantity = Number(quantityElement.value);
   var bag;
   if((index === 0)  || index)
        bag = document.getElementById(key+"bag"+index);
    else
        bag = document.getElementById(key+"bag");
   weight = weight.getWeight();//Number(weight.substring(0,weight.length - 2));
   bag.value =  quantity*100/weight;
};
  this.getImageUrl = function(key,selectedItem){
        return urlOfImage+selectedItem+"_200/"+key+".png";
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
  
  $rootScope.$on('isAgent',function(){
      if(window.localStorage.isAgent == "true")
        $scope.isAgent = true;
  });
  $scope.isAgent = false;// window.localStorage.isAgent;
  if(window.localStorage.isAgent == "true")
    $scope.isAgent = true;

    $scope.signOut = function(){
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.hash = "#/app/login";//"/app.login";
    };

    $scope.continue = function(){
      $rootScope.$broadcast("continue",{});
    };
})

.controller('summaryCtrl', function($scope,$http,loginCred,$state,$ionicPopup) {
    if(window.localStorage.isActive === 'false') {
                 alert("User not activated. Please contact administrator");
                 return;
     }
    $scope.init = function(){
        $scope.cartArray = JSON.parse(window.localStorage.cartInfo);
        $scope.shopArray=$scope.cartArray.shopDetail;
    };
    $scope.submitOrder = function(){
        var userInfo = JSON.parse(window.localStorage.userInfo);
        var dbRef = loginCred.dbRef;
        var now = new Date();
        var monthsText=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var year = now.getYear();
        var mathRandom = Math.floor((Math.random())*1000);
        var orderId= (now.getDate()).toString()  + monthsText[now.getMonth()] + (now.getYear()%10).toString() + '-'+
            userInfo.name.substring(0,3).toUpperCase() + userInfo.mobile.substring(0,3) +'-'+ mathRandom.toString();

        var cartArray = $scope.cartArray;
        var shopLength = cartArray.shopDetail.length;
        for(var index = 0; index < shopLength; index++)
            delete cartArray.shopDetail[index].$$hashKey;

        var ordersRef =  dbRef.child('orders/' + orderId);

        var newOrder = {
            uid : window.localStorage.uid,
            time :  now.getTime(),
            userName : userInfo.name,
            status : "received",
            cart :  cartArray
        };


        var usersRef = dbRef.child('users/' + window.localStorage.uid );

        usersRef.once('value', function(data){
            var userValue = data.val();
            userValue["orders"] = userValue["orders"] || [];
            userValue["orders"].push(orderId);
            var promise = usersRef.update(userValue);
        });



        var promise = ordersRef.set(newOrder);
        promise.then(function(e) {
            alert("Your order has been successfully placed");
        }).catch(function(e){ console.log(e);alert('Some problem occured while submitting the order')})
    };
    $scope.showConfirmPopUp = function() {
        var myPopup = $ionicPopup.show({
            template: 'Do you want to place the order?',
            title: 'Confirm Order',
            scope: $scope,
            buttons: [
                { text: 'Cancel' }, {
                    text: '<b>Place</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.submitOrder();
                    }
                }
            ]
        });
        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });
    };
})

.controller('searchCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$timeout,$interval) {
     if(window.localStorage.isActive === 'false') {
                 alert("User not activated. Please contact administrator");
                 return;
     }
    var earlySelectedTab = "rice";
    var uid = window.localStorage.uid;
    var existingShops;
    var dbRef = loginCred.dbRef;
    $scope.shopDetail = {name : "",tin : ""};
    $scope.cartArray = {};
    $scope.tabArray = ['rice','ravva','broken'];
    $scope.isAgent = window.localStorage.isAgent;
    if(window.localStorage.isAgent == "true")
      $scope.isAgent = true;
    var shopInfo = {};
    if(window.localStorage.shopInfo)
        shopInfo = JSON.parse(window.localStorage.shopInfo);
    var getShopData = function(){
        var shopsRef = dbRef.child('users/'+uid + '/shops');
        shopsRef.once('value', function(snap) {
                     existingShops = snap.val();
                     if(!$scope.isAgent){
                                window.localStorage.shopName = $scope.shopDetail.name = existingShops[0].name;
                                window.localStorage.tin = $scope.shopDetail.tin = existingShops[0].tin;
                                $scope.cartArray[$scope.shopDetail.tin] = [];
                     }else{
                           $scope.shopArray = existingShops;
                           if(!window.localStorage.tin)
                                $scope.showShopPopUp();
                       }
                      $scope.$apply();
                     console.log(existingShops);
        });
    }
    $scope.addQuantity = loginCred.addQuantity;
    $scope.minusQuantity = loginCred.minusQuantity
    $scope.addBag = loginCred.addBag;
    $scope.minusBag = loginCred.minusBag;
     var addToCartElement = document.getElementById("addToCartLogo");
     var userInfo = {};
     if(window.localStorage.userInfo)
        userInfo = JSON.parse(window.localStorage.userInfo);
    $scope.textInBag = function(key,master_weight,index){
        var x = loginCred.textInBag;
        x(key,master_weight,index);
        $scope.computePrice(key);
    };
     $scope.textInQuantity = function(key,master_weight,index){
        var x = loginCred.textInQuantity;
        x(key,master_weight,index);
        $scope.computePrice(key);
    };
             
    
     $scope.init = function(){
      //TODO - change this to call everytime shop is changed
        $scope.getItemsPrice();
        //setTimeout(function(){getShopData();},0);
        if(window.localStorage.shopName){
            $scope.shopDetail = {name : window.localStorage.shopName,tin : window.localStorage.tin};
        }
    };
    
     $scope.showShopPopUp = function() {
      var myPopup = $ionicPopup.show({
        template: '<div class="list">'+
            '<label class="item item-input">'+
            '<input type="text" id="searchElement" ng-model = "shopSearchElement.name"/>'+
            '</label></div><ion-list> ' +
          '<ion-radio ng-repeat="shop in shopArray | filter:filterSearchedArray" ng-value="shop" ng-click="setSearchedShop(shop)">'+
          '{{shop.name}}</ion-radio>'+
          ' </ion-list>',
           title: 'Choose Shop',
           scope: $scope,
           buttons: [
              { text: 'Cancel' }, {
                 text: '<b>Done</b>',
                 type: 'button-positive',
                    onTap: function(e) {
                        console.log($scope.shopArray);
                       if (!$scope.shopDetail.name) {
                          //don't allow the user to close unless he enters model...
                             e.preventDefault();
                       } else {
                          return $scope.shopDetail;
                       }
                    }
              }
           ]
        });
      myPopup.then(function(res) {
         console.log('Tapped!', res);
      });    
    };
    
    if(!$scope.isAgent){
                window.localStorage.shopName = $scope.shopDetail.name = userInfo.shops[0].name;
                window.localStorage.tin = $scope.shopDetail.tin = userInfo.shops[0].tin;
                $scope.cartArray[$scope.shopDetail.tin] = [];
     }else{
           $scope.shopArray = userInfo.shops || [];
           if(!window.localStorage.tin)
                $scope.showShopPopUp();
            else{
                $scope.shopDetail.name = window.localStorage.shopName;
                $scope.shopDetail.tin = window.localStorage.tin;
            }
       }
    
    $scope.getShopItem = function(shop){
        $scope.shopDetail.name = shop.name;
        $scope.shopDetail.tin = shop.tin;
        if(!$scope.cartArray[$scope.shopDetail.tin] )
            $scope.cartArray[$scope.shopDetail.tin] = [];
    };
    
    $scope.$on("continue",function(){
      $scope.proceedToSaveInCart();
    });

    String.prototype.getWeight = function(){
        var x = this.toString();
        return parseInt(x.substring(0,x.length-2));
    }

    $scope.changeContent = function(type){
        earlySelectedTab = $scope.selectedItem;
        $scope.selectedItem = type;
        document.getElementById(type+"tab").className = "button button-positive";
        document.getElementById(earlySelectedTab+"tab").className = "button bgdarkGray";
        addUI();
    };

    $scope.addToCart = function(key,value){
        var addToCartNumber = addToCartElement.innerText;
        if(addToCartNumber)
          addToCartNumber = parseInt(addToCartNumber);
        else
          addToCartNumber = 0;
        var tickElement = document.getElementById(key+"button");
        if(tickElement.style.backgroundColor == "darkgray")
        {
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
            tickElement.className='button icon ion-checkmark-round';
            x = value;
            x["productId"] = key;
            x["itemType"] = $scope.selectedItem;
            x["quantity"] = quantity;
            x["bag"] = bag;
            var priceELement = document.getElementById(key+"computedPrice");
            x["price"] = priceELement.innerHTML.split(1)[1] ;
            delete x.description;
            delete x.available;
            $scope.cartArray[$scope.shopDetail.tin] = $scope.cartArray[$scope.shopDetail.tin] || [];
            $scope.cartArray[$scope.shopDetail.tin].push(x);
            addToCartNumber++;
            doAnimation(key);
        }else{
            tickElement.style.backgroundColor = "darkgray";
            tickElement.className='button icon ion-plus-round';

            var length = $scope.cartArray[$scope.shopDetail.tin].length;
            for(var index = 0; index<length; index++){
                if($scope.cartArray[$scope.shopDetail.tin][index].productId == key){
                    $scope.cartArray[$scope.shopDetail.tin].splice(index,1);
                    break;
                }
            }
            if(addToCartNumber > 0)
              addToCartNumber--;
        }
        window.sessionStorage.cartArray = JSON.stringify($scope.cartArray);
        console.log($scope.cartArray);
        addToCartElement.innerHTML = addToCartNumber.toString();
    };

    var cln;
    var timeOfAnimation = 30;
    var count = 0;
    var widthObj = {
        start : 100,
        end : 50,
        change : 0,
        getChange : function(){
           return this.change/timeOfAnimation;
        },
        newCoord : function(){
          this.start = this.start - this.getChange();
          return Math.floor(this.start);
        }
    };
    var heightObj = {
        start : 100,
        end : 50,
        change : 0,
        getChange : function(){
           return this.change/timeOfAnimation;
        },
        newCoord : function(){
          this.start = this.start - this.getChange();
          return Math.floor(this.start);
        }
    };
    var topObj = {
        start : 100,
        end : 50,
        change : 0,
        getChange : function(){
           return this.change/timeOfAnimation;
        },
        newCoord : function(){
          this.start = this.start - this.getChange();
          return Math.floor(this.start);
        }
    };
    var leftObj = {
        start : 100,
        end : 800,
        change : 0,
        getChange : function(){
          return this.change/timeOfAnimation;
        },
        newCoord : function(){
          this.start = this.start + this.getChange();
          return Math.floor(this.start);
        }
    };
    function doAnimation(key){
       addToCartElement.className = "button button-icon button-clear ion-ios-cart";
       var imageButton = document.getElementById(key+"image");
       cln = imageButton.cloneNode(true);
       document.body.appendChild(cln);
       var coord = imageButton.getBoundingClientRect();
       leftObj.start = coord.left;
       topObj.start = coord.top;
       heightObj.start = coord.height;
       widthObj.start = coord.width;
       //adToCardButton
       var coord2 = addToCartElement.getBoundingClientRect();
       leftObj.end = coord2.left;
       topObj.end = coord2.top;
       heightObj.end = coord2.height;
       widthObj.end = coord2.width;

       leftObj.change = leftObj.end - leftObj.start;
       topObj.change = topObj.start - topObj.end;
       heightObj.change = heightObj.start - heightObj.end;
       widthObj.change = widthObj.start - widthObj.end;
       cln.style.cssText = "position:fixed;left:"+coord.left+"px;top:"+coord.top+"px;"+
                  "z-index:99999;height:"+coord.height+"px;width:"+coord.width+"px;";
       var promise = $interval(function(){
            cln.style.left = leftObj.newCoord().toString() + "px";
            cln.style.top = topObj.newCoord().toString() + "px";
            cln.style.width = widthObj.newCoord().toString() + "px";
            cln.style.height = heightObj.newCoord().toString() + "px";
            count++;
            if(count >=30){
              count = 0;
              $interval.cancel(promise);
              document.body.removeChild(cln);
              addToCartElement.className += " shakeAnimation";
            }
       },20);
    }
    
    $scope.proceedToSaveInCart = function(){
        var x = {};
        angular.forEach($scope.cartArray[$scope.shopDetail.tin],function(item,index){
            x[index] = item;
        });
        window.sessionStorage.cartArray = JSON.stringify($scope.cartArray);
        window.location.hash = "#/app/cart";
    };
    
    $scope.getImageUrl = loginCred.getImageUrl;
    
    $scope.getProductItems = function(){
        var productsRef = dbRef.child('products');
        productsRef.once('value').then(function(productSnapshot){
            var productsList = productSnapshot.val();
            $scope.brokenArray = productsList.broken;
            $scope.ravvaArray = productsList.ravva;
            $scope.riceArray = productsList.rice;
            document.getElementById("ricetab").className = "button button-positive";
            $scope.selectedItem = "rice";  
            $scope.$apply();
        }).catch(function(){
            console.log("Failed to get list of product items");
        });

    };
    
    $scope.getPrice = function(key){
        //
        var type=$scope.selectedItem; var shopContext = 'Agent';

        if(window.localStorage.isAgent=='true')
            shopContext = 'Agent';
        else
            shopContext = 'Outlet';
        
             var arrayName = type + 'PriceArray';
       
        var price = 'N/A';
        if($scope[arrayName] && $scope[arrayName][key] && $scope[arrayName][key][shopContext])
            price = $scope[arrayName][key][shopContext];   
            
        return price;
    }
    
    $scope.computePrice = function(key,index) {
        var bagElement;
    if((index === 0)  || index)
        bagElement = document.getElementById(key+"bag"+index);
    else
        bagElement = document.getElementById(key+"bag");
    
    var price= $scope.getPrice(key);
    var bagNumber =  Number(bagElement.value);
    document.getElementById(key+"computedPrice").innerHTML="&#8377;"+bagNumber*price;
        
    }
    
    var earlySelectedShop = {};
    
    $scope.getItemsPrice = function(){
        var areaId = 'VIZAG_RURAL_AP';
        var areaRef = dbRef.child('priceList/'+ areaId);
        areaRef.once('value').then(function(areaSnapshot){
            var productsList = areaSnapshot.val();
            console.log("Fetched list of prices for selected area" + productsList);
            window.localStorage.brokenPriceArray=JSON.stringify(productsList.broken);
            $scope.brokenPriceArray = productsList.broken;
            window.localStorage.ravvaPriceArray=JSON.stringify(productsList.ravva);
                    $scope.ravvaPriceArray = productsList.ravva;
            window.localStorage.ricePriceArray=JSON.stringify(productsList.rice);
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
    
    $scope.setSearchedShop = function(shop){
        earlySelectedShop["tin"] = $scope.shopDetail.tin;
        window.localStorage.shopName = $scope.shopDetail.name = shop.name;
        window.localStorage.tin = $scope.shopDetail.tin = shop.tin;
        shopInfo[shop.tin] = shop;
        window.localStorage.shopInfo = JSON.stringify(shopInfo);
        $timeout(function(){updateUI();},0);
    };
    
    var deleteUI = function(){
        var tin = earlySelectedShop["tin"];
        var obj = $scope.cartArray[tin] || [];
        for(var index = 0; index < obj.length; index++){
            var productId = obj[index].productId;
            var quantityElement = document.getElementById(productId + "quantity");
            if(!quantityElement) continue;
            var bagElement = document.getElementById(productId + "bag");
            var buttonElement = document.getElementById(productId + "button");
            quantityElement.value = "";
            bagElement.value = "";
            buttonElement.style.backgroundColor = "darkgray";
            buttonElement.className='button icon ion-plus-round';
        }
    }
    
    var addUI = function(){
        var tin = $scope.shopDetail.tin;
        var obj = $scope.cartArray[tin] || [];
        for(var index = 0; index < obj.length; index++){
            var productId = obj[index].productId;
            $timeout(function(arg) {
                    var quantityElement = document.getElementById(arg.pId + "quantity");
                    if(!quantityElement)
                        return;
                    var bagElement = document.getElementById(arg.pId + "bag");
                    var buttonElement = document.getElementById(arg.pId + "button");
                    quantityElement.value = obj[arg.index].quantity;
                    bagElement.value = obj[arg.index].bag;
                    buttonElement.style.backgroundColor = "green";
                    buttonElement.className='button icon ion-checkmark-round';
          }, 0,true,{pId:productId,index:index});
        }
    }
    
    var updateUI = function(){
        deleteUI();
        addUI();
    }

   $http.get("https://mrps-orderform.firebaseio.com/products.json")
   .success(function(data){
        console.log(data);
        $scope.brokenArray = data.broken;
        $scope.ravvaArray = data.ravva;
        $scope.riceArray = data.rice;
        document.getElementById("ricetab").className = "button button-positive";
        $scope.selectedItem = "rice";
   }).error(function(err){
        console.log(err);
   });
   
   $scope.shopSearchElement ={
              name: ""
   };
   $scope.shopArray = $scope.shopArray || [];
   $scope.filterSearchedArray = function(shop){
       if($scope.shopSearchElement.name === "" || $scope.shopSearchElement.name === undefined)
           return true;
      return shop.name.includes($scope.shopSearchElement.name.toLowerCase());
  }
})

.controller('loginCtrl', function($scope,$http,$state,loginCred,$rootScope,$ionicNavBarDelegate,$cordovaToast) {
  var dbRef = loginCred.dbRef;
  var authRef = loginCred.authRef;
  $scope.userData = {};
  $scope.loginAgain = false;
  var showPopUp = loginCred.showPopup;
  $scope.isChecked = true;
  var userInfo;
  var uid;
  $scope.signUpData = {
      isAgent : true,
      shop :{
         tax_id : {}
      }
  };
 
  // $ionicNavBarDelegate.showBackButton(false);
  $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
            console.log("The toast was shown");
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    };
    
    $scope.onClickAnchorTag = function() {
        var anchorText = document.getElementById('toggle').text;
        if(anchorText=='SignUp'){
            document.getElementById('toggle').text='Login';
             document.getElementById('myOption').textContent = 'SignUp';
        }else{
             document.getElementById('toggle').text='SignUp';
                         document.getElementById('myOption').textContent = 'Login';
        }
    };
    $scope.onClickButton = function() { 
    var buttonText = document.getElementById('myOption').textContent;
    if(buttonText == 'Login') {
        if(!$scope.userData.password || !$scope.userData.username){
          //showPopUp("Please fill the required info");
          $scope.showToast('this is a test', 'long', 'center');
          return;
      }
     
      var promise = authRef.signInWithEmailAndPassword($scope.userData.username,$scope.userData.password);
        promise.then(function(e) {
            
                      var authMobileRef = dbRef.child('authMobileMap/'+ e.uid);
                      authMobileRef.once('value').then(function(data){
                         var uid = data.val();
                         if(uid == null) {
                             alert("User not found. Please signup");
                             return;
                         }
                            var usersRef = dbRef.child('users/'+ uid);
                       uid = window.localStorage.uid = uid;
                       usersRef.once('value').then(function(data){
                           data = data.val();
                           console.log(data);
                           if(data){
                               userInfo = data;
                               window.localStorage.userInfo = JSON.stringify(data);
                               window.localStorage.isAgent = data.isAgent;
                               window.localStorage.isActive = data.active;
                               $rootScope.$broadcast('isAgent',{});
                               if(!userInfo.shops || (userInfo.shops.length == 0))
                                    window.location.hash = "#/app/shop";
                                else if(!data.active){
                                    alert("User not activated. Please contact administrator")
                                }else{
                                    window.location.hash = "#/app/search";
                                }
                           }
                           else{
                               $scope.showUserInputField = true;
                               $scope.$apply();
                           }
                       }).catch(function(e){console.log(e)});	
                      }).catch(function(e){console.log(e)});	
                      
                     
        }).catch(
                function(e){
                    showPopUp("Username password doesnt match");
                    console.log(e);
                });
    }else {
        if(!$scope.userData.password || !$scope.userData.username){
          showPopUp("Please fill the required info");
          return;
      }
      var promise = authRef.createUserWithEmailAndPassword($scope.userData.username,$scope.userData.password);
      promise.then(function(e) {
         var authId=e.uid;
        window.localStorage.authId = e.uid;
        $scope.showUserInputField = true;
        $scope.$apply();  
         //TODO - change this - below implementation is wrong users/{id} will not exist after creating user
 	 var usersRef = dbRef.child('users/' + authId);
                    // window.localStorage.userId = userId;
//                    usersRef.once('value', function(snap){
//                           if(snap){
//                               
//                               $scope.$apply();                                   //proceed to load the main page
//                           }else{                             
//                               showPopUp("User could not be created.");
//                               //load the form page to enter profile info
//                           }
//                    });  	
 	 }).catch(e => console.log(e));
      
        
    }
    }
  
  $scope.signUp = function(){
      if(!$scope.userData.password || !$scope.userData.username){
          showPopUp("Please fill the required info");
          return;
      }
      var promise = authRef.createUserWithEmailAndPassword($scope.userData.username,$scope.userData.password);
      promise.then(function(e) {
         var authId=e.uid;
        window.localStorage.authId = e.uid;
        $scope.showUserInputField = true;
        $scope.$apply();  
         //TODO - change this - below implementation is wrong users/{id} will not exist after creating user
 	 var usersRef = dbRef.child('users/' + authId);
                    // window.localStorage.userId = userId;
//                    usersRef.once('value', function(snap){
//                           if(snap){
//                               
//                               $scope.$apply();                                   //proceed to load the main page
//                           }else{                             
//                               showPopUp("User could not be created.");
//                               //load the form page to enter profile info
//                           }
//                    });  	
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
      }else{
          if($scope.signUpData.mobile.length != 10){
                showPopUp("Mobile Number Not Accurate");
                return 0;
           }
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
      }else{
          if($scope.signUpData.shop.mobile.length != 10) {
              showPopUp('Mobile Number Not Correct');
              return 0;
          }
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
      var authId = window.localStorage.authId;
      
      var fulladdress= "Sarjapur ; Bangalore"
//      var fulladdress = $scope.signUpData.shop.shopnumber + " ; " +
//              $scope.signUpData.shop.street + " ; " +  
//              $scope.signUpData.shop.landmark + " ; " +  
//              $scope.signUpData.shop.area + " ; " +  
//              $scope.signUpData.shop.district + " ; " +  
//                            $scope.signUpData.shop.city + " ; " +  
//              $scope.signUpData.shop.state + " ; " +  
//                 $scope.signUpData.shop.pincode + " ; " ; 
//              
      
      if(!validateField())
          return;
        var foo = {};
            foo = {
                    email : $scope.userData.username,
                    active:false,
                    name : $scope.signUpData.name,
                    mobile : $scope.signUpData.mobile,
                    isAgent : $scope.signUpData.isAgent,
                    address : $scope.signUpData.address,
                    authId : authId,
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
            var uid = $scope.signUpData.mobile
            var authIdMobileMapRef = dbRef.child('authMobileMap/' + authId);
            var promiseFromAuthMobile = authIdMobileMapRef.set(uid);
            promiseFromAuthMobile.then(function(e){
                console.log("Successfully added mobile mapping to the auth id");
                window.localstorage.uid=uid;
            }).catch(e => console.log("Could not add mobile mapping"));
            var usersRef = dbRef.child('users/'+ uid );
            var promise = usersRef.set(foo);
            promise.then(function(e) {
                    showPopUp("Please Login Again");
                    $scope.showUserInputField = false;
                    window.localStorage.clear();
                    window.sessionStorage.clear();
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

.controller('shopCtrl', function($scope,$http,loginCred,$state) {
  var userInfo = JSON.parse(window.localStorage.userInfo);
  $scope.shopArray = userInfo.shops || [];
  $scope.showShopInput = false;
  var showPopUp = loginCred.showPopup;
  var userId;
  $scope.editType = false;
  $scope.shop = {
      tax_id : {}
  };
  
  $scope.removeShop = function(tin){
      var shops = userInfo.shops || [];
      var length = shops.length;
      var flag = 0;
      for(var index = 0; index < length; index++){
          if(shops[index].tin == tin){
              shops.splice(index,1);
              flag = 1;
              break;
          }
      }
      if(flag){
            userInfo.shops = shops;
      }
      saveShop();
  }

  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
  var validateShop = function(){
      if(!$scope.shop.name){
          showPopUp('Enter Shop Name');
          return 0;
      }
      if(!$scope.shop.proprietor_name){
          showPopUp('Enter Proprietor Name');
          return 0;
      }
      if(!$scope.shop.mobile){
          showPopUp('Enter Shop Mobile');
          return 0;
      }else{
          if($scope.shop.mobile.length != 10){
              showPopUp('Mobile Number not correct');
              return 0;
          }
      }
      if(!$scope.shop.pan){
          showPopUp('Enter Shop Pan');
          return 0;
      }
      if(!$scope.shop.tin){
          showPopUp('Enter Shop Tin');
          return 0;
      }
      /*if(!$scope.shop.state){
          showPopUp('Enter Shop State');
          return 0;
      }*/
      if(!$scope.shop.district){
          showPopUp('Enter Shop District');
          return 0;
      }
      if(!$scope.shop.city){
          showPopUp('Enter Shop City');
          return 0;
      }
      if(!$scope.shop.address){
          showPopUp('Enter Shop address');
          return 0;
      }
      if(!$scope.shop.tax_id.type){
          showPopUp('Enter shop tax id');
          return 0;
      }
      if(!$scope.shop.tax_id.value){
          showPopUp('Enter shop tax id');
          return 0;
      }
      return 1;
  }
  
  $scope.addNewShop = function(){
      if(!validateShop())
          return;
      if($scope.editType){
          $scope.editShop();
          return;
      }
      userInfo["shops"] = userInfo["shops"] || [];
      console.log($scope.shop);
      userInfo["shops"].push(JSON.parse(JSON.stringify($scope.shop)));
      saveShop('add');
  };
  
  var saveShop = function(type){
      delete userInfo.$$hashKey;
      var shopLength = userInfo.shops.length;
      for(var index = 0; index < shopLength; index++)
          delete userInfo.shops[index].$$hashKey;
      var uid = window.localStorage.uid;
      var dbRef = loginCred.dbRef;
      var usersRef = dbRef.child('users/'+ uid);
      var foo = {};
      foo[uid] = userInfo;
      var promise = usersRef.update(userInfo);
      promise.then(function(e) {
                console.log( e);
                    window.localStorage.userInfo = JSON.stringify(userInfo);
                    if(type == 'add'){
                        showPopUp("Shop added successfully");
                        $scope.shop = {
                            tax_id : {}
                        };
                        $scope.showShopInput = false;
                    }
                    else if(type == 'edit'){
                        showPopUp("Shop edited successfully");
                        $scope.shop = {
                            tax_id : {}
                        };
                        $scope.showShopInput = false;
                    }
                    else{
                        showPopUp("Shop deleted successfully");
                        /*for(var index = 0; index < $scope.shopArray.length; index++){
                            if($scope.shopArray[index].tin == tin){
                                $scope.shopArray.splice(index,1);
                                break;
                            }
                        }*/
                    }
                    $scope.shopArray = userInfo.shops || [];
                    $scope.editType = false;
                    $scope.showShopInput = false
                    $scope.$apply();
                    window.localStorage.userInfo = JSON.stringify(userInfo);

        }).catch(e => showPopUp("Please try again"));
  }

  $scope.showEditBox = function(shop){
        $scope.shop = shop;
        console.log(shop);
        $scope.showShopInput = true;
        $scope.editType = true;
  };

  $scope.editShop = function(){
    console.log(userInfo);
    var length = userInfo.shops.length;
    for(var index = 0; index < length; index++){
        var shop = userInfo.shops[index];
        if($scope.shop.tin == shop.tin){
            userInfo.shops[index] = $scope.shop;
            break;
        }
    }
    saveShop('edit');
  };


})

.controller('cartCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout) {
    if(window.localStorage.isActive === 'false') {
     alert("User not activated. Please contact administrator");
     return;
}
    var uid = window.localStorage.uid;
    var userInfo = JSON.parse(window.localStorage.userInfo);
    var dbRef = loginCred.dbRef;
    var ordersRef =  dbRef.child('orders');
    $scope.getImageUrl = loginCred.getImageUrl;
    var shopInfo = {};
    if(window.localStorage.shopInfo)
        shopInfo = JSON.parse(window.localStorage.shopInfo);
    $scope.deliveryArray = {};
    var selectedLorrySize = $scope.selectedLorrySize = 25;
    var progressBarElement = document.getElementById("progressBar");
    var totalQuantity = $scope.totalQuantity = 0;
    var earlySelectedLorry;
    $scope.deliveryArray = [];
    $scope.lorryArray = [17,21,25];

    $scope.init = function(){
        var temp = JSON.parse(window.sessionStorage.cartArray);
        $scope.cartArray = temp || [];//[tin];
        console.log($scope.cartArray);
        //$ionicNavBarDelegate.showBackButton(false);
    };

    $scope.setSelectedLorrySize = function(lorry){
        earlySelectedLorry = $scope.selectedLorrySize;
        $scope.selectedLorrySize = selectedLorrySize = lorry;
        computeWidth(totalQuantity);
    };

    $scope.showLorryPopUp = function() {
        // Custom popup
        var myPopup = $ionicPopup.show({
        template: '<ion-list  > ' +
        '<ion-radio ng-repeat="lorry in lorryArray" ng-value="lorry" ng-click="setSelectedLorrySize(lorry)">'+
        '{{lorry}} tonnes</ion-radio>'+
        ' </ion-list>',
        title: 'Choose Lorry',
        scope: $scope,
        buttons: [
        { text: 'Cancel' }, {
        text: '<b>Done</b>',
        type: 'button-positive',
        onTap: function(e) {
        console.log($scope.selectedLorrySize);
        if (!$scope.selectedLorrySize) {
        //don't allow the user to close unless he enters model...
        e.preventDefault();
        } else {
        return $scope.selectedLorrySize;
        }
        }
        }
        ]
        });
        myPopup.then(function(res) {
        console.log('Tapped!', res);
        });
    };

    $scope.addToDeliveryArray = function(key,value,index){
        var x = {};
        console.log(value);
        value.quantity = document.getElementById(key+"quantity"+index).value;
        value.bag = document.getElementById(key+"bag"+index).value;
        value.price = document.getElementById(key+"computedPrice"+index).innerText.trim();
        x[key] = value;
        var selectedLorrySize = $scope.selectedLorrySize;
        if(!$scope.deliveryArray[selectedLorrySize]){
        $scope.deliveryArray[selectedLorrySize] = {};
        $scope.deliveryArray[selectedLorrySize][key] = [];
        }
        //        if(!$scope.deliveryArray[selectedLorrySize][key])
        //            $scope.deliveryArray[selectedLorrySize][key] = [];
        value["index"] = index;
        $scope.deliveryArray[selectedLorrySize][key].push(value);
        totalQuantity += parseInt(value.quantity);
        computeWidth(totalQuantity);
        /*
        * $scope.deliveryArray = {
        *      25 : {
        *              tin :[]
        * */
    };

    function computeWidth(totalQuantity){
var width = totalQuantity*10/selectedLorrySize;
if(width > 100)
progressBarElement.style.backgroundColor = "red";
else
progressBarElement.style.backgroundColor = "green";
progressBarElement.style.width = width.toString()+"%";
$scope.totalQuantity = totalQuantity;
console.log($scope.deliveryArray);
}

    $scope.removeItemFromDeliverable = function(key,value,index){
var x = {};
x[key] = value;
if(!$scope.deliveryArray[selectedLorrySize] || !$scope.deliveryArray[selectedLorrySize][key])
return;
var lengthOfArray = $scope.deliveryArray[selectedLorrySize][key].length;
for(var index = 0; index <  lengthOfArray; index++){
if($scope.deliveryArray[selectedLorrySize][key][index].productId == value.productId){
$scope.deliveryArray[selectedLorrySize][key].splice(index,1);
totalQuantity -= parseInt(value.quantity);
if($scope.deliveryArray[selectedLorrySize][key].length == 0)
delete $scope.deliveryArray[selectedLorrySize][key];
if(Object.keys($scope.deliveryArray[selectedLorrySize]).length == 0)
delete $scope.deliveryArray[selectedLorrySize];
break;
}
}
computeWidth(totalQuantity);
}
    console.log(userInfo);

    $scope.getDeliveryArray = function(){
return $scope.deliveryArray[selectedLorrySize] || [];
};

    $scope.addQuantity = function(key, value, index){

var weight = value.master_weight.getWeight();
var element;
if(index != undefined)
element  = document.getElementById(key+"quantity" + index);
else
element = document.getElementById(key+"quantity");
var initWeight = element.value;
if(initWeight)
initWeight = parseFloat(initWeight);
element.value = initWeight + weight/100;
if(index == undefined)
$scope.textInQuantity(key,value);
else
$scope.textInQuantity(key,value,index);



}

    $scope.minusQuantity = function(key, value, index){

var weight = value.master_weight.getWeight();
var element;
if((index === 0)  || index)
element  = document.getElementById(key+"quantity" + index);
else
element = document.getElementById(key+"quantity");
var initWeight = element.value;
if(initWeight)
initWeight = parseFloat(initWeight);
var finalWeight = initWeight - weight/100;
if(finalWeight < 0)
return;
element.value = finalWeight;
if((index === 0)  || index)
$scope.textInQuantity(key,value,index);
else
$scope.textInQuantity(key,value);



}
    $scope.addBag = function(key, value, index){
var element;
if((index === 0)  || index)
element  = document.getElementById(key+"bag" + index);
else
element = document.getElementById(key+"bag");
element.value = ++element.value;
if((index === 0)  || index)
$scope.textInBag(key,value,index);
else
$scope.textInBag(key,value);

}
    $scope.minusBag = function(key, value, index){
        var element;
        if((index === 0)  || index)
        element  = document.getElementById(key+"bag" + index);
        else
        element = document.getElementById(key+"bag");
        if(!(element.value < 1)){
        element.value = --element.value;
        if((index === 0)  || index)
        $scope.textInBag(key,value,index);
        else
        $scope.textInBag(key,value);

        }
    }

    $scope.textInBag = function(key,value,index){
    var weight =  value.master_weight;
    var bagElement;
    if((index === 0)  || index)
    bagElement = document.getElementById(key+"bag"+index);
    else
    bagElement = document.getElementById(key+"bag");
    var bagNumber = parseInt(bagElement.value);
    if((index === 0)  || index)
    document.getElementById(key+"quantity"+index).value = (bagNumber * weight.getWeight())/100 ;
    else
    document.getElementById(key+"quantity").value = (bagNumber * weight.getWeight())/100;
    $scope.computePrice(key,value.productId,index,value.itemType);
    };

    $scope.textInQuantity = function(key,value,index){
        var quantityElement = !index?document.getElementById(key+"quantity"):document.getElementById(key+"quantity"+index);
        var weight=value.master_weight;
        if((index === 0)  || index)
        quantityElement = document.getElementById(key+"quantity"+index);
        else
        quantityElement = document.getElementById(key+"quantity");
        var quantity = Number(quantityElement.value);
        var bag;
        if((index === 0)  || index)
        bag = document.getElementById(key+"bag"+index);
        else
        bag = document.getElementById(key+"bag");
        weight = weight.getWeight();//Number(weight.substring(0,weight.length - 2));
        bag.value =  quantity*100/weight;
        $scope.computePrice(key,value.productId,index,value.itemType);
    };
    $scope.computePrice = function(key,productId,index,type) {
    var bagElement;
    if((index === 0)  || index)
    bagElement = document.getElementById(key+"bag"+index);
    else
    bagElement = document.getElementById(key+"bag");

    var price= $scope.getPrice(productId,type);
    var bagNumber =  Number(bagElement.value);
    document.getElementById(key+"computedPrice"+index).innerHTML="&#8377;"+bagNumber*price;

}

    $scope.getPrice = function(key,type){
var shopContext = 'Agent';
if(window.localStorage.isAgent=='true')
shopContext = 'Agent';
else
shopContext = 'Outlet';
var arrayName = type + 'PriceArray';

var price = 'N/A';
var obj = JSON.parse(window.localStorage[arrayName]);
if(obj && obj[key] && obj[key][shopContext])
price = obj[key][shopContext];

return price;
}

    $scope.getImageUrl = loginCred.getImageUrl;

    $scope.addToDelivery = function(key,value,index){
        var buttonElement = document.getElementById(key+"button"+index);
        if(buttonElement.innerHTML.toString().trim() == "ADD"){
        $scope.addToDeliveryArray(key,value,index);
        buttonElement.innerHTML = "REMOVE";
        }else{
        $scope.removeItemFromDeliverable(key,value);
        buttonElement.innerHTML = "ADD";
        }
    }
    $scope.checkoutOrder = function(){
        //window.sessionStorage.shopArray = JSON.stringify($scope.deliveryArray);
        var cartInfo = {};
        var arr = [];
        var grossPrice =0;
        var overAllPrice = 0;
        var overAllWeight = 0;

        for(var key in $scope.deliveryArray[$scope.selectedLorrySize]){
        var shopOrder = $scope.deliveryArray[$scope.selectedLorrySize][key] || [];
        var shopOrderLength = shopOrder.length;
        var totalShopPrice = 0;
        var totalWeight = 0;            var x = {"items":{}};


        for(var index = 0; index < shopOrderLength; index++){
        var shopOrderItem = shopOrder[index];
        var y = {};
        y["bags"] = shopOrderItem.bag;
        y["name"] = shopOrderItem.name;
        shopOrderItem.price = parseInt(shopOrderItem.price.toString().match(/[0-9]+/).toString());
        shopOrderItem.quantity = parseInt(shopOrderItem.quantity);
        y["price"] = shopOrderItem.price;
        y["weight"] = shopOrderItem.quantity;
        x.items[shopOrderItem.itemType] = x.items[shopOrderItem.itemType] || {};
        var t = shopOrderItem.itemType;
        //var b = x.items[t];
        var pid = shopOrderItem.productId;
        x.items[t][pid] = y;
        totalShopPrice += shopOrderItem.price;
        totalWeight += shopOrderItem.quantity;
        }
        x["address"] = shopInfo[key].address;
        x["name"] = shopInfo[key].name;
        x["totalShopPrice"] = totalShopPrice;
        x["totalWeight"] = totalWeight;
        overAllPrice += totalShopPrice;
        overAllWeight += totalWeight;
        arr.push(x);
        }
        cartInfo["grossPrice"] = cartInfo["totalPrice"] = overAllPrice;
        cartInfo["totalWeight"] = overAllWeight;
        cartInfo["shopDetail"] = arr;
        console.log(cartInfo);
        window.localStorage.cartInfo = JSON.stringify(cartInfo);
        window.location.hash = "#/app/summary";
    }

})

.controller('orderCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout) {
    var usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );
    usersRef.once('value', function(data){
        console.log(data.val());
        $scope.ordersArray = data.val().orders;
        $scope.$apply();
    })
})
        