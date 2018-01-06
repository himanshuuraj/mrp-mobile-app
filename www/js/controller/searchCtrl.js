app.controller('searchCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$timeout,$interval,$rootScope) {
  if(window.localStorage.isActive === 'false') {
    alert("User not activated. Please contact administrator");
    return;
  }
  var itemJSON = loginCred.config.products;
  var smsURLRef = loginCred.dbRef.child('smsURL'); var smsURL = '';
  smsURLRef.once('value', function(data) {
    window.localStorage.smsURL = data.val();
  });
  var earlySelectedTab = "rice";
  var uid = window.localStorage.uid;
  var existingShops;
  var dbRef = loginCred.dbRef;
  $scope.shopDetail = {name : "",tin : ""};
  $scope.cartArray = {};
  if(window.localStorage.cartArray)
    $scope.cartArray = JSON.parse(window.localStorage.cartArray);
  $scope.tabArray = [];
  for(var item in itemJSON)
    $scope.tabArray.push(item);
  $scope.isAgent = window.localStorage.isAgent;
  if(window.localStorage.isAgent == "true")
    $scope.isAgent = true;
  else
    $scope.isAgent = false;
  var shopInfo = {}; var userInfo= JSON.parse(window.localStorage.userInfo);
  if(window.localStorage.shopInfo)
    shopInfo = JSON.parse(window.localStorage.shopInfo);
  $scope.selectedItem = $scope.tabArray[0];

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

  $scope.showDiv = function(key){
    var element = document.getElementById(key+"animate");
    element.className = "widthFull animatewidthfull";
  };

  $scope.favouriteObject = [];

  $scope.showFavouriteFlag = 'item';

  $scope.displayProduct = function(value) {
    return (value.available == 'true');
  }

  $scope.getFlag = function(key){
    if($scope.showFavouriteFlag == 'item')
      return true;
    else{
      return $scope.favouriteObject.includes(key);
    }
  }

  $scope.favouriteObject = [];
  if(window.localStorage.favouriteObject)
    $scope.favouriteObject = JSON.parse(window.localStorage.favouriteObject);

  $scope.addToFavourite = function(key,value){
    if(!$scope.favouriteObject.includes(key)) {
      $scope.favouriteObject.push(key);
      window.localStorage.favouriteObject = JSON.stringify($scope.favouriteObject);
      return 1;
    }
    return 0;
  };

  $scope.showSelectShop = function(){
    if($scope.isAgent)
      return true;
    if(userInfo.shops.length > 1)
      return true;
    return false;
  }

  var updateFavourites = function(){
    $scope.favouriteObject = $scope.favouriteObject || [];
    var totalItemInFavouries = $scope.favouriteObject.length;
    if(totalItemInFavouries > 0){
      var favouriteElement = document.getElementById("addToFavouriteLogo");
      favouriteElement.style.color = "red";
    }else{
      var favouriteElement = document.getElementById("addToFavouriteLogo");
      favouriteElement.style.color = "white";
    }
  }

  $scope.removeFromFavourite = function(key,value){
    var index = $scope.favouriteObject.indexOf(key);
    if(index != -1)
      $scope.favouriteObject.splice(index,1);
    window.localStorage.favouriteObject = JSON.stringify($scope.favouriteObject);
  };

  $scope.showFavouriteItems = function(){
    ($scope.showFavouriteFlag == 'item') ? $scope.showFavouriteFlag = 'favourite' : $scope.showFavouriteFlag = 'item';

  };

  $scope.toggleFavourite = function(key){
    if(!$scope.addToFavourite(key))
      $scope.removeFromFavourite(key);
    updateFavourites();
  };

  $scope.removeDiv = function(key){
    var element = document.getElementById(key+"animate");
    element.className = "widthZero animatewidthzero";
  };

  var flagOfAlreadyPresentPrice = false;
  if(window.sessionStorage.flagOfAlreadyPresentPrice == "true") {
    flagOfAlreadyPresentPrice = true;
    var priceArray = window.localStorage.priceArray ? JSON.parse(window.localStorage.priceArray) : {};
    priceArray = priceArray[window.localStorage.tin];
    for(var item in itemJSON){
      $scope[item + "PriceArray"] = priceArray[item];
    }
  }
  var slideIndex = 0;

  $scope.slideImages = function() {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    if(!slides || slides.length == 0)
      return;
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex> slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    setTimeout($scope.slideImages, 5000);

  }


  $scope.init = function(){
    $scope.slideImages();

    $scope.getItemsPrice();
    if(window.localStorage.shopName){
      $scope.shopDetail = {name : window.localStorage.shopName,tin : window.localStorage.tin
      };
    }
    if(window.localStorage.cartArray){
      $scope.cartArray = JSON.parse(window.localStorage.cartArray);
      $timeout(function(){updateUI();
      },100);
    }
    $timeout(function(){
      document.getElementById("ricetab").className = "button btnSelected";
    },100);
    $rootScope.$broadcast("cached",{});
    updateFavourites();
  };

  $scope.showShopPopUp = function() {
    var myPopup = $ionicPopup.show({
      template: '<div class="list">'+
      '<label class="item item-input">'+
      '<input type="text" id="searchElement" ng-model = "shopSearchElement.name" placeholder="Select a shop"/>'+
      '</label></div><ion-list> ' +
      '<ion-radio ng-repeat="shop in shopArray | filter:filterSearchedArray" ng-value="shop" ng-click="setSearchedShop(shop)" style="font-size:20px;">'+
      '{{shop.name}}<br><span class="mobileFont">{{shop.mobile}}</span></ion-radio>'+
      ' </ion-list>',
      title: 'Choose Shop',
      scope: $scope,
      buttons: [
        { text: 'Cancel',
          onTap: function(e) {
            if (!$scope.shopDetail.name) {
              e.preventDefault();
            }
          }
        }, {
          text: '<b>Done</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.shopDetail.name) {
              e.preventDefault();
            } else {
              return $scope.shopDetail;
            }
          }
        }
      ]
    });
    myPopup.then(function(res) {
      //console.log('Tapped!', res);
    });
  };

  if(!$scope.isAgent && userInfo && userInfo.shops && userInfo.shops.length == 0){
    window.localStorage.shopName = $scope.shopDetail.name = userInfo.shops[0].name;
    window.localStorage.tin = $scope.shopDetail.tin = userInfo.shops[0].tin;
    $scope.cartArray[$scope.shopDetail.tin] = [];
  }
  else{

    $scope.shopArray = userInfo.shops || [];
    if(userInfo.superAgentMobileNum && !window.localStorage.tin) {
      var shopsRef = dbRef.child('users/'+userInfo.superAgentMobileNum + '/shops');
      shopsRef.once('value', function(snap) {
        var superAgentShops = snap.val();
        var superAgentShops = snap.val(); var allowedAreas=userInfo.allowedAreas || [];
        var filteredShops=[];
        for (var i=0;i<superAgentShops.length;i++){
          if(allowedAreas.indexOf(superAgentShops[i]['areaId']) >=0)
            filteredShops.push(superAgentShops[i]);
        }
        $scope.shopArray = filteredShops;
        $scope.showShopPopUp();
      })
    }else if(!window.localStorage.tin)
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

  $rootScope.$on("continue",function(){
    $scope.proceedToSaveInCart();
  });

  String.prototype.getWeight = function(){
    var x = this.toString();
    return parseInt(x.substring(0,x.length-2));
  }

  $scope.changeContent = function(type){
    earlySelectedTab = $scope.selectedItem;
    $scope.selectedItem = type;
    document.getElementById(type+"tab").className = "button btnSelected";
    document.getElementById(earlySelectedTab+"tab").className = "button";
    addUI();
  };

  var addToCartNumber;
  $scope.addToCart = function(key,value){
    var tickElement = document.getElementById(key+"button");
    if(tickElement.getAttribute("status") == "add")
    {
      var x = {};
      var quantityElement = document.getElementById(key+"quantity");
      var bagElement = document.getElementById(key+"bag");
      var quantity = quantityElement.value;
      var bag = bagElement.value;
      var priceElement = document.getElementById(key+"computedPrice");
      var price = priceElement.innerText;
      price = loginCred.toNumberFormat(price);
      if(!bag && !quantity){
        alert("Please insert bag or quantity");
        return;
      }
      if(!price)
      {
        alert("Price of this item is not available");
        return;
      }
      price = price.toString().match(/[0-9]+/);
      if(!price || !price[0])
      {
        alert("Price not correct");
        return;
      }
      price = price.toString();

      tickElement.className='button icon ion-checkmark-round';
      tickElement.style.backgroundColor="#388e3c";
      x["master_weight"] = value.master_weight;
      x["name"] = value.name;
      x["productId"] = key;
      x["itemType"] = $scope.selectedItem;
      x["quantity"] = quantity;
      x["bag"] = bag;
      x["price"] = parseInt(price);
      var flagOfDuplicate = 0;
      $scope.cartArray[$scope.shopDetail.tin] = $scope.cartArray[$scope.shopDetail.tin] || [];
      var length = $scope.cartArray[$scope.shopDetail.tin].length;
      for(var index = 0;index < length; index++){
        if($scope.cartArray[$scope.shopDetail.tin][index].productId == key){
          $scope.cartArray[$scope.shopDetail.tin].splice(index,1);
          break;
        }
      }
      $scope.cartArray[$scope.shopDetail.tin].push(x);
      doAnimation(key);
      tickElement.setAttribute("status","remove");
      window.localStorage.cartArray = JSON.stringify($scope.cartArray);
    }else{
      tickElement.className='button icon ion-plus-round';
      tickElement.style.backgroundColor="#fff";
      $scope.cartArray[$scope.shopDetail.tin] = $scope.cartArray[$scope.shopDetail.tin] || [];
      var length = $scope.cartArray[$scope.shopDetail.tin].length;
      for(var index = 0; index<length; index++){
        if($scope.cartArray[$scope.shopDetail.tin][index].productId == key){
          $scope.cartArray[$scope.shopDetail.tin].splice(index,1);
          break;
        }
      }
      window.localStorage.cartArray = JSON.stringify($scope.cartArray);
      tickElement.setAttribute("status","add");
      updateCart();
    }
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
  var addToCartElement;
  function initializeAddToCartElement() {
    addToCartElement = document.getElementById("addToCartLogo");
  }
  function doAnimation(key){
    initializeAddToCartElement();
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
      "z-index:999;height:"+coord.height+"px;width:"+coord.width+"px;";
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
        if(!addToCartElement)
          initializeAddToCartElement();
        addToCartElement.className += " shakeAnimation";
        updateCart();
      }
    },20);
  }

  $scope.proceedToSaveInCart = function(){
    var x = {};
    angular.forEach($scope.cartArray[$scope.shopDetail.tin],function(item,index){
      x[index] = item;
    });
    window.localStorage.cartArray = JSON.stringify($scope.cartArray);
    window.location.hash = "#/app/cart";
  };

  $scope.getImageUrl = loginCred.getImageUrl;

  $scope.getProductItems = function(){
    var productsRef = dbRef.child('products');
    productsRef.on('value' , function(productSnapshot){
      var productsList = productSnapshot.val();

      for(var item in itemJSON) {
          $scope[item+"Object"] = productsList[item];
          var priorityArray = [];
          for(var productId in $scope[item + "Object"]) {
            var prty = $scope[item + "Object"][productId]['priority'] || 0;
            priorityArray.push({
              'key': productId,
              'value' : prty
            });
          }
          priorityArray.sort(function(a,b){
            return a.value - b.value;
          });

          priorityArray.forEach(function(entry){
            var ob={};
            ob[entry.key] = $scope[item + "Object"][entry.key];
            if(!$scope[item+"Array"])
              $scope[item+"Array"] = [];
            $scope[item+"Array"].push(ob);
          })
          window.localStorage[item+"ItemsPriorityArray"] = JSON.stringify(priorityArray);
      }

      if(!$scope.$$phase) {
        $scope.$apply();
      }

    });

  };

  $scope.getPrice = function(key){
    var type=$scope.selectedItem;
    var shopContext = 'Agent';
    if(window.localStorage.isAgent=='true')
      shopContext = 'Agent';
    else
      shopContext = 'Outlet';

    var priceArray = window.localStorage.priceArray ? JSON.parse(window.localStorage.priceArray) : {};
    var price = 'N/A';
    if(!priceArray[window.localStorage.tin])
      return;
    var obj = priceArray[window.localStorage.tin][type];
    if(obj && obj[key] && obj[key][shopContext])
      price = obj[key][shopContext];

    if(price == 'N/A' || price == '0'){
      document.getElementById(key+"card").style.display = "none";
      /*if(x)
          x.style.display = "none";*/
    }else{
      document.getElementById(key+"card").style.display = "";
      /*if(x)
          x.style.display = "";*/
    }
    return price;

  }

  $scope.computePrice = function(key,index) {
    var qtyElement = document.getElementById(key+"quantity");
    var price= $scope.getPrice(key);
    price= Number(loginCred.toNumberFormat(price));
    var qtyNumber =  Number(qtyElement.value);
    var compPriceElement = document.getElementById(key+"computedPrice");
    if(qtyNumber == 0)
      compPriceElement.innerHTML="&#8377; 0";
    else
      compPriceElement.innerHTML = loginCred.toCommaFormat(qtyNumber*price);
  }

  var earlySelectedShop = {};

  $scope.getItemsPrice = function(){
    var areaId = window.localStorage.areaId;
    if(!areaId)
      return;
    var areaRef = dbRef.child('priceList/'+ areaId);
    areaRef.on('value',function(areaSnapshot){
      var productsList = areaSnapshot.val();
      for(var item in itemJSON){
        $scope[item + "PriceArray"] = productsList[item];
      }
      var tin  = window.localStorage.tin;
      if(!tin)
        return;
      var x= window.localStorage.priceArray ? JSON.parse(window.localStorage.priceArray) : {};
      var json = {};
      for(var item in itemJSON)
          json[item] = productsList[item];
      x[tin] = json;
      window.localStorage.priceArray = JSON.stringify(x);
      flagOfAlreadyPresentPrice = true;
      window.sessionStorage.flagOfAlreadyPresentPrice = true;
      $scope.getProductItems();
    });

  };

  $scope.getSelectedItemArray = function(){
    $scope.selectedItem = $scope.selectedItem || "rice";
    return $scope[$scope.selectedItem+"Array"] || [];
  }

  $scope.lorryArray = [];
  if(window.localStorage.lorryArray){
    $scope.lorryArray = JSON.parse(window.localStorage.lorryArray) || [];
  }
  $scope.setSearchedShop = function(shop){
    $scope.shop = shop;
    earlySelectedShop["tin"] = $scope.shopDetail.tin;
    window.localStorage.shopName = $scope.shopDetail.name = shop.name;
    window.localStorage.areaId = $scope.shopDetail.areaId = shop.areaId
    window.localStorage.tin = $scope.shopDetail.tin = shop.tin;
    shopInfo[shop.tin] = shop;
    window.localStorage.shopInfo = JSON.stringify(shopInfo);
    $scope.getItemsPrice();
    $timeout(function(){updateUI();},0);
    var area = dbRef.child('areas/'+ shop.areaId);
    area.once('value').then(function(data){
      var lorry = data.val();
      lorry = lorry.lorries || [];
      var length = lorry.length;
      for(var index = 0;index < length;index++){
        if(!$scope.lorryArray.includes(lorry[index]))
          $scope.lorryArray.push(lorry[index]);
      }
      window.localStorage.lorryArray = JSON.stringify($scope.lorryArray.sort());
    }).catch(function(data){
      console.log(data);
      alert("Network Problem");
    });
    try{
      $timeout(function(){
        var x = document.getElementById($scope.selectedItem + "tab");
        if(x)
          x.className = "button btnSelected";
      },100);

    }catch(e){}
  };

  var deleteUI = function(){
    for(var i = 1; i < $scope.tabArray.length; i++){
      var element = document.getElementById($scope.tabArray[index]+'tab');
      if(element)
          element.className='button';
    }
    var tin = earlySelectedShop["tin"];
    var obj = $scope.cartArray[tin] || [];
    for(var index = 0; index < obj.length; index++){
      var productId = obj[index].productId;
      var quantityElement = document.getElementById(productId + "quantity");
      if(!quantityElement) continue;
      var bagElement = document.getElementById(productId + "bag");
      var buttonElement = document.getElementById(productId + "button");
      var computedElement = document.getElementById(productId + "computedPrice");
      quantityElement.value = "";
      bagElement.value = "";
      buttonElement.className='button icon ion-plus-round';
      buttonElement.style.backgroundColor = "white";
      buttonElement.setAttribute("status","add");
      if(computedElement)
        computedElement.innerHTML = "";
      var animateElement = document.getElementById(productId+"animate");
      animateElement.className = "widthZero animatewidthzero";
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
        buttonElement.className = 'button icon ion-checkmark-round';
        buttonElement.style.backgroundColor = "green";
        buttonElement.setAttribute("status","remove");
        var animateElement = document.getElementById(productId+"animate");
        animateElement.className = "widthZero";
        var computedElement = document.getElementById(arg.pId + "computedPrice");
        if(!computedElement.innerText)
          computedElement.innerHTML = obj[arg.index].price;
      }, 0,true,{pId:productId,index:index});
    }
  }

  var updateCart = loginCred.updateCart;

  var updateUI = function(){
    deleteUI();
    addUI();
    updateCart();
  }

  $scope.shopSearchElement = {
    name: ""
  };
  $scope.shopArray = $scope.shopArray || [];
  $scope.filterSearchedArray = function(shop){
    if($scope.shopSearchElement.name === "" || $scope.shopSearchElement.name === undefined)
      return true;
    return shop.name.toLowerCase().includes($scope.shopSearchElement.name.toLowerCase());
  }
})
