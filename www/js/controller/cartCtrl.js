app.controller('cartCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope) {
  if(window.localStorage.isActive === 'false') {
    alert("User not activated. Please contact administrator");
    return;
  }
  var userInfo = JSON.parse(window.localStorage.userInfo);
  var dbRef = loginCred.dbRef;
  var itemJSON = loginCred.config.products;
  var ordersRef =  dbRef.child('orders');
  $scope.getImageUrl = loginCred.getImageUrl;
  var shopInfo = {};
  if(window.localStorage.shopInfo)
    shopInfo = JSON.parse(window.localStorage.shopInfo);
  $scope.deliveryArray = {};
  $scope.selectedLorrySizeInQuintals=100;
  var progressBarElement = document.getElementById("progressBar");
  var totalQuantity = $scope.totalQuantity = 0;
  var earlySelectedLorry;
  $scope.deliveryArray = [];
  $scope.lorryArray = [3,5,7,10,17,21,25];
  if(window.localStorage.lorryArray){
    var lorryArray2 = JSON.parse(window.localStorage.lorryArray) || [];
    for(var index = 0; index < lorryArray2.length; index++){
      lorryArray2[index] = parseInt(lorryArray2[index]);
    }
    $scope.lorryArray   = lorryArray2.sort(function(a,b){
      return a-b;
    });
  }
  if(!$scope.lorryArray || ($scope.lorryArray.length == 0))
    $scope.lorryArray = [3,5,7,10,17,21,25];

  var selectedLorrySize = $scope.selectedLorrySize = $scope.lorryArray[$scope.lorryArray.length - 1];

  var myPopUp = loginCred.showPopup;

  $scope.init = function(){
    var temp = [];
    if(window.localStorage.cartArray)
      temp = JSON.parse(window.localStorage.cartArray);

    $scope.cartArray = temp || [];

    var subAgentOrdersRef = loginCred.dbRef.child('users/'+ window.localStorage.uid + '/suborders');
    subAgentOrdersRef.on('value', function(data){
      $scope.suborders= data.val();
      if(!$scope.$$phase)
        $scope.$apply();
    });

    $timeout(function () {
      showInitialPrice();
    },1);
    $rootScope.$broadcast("cached",{});


  };

  $scope.getName = function(key){
    var str = key.split(";");
    return str[0] ;
  };

  $scope.getShopNameFromName = function(key){
    var str = key.split(";");
    return str[1];
  };

  $scope.viewSubAgentOrder = function(subAgentMobileNum, orderId){

    $ionicPopup.show({
      template: '<div id="OrderEye" style="margin-left: -15px;margin-right:-15px">'+
      ' <div class="card" id="viewDetailedOrder">'+
      '<div class="padding col" ng-repeat="shop in shopArrayOrderDetail" style="width: 108%">'+
      '<h4 style="margin-left:10px">{{shop.name}}</h4>'+
      ' <hr style="margin-left:10px">' +
      '<div ng-repeat="(key,item) in shop.items" >' +
      ' <div ng-repeat="(k,v) in item" >' +
      '<div class="card" style="width:92%;">' +
      '<div class="row">'+
      ' <p style="width: 100%;">'+
      '    <span><b>Item Name</b></span>'+
      '   <span style="float:right;">{{v.name}}</span>'+
      ' </p>'+
      ' </div>'+
      ' <div class="row">'+
      '<p style="width: 100%;">'+
      '<span><b>Weight in Quintals</b></span>'+
      '<span style="float:right;">{{v.weight}}</span>'+
      ' </p>'+
      ' </div>'+
      '  <div class="row">'+
      ' <p style="width: 100%;">'+
      '    <span><b>Quintal Price</b></span>'+
      ' <span style="float:right;">&#8377;{{v.quintalWeightPrice}}</span>'+
      '   </p>'+
      '  </div>'+
      ' <div class="row">'+
      '    <p style="width: 100%;">'+
      '      <span><b>Price After Discount</b></span>'+
      '   <span style="float:right;">&#8377;{{v.discountedQuintalPrice}}</span>'+
      ' </p>'+
      ' </div>'+
      ' <div class="row">'+
      '   <p style="width: 100%;">'+
      '    <span>'+
      '          <b>Price</b>'+
      '      <span style="float:right;">&#8377;{{v.price}}</span>'+
      '   </span>'+
      ' </p>'+
      ' </div>'+
      ' </div>'+
      ' </div>'+
      ' </div>'+
      '   <div class="row" style="width: 92%;color:green;">'+
      '      <p style="width: 100%;">'+
      '                <span>'+
      '                   <b>Total</b>'+
      '                  <span style="float:right;">&#8377;{{shop.totalShopPrice}}</span>'+
      '             </span>'+
      ' </p>'+
      ' </div>'+
      '<div class="row" style="width: 92%;color:green;">'+
      '   <p style="width: 100%;">'+
      '             <span>'+
      '                <b>Discount</b>'+
      '               <span style="float:right;">&#8377;{{shop.shopDiscountAmount}}</span>'+
      '          </span>'+
      '</p>'+
      '</div>'+
      '<div class="row" style="width: 92%;color:green;">'+
      '   <p style="width: 100%;">'+
      '             <span>'+
      '                <b>Amount Payable:</b>'+
      '               <span style="float:right;">&#8377;{{shop.shopGrossAmount}}</span>'+
      '          </span>'+
      '</p>'+
      '</div>'+
      ' <hr style="border-top: 1px dotted">'+
      '<br>'+
      ' </div>'+
      '</div>'+
      '<div class="row" style="padding-left:2%;width: 96%;">'+
      '   <p style="width: 100%;">'+
      '                          <span>'+
      '                             <b>TOTAL PRICE</b>'+
      '                            <span style="float:right;" id="gross_price">&#8377;{{cartArrayOrderDetail.grossPrice}}</span>'+
      '                       </span>'+
      '</p>'+
      '</div>'+
      '<div class="row" style="padding-left:2%;width: 96%;">'+
      '   <p style="width: 100%;">'+
      '                          <span>'+
      '                             <b>Discount</b>'+
      '                            <span id="discount_amount" style="float:right;" id="discount_amount">&#8377;{{cartArrayOrderDetail.discount_amount}}</span>'+
      '                       </span>'+
      '</p>'+
      '</div>'+
      '<div class="row" style="padding-left:2%;width: 96%;">'+
      '   <p style="width: 100%;">'+
      '                          <span>'+
      '                             <b>GRAND TOTAL</b>'+
      '                            <span id="grand_total" style="float:right;">&#8377;{{cartArrayOrderDetail.totalPrice}}</span>'+
      '                       </span>'+
      '</p>'+
      '</div>  ' +
      '</div>',
      title: 'Order Summary',
      scope: $scope,
      buttons: [
        {
          text: '<b>Done</b>',
          type: 'button-positive',
          onTap: function(e) { return true; }
        },
      ]
    }).then(function(res) {
      console.log('Tapped!', res);
    }, function(err) {
      console.log('Err:', err);
    }, function(msg) {
      console.log('message:', msg);
    });
    var subAgentOrdersRef = loginCred.dbRef.child('orders/'+orderId);
    subAgentOrdersRef.once('value', function(data){
      if(!data.val())
        return;
      $scope.cartArrayOrderDetail = data.val().cart;
      $scope.shopArrayOrderDetail = $scope.cartArrayOrderDetail.shopDetail;

      for (var index in $scope.shopArrayOrderDetail){
        var shop = $scope.shopArrayOrderDetail[index];
        for(var item in shop.items){
          var itemObj = shop.items[item];
          for( var product in itemObj){
            var productObj = itemObj[product];
            productObj['quintalWeightPrice'] = loginCred.toCommaFormat(productObj['quintalWeightPrice']);
            productObj['discountedQuintalPrice'] = loginCred.toCommaFormat(productObj['discountedQuintalPrice']);
            productObj['price'] = loginCred.toCommaFormat(productObj['price']);

          }
        }
        shop['shopGrossAmount'] = loginCred.toCommaFormat(shop['totalShopPrice'] - shop['shopDiscountAmount']);
        shop['shopDiscountAmount'] = loginCred.toCommaFormat(shop['shopDiscountAmount']);
        shop['totalShopPrice'] = loginCred.toCommaFormat(shop['totalShopPrice']);
      }
      $scope.cartArrayOrderDetail['grossPrice'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['grossPrice']);
      $scope.cartArrayOrderDetail['discount_amount'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['discount_amount']);
      $scope.cartArrayOrderDetail['totalPrice'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['totalPrice']);
      $scope.$apply();
    });


  }


  $scope.acceptOrder = function(subAgentMobileNum,orderId){

    var myPopup = $ionicPopup.show({
      template: 'Are you sure you want to accept the order ?',
      title: 'Accept Order ?',
      scope: $scope,
      buttons: [
        { text: 'No' }, {
          text: '<b>Yes</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.moveSubAgentOrderToCart(subAgentMobileNum,orderId);
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });


  }


  $scope.moveSubAgentOrderToCart = function(subAgentMobileNum,orderId){

    var priceListRef=loginCred.dbRef.child('priceList/');
    priceListRef.once('value', function(data){
      var priceList=data.val();

      var ordersRef = loginCred.dbRef.child('orders/'+ orderId);
      ordersRef.once('value', function(order){
        var shopDetailArray = order.val().cart.shopDetail;var i=0;
        shopDetailArray.forEach(function(eachShop){
            i++;
            var tin= eachShop.tin;var areaId=eachShop.areaId;
            fetchPriceForEachShop(areaId,tin,eachShop,priceList);

          }
        );
        if(shopDetailArray.length==i){
          $scope.$apply();

          var subAgentOrdersRef = loginCred.dbRef.child('users/'+ window.localStorage.uid +
            '/suborders/'+subAgentMobileNum + '/' +orderId);
          subAgentOrdersRef.remove();

        }


      });
    });

  };

  var fetchPriceForEachShop = function(areaId,tin,eachShop,priceList){

    var prices = priceList[areaId];
    if(prices == null)
      return;

    for(var item in itemJSON){
        $scope[item + "PriceArray"] = prices[item];
    }

    var existingPriceArray = {};
    if(window.localStorage.priceArray)
      var existingPriceArray = JSON.parse(window.localStorage.priceArray);

    var json = {};
    for(var item in itemJSON) {
        json[item] = prices[item];
    }
    existingPriceArray[tin]= json;
    window.localStorage.priceArray = JSON.stringify(existingPriceArray);

    updateBlaBla(tin,eachShop, prices);
    window.localStorage.cartArray=JSON.stringify($scope.cartArray);
    $timeout(function () {
      showInitialPrice();
    },1);

  }

  var updateBlaBla = function(tin,eachShop,prices){
    var shopInfo=JSON.parse(window.localStorage.shopInfo);
    var x ={};
    x["address"] = eachShop.address;
    x["name"] = eachShop.name;
    x["tin"] = eachShop.tin;
    x["proprietorName"] = eachShop.proprietor_name;
    x["areaId"] = eachShop.areaId;
    x["mobile"] = eachShop.mobile;
    shopInfo[tin] = x;
    window.localStorage.shopInfo = JSON.stringify(shopInfo);
    $scope.cartArray[tin]=[];

    var itemsInEachShop = eachShop.items;
    for(var item in itemJSON) {
        var Items = itemsInEachShop[item];
        for(var productId in Items){
            var productObject = Items[productId];
            var ob = {};
            ob.itemType = "rice";
            ob.bag = productObject.bags;
            ob.master_weight = Number(productObject.weight)*100/Number(productObject.bags)+'KG';
            ob.name=productObject.name;
            ob.price=productObject.price;
            ob.productId=productId;
            ob.quantity=productObject.weight;
            var existingObjects = $scope.cartArray[tin] || [];var shopContext='Agent';

            if(prices['rice']!=null && prices['rice'][productId] != null &&  prices['rice'][productId][shopContext]!=null
              && prices['rice'][productId][shopContext].length != 0 )
              existingObjects.push(ob);
            else {
              var myPopup = $ionicPopup.show({
                template: 'Product ' + ob.name + 'is not available' ,
                title: 'Out of stock !!',
                scope: $scope,
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-positive',
                    onTap: function(e) {

                    }
                  }
                ]
              });
              myPopup.then(function(res) {
                console.log('Tapped!', res);
              });
            }

            $scope.cartArray[tin] = existingObjects;
      }
    }
    if( $scope.cartArray[tin].length === 0)
      delete $scope.cartArray[tin]

  }


  $scope.deleteSubAgentOrder = function(subAgentMobileNum, orderId){
    var myPopup = $ionicPopup.show({
      template: 'Are you sure you want to delete the order ?',
      title: 'Delete Order ?',
      scope: $scope,
      buttons: [
        { text: 'No' }, {
          text: '<b>Yes</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.deleteSubAgOrd(subAgentMobileNum,orderId);
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });

  }

  $scope.deleteSubAgOrd = function(subAgentMobileNum,orderId){
    var subAgentOrdersRef = loginCred.dbRef.child('users/'+ window.localStorage.uid +
      '/suborders/'+subAgentMobileNum + '/' +orderId);
    subAgentOrdersRef.remove();
  }

  var showInitialPrice = function () {
    for(var key in  $scope.cartArray){
      var length = $scope.cartArray[key].length;
      for(var index = 0; index < length; index++) {
        var pid = $scope.cartArray[key][index].productId;
        var itemType = $scope.cartArray[key][index].itemType
        var element = document.getElementById(key + "computedPrice" + pid);
        var qty = document.getElementById(key + "quantity" + pid).value;
        var price = $scope.getPrice(pid, itemType, key) * qty;
        element.innerHTML = '₹​' + loginCred.toCommaFormat(price);
      }
    }
  };

  $scope.setSelectedLorrySize = function(lorry){
    earlySelectedLorry = $scope.selectedLorrySize;
    $scope.selectedLorrySize = selectedLorrySize = lorry;
    $scope.selectedLorrySizeInQuintals=selectedLorrySize*10;
    computeWidth(totalQuantity);
  };

  var updateCart = loginCred.updateCart;

  $scope.removeFromCart = function(key,value){
    var cartArray = $scope.cartArray[key] || [];
    for(var index = 0; index < cartArray.length; index++){
      if(cartArray[index].productId == value.productId){
        cartArray.splice(index,1);
        $scope.cartArray[key] = cartArray;
        if($scope.cartArray[key].length == 0)
          delete $scope.cartArray[key];
        window.localStorage.cartArray = JSON.stringify($scope.cartArray);
        break;
      }
    }
    updateCart();
    $scope.removeItemFromDeliverable(key,value);
  }

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
        {   text: 'Cancel',
          onTap: function(e) {
            return;
          }

        }, {
          text: '<b>Done</b>',
          type: 'button-positive',
          onTap: function(e) {
            //console.log($scope.selectedLorrySize);
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
      // console.log('Tapped!', res);
    });
  };

  $scope.addToDeliveryArray = function(key,value,index){
    var x = {};
    //console.log(value);
    value.quantity = document.getElementById(key+"quantity"+value.productId).value;
    value.bag = document.getElementById(key+"bag"+value.productId).value;
    value.price = loginCred.toNumberFormat(document.getElementById(key+"computedPrice"+value.productId).innerText.trim());
    x[key] = value;
    var selectedLorrySize = $scope.selectedLorrySize;
    $scope.deliveryArray[key] = $scope.deliveryArray[key] || [];
    value["index"] = index;
    $scope.deliveryArray[key].push(value);
    totalQuantity += parseInt(value.quantity);
    computeWidth(totalQuantity);
  };

  function computeWidth(totalQuantity){
    var width = totalQuantity*10/selectedLorrySize;
    if(width > 100) {
      progressBarElement.style.backgroundColor = "red";
      width = 100;
    }
    else
      progressBarElement.style.backgroundColor = "green";
    progressBarElement.style.width = width.toString() + "%";
    $scope.totalQuantity = totalQuantity;
  }

  $scope.removeItemFromDeliverable = function(key,value,index){
    var x = {};
    x[key] = value;
    if(!$scope.deliveryArray[key])
      return;
    var lengthOfArray = $scope.deliveryArray[key].length;
    for(var index = 0; index <  lengthOfArray; index++){
      if($scope.deliveryArray[key][index].productId == value.productId){
        $scope.deliveryArray[key].splice(index,1);
        totalQuantity -= parseInt(value.quantity);
        if($scope.deliveryArray[key].length == 0)
          delete $scope.deliveryArray[key];
        break;
      }
    }
    computeWidth(totalQuantity);
  }

  $scope.addQuantity = function(key, value, index){
    var weight = value.master_weight.getWeight();
    var element = document.getElementById(key+"quantity"+value.productId);
    var initWeight = element.value;
    if(initWeight)
      initWeight = parseFloat(initWeight);
    element.value = initWeight + weight/100;
    $scope.textInQuantity(key,value);
  };

  $scope.minusQuantity = function(key, value, index){
    var weight = value.master_weight.getWeight();
    var element  = document.getElementById(key+"quantity" + value.productId);
    var initWeight = element.value;
    if(initWeight)
      initWeight = parseFloat(initWeight);
    var finalWeight = initWeight - weight/100;
    if(finalWeight < 0)
      return;
    element.value = finalWeight;
    $scope.textInQuantity(key,value);
  };
  $scope.addBag = function(key, value, index){
    element  = document.getElementById(key+"bag" + value.productId);
    element.value = ++element.value;
    $scope.textInBag(key,value,index);
  }
  $scope.minusBag = function(key, value, index){
    var element;
    element  = document.getElementById(key+"bag" + value.productId);
    if(!(element.value < 1)){
      element.value = --element.value;
      $scope.textInBag(key,value,index);
    }
  }

  $scope.textInBag = function(key,value,index){
    var weight =  value.master_weight;
    var bagElement;
    bagElement = document.getElementById(key+"bag"+value.productId);
    var bagNumber = parseInt(bagElement.value);
    document.getElementById(key+"quantity"+value.productId).value = (bagNumber * weight.getWeight())/100 ;
    $scope.computePrice(key,value.productId,index,value.itemType);
  };

  $scope.textInQuantity = function(key,value,index){
    var quantityElement = document.getElementById(key+"quantity"+value.productId);
    var weight = value.master_weight;
    quantityElement = document.getElementById(key+"quantity"+value.productId);
    var quantity = Number(quantityElement.value);
    var bag;
    bag = document.getElementById(key+"bag"+value.productId);
    weight = weight.getWeight();//Number(weight.substring(0,weight.length - 2));
    bag.value =  quantity*100/weight;
    $scope.computePrice(key,value.productId,index,value.itemType);
  };
  $scope.computePrice = function(key,productId,index,type) {
    var qtyElement = document.getElementById(key+"quantity"+productId);
    var price = $scope.getPrice(productId,type,key);
    var quantity =  Number(qtyElement.value);
    document.getElementById(key+"computedPrice"+productId).innerHTML="&#8377;"+loginCred.toCommaFormat(quantity*price);
  }

  $scope.getPrice = function(key,type,tin){
    var shopContext = 'Agent';
    if(window.localStorage.isAgent=='true')
      shopContext = 'Agent';
    else
      shopContext = 'Outlet';


    var priceArray = window.localStorage.priceArray ? JSON.parse(window.localStorage.priceArray) : {};
    var price = 'N/A';
    if(!priceArray[tin])
      return;
    var obj = priceArray[tin][type];
    if(obj && obj[key] && obj[key][shopContext])
      price = obj[key][shopContext];


    return price;
  };

  $scope.getImageUrl = loginCred.getImageUrl;

  $scope.addToDelivery = function(key,value,index){
    var buttonElement = document.getElementById(key+"button"+value.productId);
    if(buttonElement.innerHTML.toString().trim() == "ADD"){
      $scope.addToDeliveryArray(key,value,index);
      buttonElement.innerHTML = "REMOVE";
      buttonElement.style.backgroundColor ="#ff9f00";
      buttonElement.style.marginLeft = null;
    }else{
      $scope.removeItemFromDeliverable(key,value);
      buttonElement.innerHTML = "ADD";
      buttonElement.style.backgroundColor ="#fb641b";
      buttonElement.style.marginLeft = "10px";
    }
  }
  $scope.checkoutOrder = function(){
    //window.localStorage.shopArray = JSON.stringify($scope.deliveryArray);

    if(!Object.keys($scope.deliveryArray).length){
      myPopUp("Lorry is empty. Please add items to lorry","Message");
      return;
    }

    if($scope.totalQuantity > $scope.selectedLorrySize*10){

      lorryOverloadedPopup();

    }else{
      massageDataToSummaryCtrl();
    }
  }

  var lorryOverloadedPopup = function(){
    var myPopup   = $ionicPopup.show({
      template:
        '<p>Lorry overloaded!!. Do you want to continue ?</p>',
      title: 'Confirmation',
      scope: $scope,
      buttons: [
        {   text: 'No',
        }, {
          text: '<b>Yes</b>',
          type: 'button-positive',
          onTap: function(e) {
            massageDataToSummaryCtrl();
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  }

  var massageDataToSummaryCtrl=  function () {
    var cartInfo = {};
    var shopInfo=JSON.parse(window.localStorage.shopInfo);
    var arr = [];
    var grossPrice =0;
    var overAllPrice = 0;
    var overAllWeight = 0;
    for(var key in $scope.deliveryArray){
      var shopOrder = $scope.deliveryArray[key] || [];
      var shopOrderLength = shopOrder.length;
      var totalShopPrice = 0;
      var totalWeight = 0;
      var x = {"items":{}};
      for(var index = 0; index < shopOrderLength; index++){
        var shopOrderItem = shopOrder[index];
        var y = {};
        y["bags"] = shopOrderItem.bag;
        y["name"] = shopOrderItem.name;
        shopOrderItem.price = parseInt(shopOrderItem.price.toString().match(/[0-9]+/).toString());
        shopOrderItem.quantity = shopOrderItem.quantity;
        y["price"] = shopOrderItem.price;
        y["weight"] = Number(shopOrderItem.quantity);
        y["masterWeightPrice"] = Math.round((shopOrderItem.price/parseInt(shopOrderItem.bag)) * 100) / 100;
        y["quintalWeightPrice"] = Math.round(Math.round((shopOrderItem.price/Number(shopOrderItem.quantity))*100)/100);
        x.items[shopOrderItem.itemType] = x.items[shopOrderItem.itemType] || {};
        var t = shopOrderItem.itemType;
        //var b = x.items[t];
        var pid = shopOrderItem.productId;
        x.items[t][pid] = y;
        totalShopPrice += shopOrderItem.price;
        totalWeight += Number(shopOrderItem.quantity);
      }
      x["address"] = shopInfo[key].address;
      x["name"] = shopInfo[key].name;
      x["tin"] = key;
      x["proprietorName"] = shopInfo[key].proprietor_name;
      x["areaId"] = shopInfo[key].areaId;
      x["city"] = shopInfo[key].city;
      x["district"] = shopInfo[key].district;
      x["areaName"] = shopInfo[key].areaName;
      x["totalShopPrice"] = Math.round(totalShopPrice*100) / 100;
      x["totalWeight"] = Number(totalWeight);
      x["mobile"] = shopInfo[key].mobile;
      overAllPrice += totalShopPrice;
      overAllWeight += totalWeight;
      arr.push(x);
    }
    cartInfo["grossPrice"] = cartInfo["totalPrice"] = overAllPrice;
    cartInfo["totalWeight"] = overAllWeight;
    cartInfo["shopDetail"] = arr;
    cartInfo["selectedLorrySize"] = $scope.selectedLorrySize;
    //console.log(cartInfo);
    window.localStorage.cartInfo = JSON.stringify(cartInfo);
    window.location.hash = "#/app/summary";
  }

  $scope.getShopName = function(tin){
    var shopInfo=JSON.parse(window.localStorage.shopInfo);
    return shopInfo[tin] != null ? shopInfo[tin].name : '';
  }

})
