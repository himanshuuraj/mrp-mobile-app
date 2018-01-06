app.controller('summaryCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$rootScope,$ionicLoading) {
  var showPopUp = loginCred.showPopup;
  if(window.localStorage.isActive === 'false') {
    alert("User not activated. Please contact administrator");
    return;
  }
  $scope.init = function(){
    $scope.cartArray = JSON.parse(window.localStorage.cartInfo);
    $scope.shopArray=$scope.cartArray.shopDetail;

    $scope.applyDiscount();

    $rootScope.$broadcast("cached",{});
  };

  var updateCart = loginCred.updateCart;

  $scope.validateIfLatestPrice = function(dbRef){
    var shopArray = $scope.shopArray;
    $scope.flagForPriceModified=false;
    $scope.modifiedPriceList=[];

    shopArray.forEach(function(shop){
      (function(){
        var items = shop.items;
        var riceObject = items.rice;
        var ravvaObject = items.ravva;
        var brokenObject = items.broken;
        var areaId = shop.areaId;


        var areaRef = dbRef.child('priceList/'+ areaId);
        areaRef.once('value',function(areaSnapshot){
          var productsList = areaSnapshot.val();
          var brokenPriceArray = productsList.broken;
          var ravvaPriceArray = productsList.ravva;
          var ricePriceArray = productsList.rice;var userType="Outlet";
          if(window.localStorage.isAgent == "true"){
            userType="Agent";
          }
          for(var productId in riceObject){
            if(riceObject[productId].quintalWeightPrice != ricePriceArray[productId][userType]){
              $scope.flagForPriceModified=true;
              var a= {
                productId : productId,
                newPrice : ricePriceArray[productId][userType],
                oldPrice : riceObject[productId].quintalWeightPrice
              }
              $scope.modifiedPriceList.push(a);
              riceObject[productId].quintalWeightPrice = ricePriceArray[productId][userType];

            }

          }

          for(var productId in ravvaObject){
            if(ravvaObject[productId].quintalWeightPrice != ravvaPriceArray[productId][userType]){
              $scope.flagForPriceModified=true;
              var a= {
                productId : productId,
                newPrice : ravvaPriceArray[productId][userType],
                oldPrice : riceObject[productId].quintalWeightPrice
              }
              $scope.modifiedPriceList.push(a);
              ravvaObject[productId].quintalWeightPrice = ravvaPriceArray[productId][userType];

            }

          }

          for(var productId in brokenObject){
            if(brokenObject[productId].quintalWeightPrice != brokenPriceArray[productId][userType]){
              $scope.flagForPriceModified=true;
              var a= {
                productId : productId,
                newPrice : brokenPriceArray[productId][userType],
                oldPrice : riceObject[productId].quintalWeightPrice
              }
              $scope.modifiedPriceList.push(a);
              brokenObject[productId].quintalWeightPrice = brokenPriceArray[productId][userType];

            }

          }

        });
      })();

    });

  };

  var calcDiscount = function() {

    // console.log('------------ entered discount');
    // console.log($scope.cartArray);
    $scope.totaldiscountedPrice = $scope.totaldiscountedPrice || 0 ;
    $scope.cartArray["discount_amount"] = $scope.totaldiscountedPrice;
    $scope.cartArray.totalPrice = $scope.cartArray.grossPrice - $scope.totaldiscountedPrice;

    //convert to comma separated
    $scope.shopArrayDup = JSON.parse(JSON.stringify($scope.cartArray.shopDetail)) ;
    for (var index in $scope.shopArrayDup){
      var shop = $scope.shopArrayDup[index];
      for(var item in shop.items){
        var itemObj = shop.items[item];
        for( var product in itemObj){
          var productObj = itemObj[product];
          //console.log(productObj);
          productObj['quintalWeightPrice'] = loginCred.toCommaFormat(productObj['quintalWeightPrice']);
          productObj['discountedQuintalPrice'] = loginCred.toCommaFormat(productObj['discountedQuintalPrice']);
          productObj['price'] = loginCred.toCommaFormat(productObj['price']);
          //console.log(productObj);

        }

      }
      shop['shopGrossAmount'] = loginCred.toCommaFormat(shop['totalShopPrice'] - shop['shopDiscountAmount']);
      shop['shopDiscountAmount'] = loginCred.toCommaFormat(shop['shopDiscountAmount']);
      shop['totalShopPrice'] = loginCred.toCommaFormat(shop['totalShopPrice']);
    }
    if(!$scope.$$phase) {
      $scope.$apply();
    }

    document.getElementById('discount_amount').innerHTML = "&#8377;"+loginCred.toCommaFormat($scope.totaldiscountedPrice);
    document.getElementById('gross_price').innerHTML = "&#8377;"+loginCred.toCommaFormat($scope.cartArray.grossPrice);
    document.getElementById('grand_total').innerHTML = "&#8377;"+loginCred.toCommaFormat($scope.cartArray.totalPrice);
    window.localStorage.cartInfo = JSON.stringify($scope.cartArray);
  };

  $scope.applyDiscount = function(){
    var shopArray = $scope.shopArray;
    $scope.totaldiscountedPrice = 0; var itemsProcessed = 0;
    shopArray.forEach(function(shop){
      var shopDiscountAmount = 0;

      var items = shop.items;
      var riceObjectOrg = items.rice;
      var ravvaObjectOrg = items.ravva;
      var brokenObjectOrg = items.broken;
      var shopRiceWeight = 0;var shopRavvaWeight = 0; var shopBrokenWeight= 0;
      for(var productId in riceObjectOrg){
        shopRiceWeight += riceObjectOrg[productId].weight;
      }
      for(var productId in ravvaObjectOrg){
        shopRavvaWeight += ravvaObjectOrg[productId].weight;
      }
      for(var productId in brokenObjectOrg){
        shopBrokenWeight += brokenObjectOrg[productId].weight;
      }
      var ricediscount=0, ravvadiscount=0,brokendiscount=0;

      var areasRef = loginCred.dbRef.child('areas/' + shop.areaId );
      var riceDiscArray = [];var ravvaDiscArray = []; var brokenDiscArray=[];
      (function() {

        var ravvaObject = ravvaObjectOrg ? JSON.parse(JSON.stringify(ravvaObjectOrg)) : {};
        var riceObject = riceObjectOrg ? JSON.parse(JSON.stringify(riceObjectOrg)): {};
        var brokenObject = brokenObjectOrg ? JSON.parse(JSON.stringify(brokenObjectOrg)): {};

        areasRef.once('value', function(data){

          itemsProcessed++;
          var discounts = data.val().discounts;
          //  console.log(discounts);
          if(discounts) {
            riceDiscArray = discounts.rice || riceDiscArray ;
            ravvaDiscArray = discounts.ravva ||  ravvaDiscArray;
            brokenDiscArray = discounts.broken || brokenDiscArray;
          }

          riceDiscArray.forEach(function(entry){
            if(shopRiceWeight >= entry.quintals){
              ricediscount = entry.discount;
            }
          });

          ravvaDiscArray.forEach(function(entry){
            if(shopRavvaWeight >= entry.quintals){
              ravvadiscount = entry.discount;
            }
          });

          brokenDiscArray.forEach(function(entry){
            if(shopBrokenWeight >= entry.quintals){
              brokendiscount = entry.discount;
            }
          });


          //simple and quick fix - dont calculate discounts for subagents
          var userInfo = JSON.parse(window.localStorage.userInfo);
          if(userInfo.superAgentMobileNum)
            ricediscount=0, ravvadiscount=0,brokendiscount=0


          for(var productId in riceObject){
            riceObject[productId]['discountedQuintalPrice']=  riceObject[productId].quintalWeightPrice - ricediscount;
            riceObject[productId]['price']= riceObject[productId].discountedQuintalPrice * riceObject[productId]['weight'];
            shopDiscountAmount += ricediscount*riceObject[productId]['weight'];
            $scope.totaldiscountedPrice += ricediscount*riceObject[productId]['weight']
          }
          for(var productId in ravvaObject){
            ravvaObject[productId]['discountedQuintalPrice']=  ravvaObject[productId].quintalWeightPrice - ravvadiscount;
            ravvaObject[productId]['price']= ravvaObject[productId].discountedQuintalPrice * ravvaObject[productId]['weight']
            shopDiscountAmount += ravvadiscount*ravvaObject[productId]['weight'];
            $scope.totaldiscountedPrice += ravvadiscount*ravvaObject[productId]['weight'];
          }

          for(var productId in brokenObject){
            brokenObject[productId]['discountedQuintalPrice']=  brokenObject[productId].quintalWeightPrice - brokendiscount;
            brokenObject[productId]['price']= brokenObject[productId].discountedQuintalPrice * brokenObject[productId]['weight']
            shopDiscountAmount += brokendiscount*brokenObject[productId]['weight'];
            $scope.totaldiscountedPrice += brokendiscount*brokenObject[productId]['weight'];
          }

          shop['items']['rice'] = riceObject;
          shop['items']['ravva'] = ravvaObject;
          shop['items']['broken'] = brokenObject;

          shop['shopDiscountAmount'] = shopDiscountAmount;
          shop['shopGrossAmount'] = shop['totalShopPrice'] - shopDiscountAmount;
          if(itemsProcessed == shopArray.length)
            calcDiscount();
        })
      }());


    });

  }



  $scope.submitOrder = function(){
    $ionicLoading.show();
    $scope.validateIfLatestPrice(loginCred.dbRef);
    if($scope.flagForPriceModified==true){
      //$scope.modifiedPriceList
      //   showPopUp("Prices for few items have changed from the time you saved in cart. <br> Please review the order before submitting.")
      //console.log($scope.modifiedPriceList);
      (function(){
        $ionicPopup.show({
          template: '<div class="row">'+
          '<div class="col">Item Name</div>'+
          '<div class="col-20">Old Price</div>'+
          '<div class="col-20">New Price</div>'+
          '</div>'+
          '<hr>'+
          '<div ng-repeat="item in modifiedPriceList" > ' +
          '<div class="row">'+
          '<div class="col">{{item.productId}}</div>'+
          '<div class="col-20">{{item.oldPrice}}</div>'+
          '<div class="col-20">{{item.newPrice}}</div>'+
          '</div>'+
          '</div>',
          title: 'INFO',
          scope: $scope,
          buttons: [
            {   text: 'OK',
              onTap: function(e) {
                $scope.applyDiscount();
                return;
              }

            }
          ]
        });
      })();
      return 0;
    }

    var userInfo = JSON.parse(window.localStorage.userInfo);
    var dbRef = loginCred.dbRef;
    var now = new Date();
    var monthsText=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    var year = now.getFullYear();
    var mathRandom = Math.floor((Math.random())*1000);
    var orderId= (now.getDate()).toString()  + monthsText[now.getMonth()] + (now.getFullYear()%100).toString() + '-'+
      userInfo.name.substring(0,3).toUpperCase() + userInfo.mobile.substring(0,3) +'-'+ mathRandom.toString();

    var cartArray = $scope.cartArray;
    var shopLength = cartArray.shopDetail.length;
    for(var index = 0; index < shopLength; index++)
      delete cartArray.shopDetail[index].$$hashKey;

    var ordersRef =  dbRef.child('orders/' + orderId);
    var orderMsg = document.getElementById("specialMsg").value || '';
    var now = (new Date().getTime());

    var isSubAgentOrder = false;
    if(userInfo.superAgentMobileNum)
      isSubAgentOrder=true;

    var newOrder = {
      uid : window.localStorage.uid,
      time : now,
      userName : userInfo.name,
      status : "received",
      priority : (now * -1),
      orderMsg : orderMsg,
      cart :  cartArray,
      isSubAgentOrder : isSubAgentOrder
    };

    var usersRef = dbRef.child('users/' + window.localStorage.uid );

    usersRef.once('value', function(data){
      $ionicLoading.hide();
      var userValue = data.val();
      userValue["orders"] = userValue["orders"] || [];
      userValue["orders"].push(orderId);
      var promise = usersRef.update(userValue);
    }).catch(function(e){
      $ionicLoading.hide();
    });

    var promise = ordersRef.set(newOrder);
    promise.then(function(e) {
      showPopUp("Your order has been successfully placed. <br><hr> Order number is <b> "+ orderId+ "</b><br><hr>"+
        "You can track your order from the orders page","Congratulations!!");
      populateInfoToSuperAgent(newOrder.cart.shopDetail[0].name);
      sendSMS();
      populateOrderList(orderId);
      removeOrderedFromCartArray();
      updateCart();
      window.localStorage.removeItem("cartInfo");
      window.location.hash = "#/app/search";
    }).catch(function(e){
      showPopUp('Some problem occured while submitting the order',"Sorry!!")
    });


    //populate order for super agent
    function populateInfoToSuperAgent(shopName){
      var userInfo=JSON.parse(window.localStorage.userInfo);
      if(userInfo.superAgentMobileNum) {
        var superAgentsRef = dbRef.child('users/' + userInfo.superAgentMobileNum );
        superAgentsRef.once('value', function(data){
          var userValue = data.val();
          userValue["suborders"] = userValue["suborders"] || {};
          userValue["suborders"][window.localStorage.uid]=userValue["suborders"][window.localStorage.uid] || {};
          userValue["suborders"][window.localStorage.uid][orderId] = userInfo.name + ';' + shopName;
          var prom = superAgentsRef.update(userValue);
          prom.then(function(w){

          }).catch(function(e){
            showPopUp('Some problem occured while submitting the order. Please resubmit the order',"OOPS!!")
          })
        });
      }
    }


    function removeOrderedFromCartArray(){
      var cartArray1 = JSON.parse(window.localStorage.cartArray);
      var length = cartArray.shopDetail.length;
      for(var index = 0; index < length; index++){
        var shopDetail = cartArray.shopDetail[index];
        var tin = shopDetail.tin;
        var replacedTin = tin.replace(/\./g,'dot');
        var replacedTin = replacedTin.replace(/\//g,'forwardslash');
        var shopInfoRef = dbRef.child('shopInfo/' + replacedTin);
        shopInfoRef.set(new Date().getTime());
        for(var itemkey in shopDetail.items) {
          for(var itemkey2 in shopDetail.items[itemkey]) {
            var array = cartArray1[tin];
            for (var index1 = 0; index1 < array.length; index1++) {
              if (array[index1].productId == itemkey2){
                array.splice(index1,1);
                break;
              }
            }
            if(array.length == 0)
              delete cartArray1[tin];
            else
              cartArray1[tin] = array;
          }
        }
      }
      window.localStorage.cartArray = JSON.stringify(cartArray1);
    }

    var populateOrderList = function(orderId){
      //  console.log('orderid is ' + orderId);
      var orderListRef = loginCred.dbRef.child('orderList');
      orderListRef.transaction(function(orders){
        orders=orders||[];
        orders.push(orderId);
        return orders;
      });
    }

    var sendSMS  = function(){
      var userInfo=JSON.parse(window.localStorage.userInfo);
      if(!userInfo.superAgentMobileNum) {
        var cartInfo = JSON.parse(window.localStorage.cartInfo);
        var shopInfo = JSON.parse(window.localStorage.shopInfo);
        var smsURL = window.localStorage.smsURL;
        cartInfo.shopDetail.forEach(function(shop,index){
          var shopName = shop.name || "";
          var text = "Dear " + shopName + "! \nYour order has been  placed successfully.";
          var mobile = shopInfo[shop.tin].mobile;
          var objectOfAllItems = jsonConcat(shop.items.rice || {},shop.items.ravva || {}) || {};
          objectOfAllItems = jsonConcat(objectOfAllItems,shop.items.broken || {}) || {};
          text += "Total Weight = " + shop.totalWeight +" Quintals\n";
//                    for(var key in objectOfAllItems){
//                        text += objectOfAllItems[key].name + "-" + objectOfAllItems[key].weight;
//                        text += " quintals\n"
//                                //- Rs." + objectOfAllItems[key].discountedQuintalPrice + "/Qtl";
//                       // text += "- Amount = Rs." + objectOfAllItems[key].price + "\n";
//                    }
          text += "We will deliver your goods as soon as possible.\n Thank-you!";
          //  text += "Total Weight = " + shop.totalWeight +" Quintals\n"+ "Total Discount = " + shop.shopDiscountAmount ;
          //  text += "\n Total Amount = " + shop["totalShopPrice"] + "\n\n Thank-you! \n Team Lalitha";
          var obj = {};
          obj[mobile] = text;
          if(smsURL) {
            makeCorsRequest(smsURL,obj);
          }
        });
      }

    }


    // Create the XHR object.
    function createCORSRequest(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        // CORS not supported.
        xhr = null;
      }
      xhr.setRequestHeader("Content-Type", "application/json");

      return xhr;
    }


    // Make the actual CORS request.
    function makeCorsRequest(smsURL,object) {
      var xhr = createCORSRequest('POST', smsURL);
      if (!xhr) {
        return;
      }

//              // Response handlers.
//              xhr.onload = function() {
//                var text = xhr.responseText;
//              };
//
//              xhr.onerror = function() {
//              };

      var params = JSON.stringify(object);
      xhr.send(params);

    }
    function jsonConcat(o1, o2) {
      for (var key in o2) {
        o1[key] = o2[key];
      }
      return o1;
    }
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
});
