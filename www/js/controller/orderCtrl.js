app.controller('orderCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope) {
  var usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );
  $scope.orderStatusArray = {};  $scope.ordersArray = [];
  $scope.loadOrders = function(){
    usersRef.orderByKey().once('value' ,
      function(data){
        $scope.ordersArray = data.val().orders;
        $scope.ordersArray.reverse();
        $scope.$apply();
      });
    $rootScope.$broadcast("cached",{});
  }

  $scope.isViewDetailClicked = function(orderId){
    return ($scope.viewDetailOrder === orderId);
  }

  $scope.showOrder = function(orderId){
    if($scope.viewDetailOrder == orderId)
      $scope.viewDetailOrder = null;
    else
      $scope.viewDetailOrder = orderId;
    //console.log("show order clicked"+orderId);
    var ordersRef=loginCred.dbRef.child('orders/'+ orderId);
    ordersRef.once('value', function(data){
      if(!data.val()) {
        var orderIdTokens = orderId.split("-");
        var dateInfoFromOrderId = orderIdTokens[0].toString();
        var year = dateInfoFromOrderId.substring((dateInfoFromOrderId.length-1),
          dateInfoFromOrderId.length);

        var month = dateInfoFromOrderId.substring(dateInfoFromOrderId.length-4 , dateInfoFromOrderId.length-1);
        var monthsText=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var index = monthsText.indexOf(month);
        var monthNumber = index +1;
        var day = dateInfoFromOrderId.substring( 0 , dateInfoFromOrderId.length-4);
        if(Number(day)<10)
          day='0'+ day;
        if(Number(monthNumber)<10)
          monthNumber = '0' + monthNumber;

        if(Number(year) == 7 )
          year = '2017';
        else
          year = 2000 + Number(year);

        var date = day + '-' + monthNumber + '-' + year;
        console.log(date);

        var oldOrdersRef=loginCred.dbRef.child('oldOrders/'+  date +'/'+ orderId);
        oldOrdersRef.once('value', function(data){
          if(!data.val())
            return;

          //same code is Repeated  below. Put it into a function later
          $scope.cartArrayOrderDetail = data.val().cart;
          $scope.shopArrayOrderDetail = $scope.cartArrayOrderDetail.shopDetail;

          for (var index in $scope.shopArrayOrderDetail){
            var shop = $scope.shopArrayOrderDetail[index];
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

          $scope.cartArrayOrderDetail['grossPrice'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['grossPrice']);
          $scope.cartArrayOrderDetail['discount_amount'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['discount_amount']);
          $scope.cartArrayOrderDetail['totalPrice'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['totalPrice']);
          $scope.$apply();

        })

      }else{
        $scope.cartArrayOrderDetail = data.val().cart;
        $scope.shopArrayOrderDetail = $scope.cartArrayOrderDetail.shopDetail;

        for (var index in $scope.shopArrayOrderDetail){
          var shop = $scope.shopArrayOrderDetail[index];
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

        $scope.cartArrayOrderDetail['grossPrice'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['grossPrice']);
        $scope.cartArrayOrderDetail['discount_amount'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['discount_amount']);
        $scope.cartArrayOrderDetail['totalPrice'] = loginCred.toCommaFormat($scope.cartArrayOrderDetail['totalPrice']);
        $scope.$apply();
      }
    });

  }



  $scope.fillCartArrayForReOrder = function(reOrderId) {
    var shopDetail = $scope.cartArrayOrderDetail.shopDetail;
    var existingcartArray = JSON.parse(window.localStorage.cartArray);
    var shopObjectsGroup = {};
    for(var index  in shopDetail) {
      var tin = shopDetail[index].tin;
      var objectsArray = [];
      for(var item in shopDetail[index].items){
        var itemTypeValue = item;
        var groupOfitemObjects = shopDetail[index].items[item];
        for (var key in groupOfitemObjects) {
          var itemObject = groupOfitemObjects[key];
          var bagValue = itemObject['bags'];
          var masterWeightValueNumber = Number(itemObject['weight'])*100 / Number(bagValue);
          var masterWeightValue = masterWeightValueNumber + 'KG';
          var nameValue = itemObject['name'];
          var priceValue = loginCred.toNumberFormat(itemObject['price']);
          var productIdValue = key;
          var quantityValue = itemObject['weight'];

          var productObj = {
            'bag' : bagValue,
            'itemType' : itemTypeValue,
            'master_weight' : masterWeightValue,
            'name' : nameValue,
            'price' : priceValue,
            'productId' : productIdValue,
            'quantity' : quantityValue

          };

          objectsArray.push(productObj);

        }
      }

      shopObjectsGroup[tin]= objectsArray;
    }
    // console.log(shopObjectsGroup);
  }

  $scope.showDeletePopUp = function(orderId) {
    var myPopup = $ionicPopup.show({
      template: 'Are you sure you want to cancel the order ?',
      title: 'Cancel Order ?',
      scope: $scope,
      buttons: [
        { text: 'No' }, {
          text: '<b>Yes</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.cancelOrder(orderId);
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  };

  $scope.cancelOrder = function(orderId){
    var showPopUp = loginCred.showPopup;
    var ordersRef=loginCred.dbRef.child('orders/'+ orderId);
    ordersRef.once('value', function(data){
      var orderObject = data.val();
      orderObject['status'] = 'cancelled';
      var foo = orderObject.updates;
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      var d = new Date();
      var promise = ordersRef.update(orderObject);
      promise.then(function(data){
        var singleMsg = {
          timestamp : d.getDate() + '-'+monthNames[d.getMonth()] + '-' + d.getFullYear()+' '+ d.getHours() + ':'+ d.getMinutes(),
          updateMsg : "Cancelled by user",
          messageType : "cancelled"
        }
        var orderUpdatesRef = loginCred.dbRef.child('orders/'+ orderId + '/updates');
        orderUpdatesRef.push(singleMsg);
        showPopUp('Order Cancelled Successfully', 'Success');

      }).catch(function(e){ console.log(e);showPopUp('Could not cancel the order',"Failed!!")})

    });
  }

  $scope.onClickOrder = function(orderId){

    var x= document.getElementById(orderId +'expanded');
    var icon = document.getElementById(orderId+'icon');

    if (x.style.display === 'none') {
      x.style.display = 'block';
      icon.className = 'icon ion-minus';
    } else {
      x.style.display = 'none';
      icon.className = 'icon ion-plus';
    }

    if($scope.orderStatusArray[orderId] != null){
      return ;
    }
    var orderUpdatesRef = loginCred.dbRef.child('orders/'+ orderId);
    var foo=[];
    orderUpdatesRef.once('value', function(data){
      var order = data.val();
      if(!order)
        return;
      var updates = order.updates;
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      if(updates != null) {
        for(var ob in updates){
          var d = new Date(updates[ob].timestamp);
          if(updates[ob].msgType !== 'internal') {
            var singleMsg = {
              timestamp : d.getDate() + '-'+monthNames[d.getMonth()] + '-' + d.getFullYear()+' '+ d.getHours() + ':'+ d.getMinutes(),
              message : updates[ob].updateMsg,
              messageType : updates[ob].msgType
            }
            foo.push(singleMsg);
          }
        }

      }
      $scope.orderStatusArray[orderId] = {
        updates:foo,
        status:order.status
      }
      $scope.$apply();


    })

  }

  $scope.isOrderShown = function(orderId) {
    return $scope.expandedOrder === orderId;
  };

  $scope.getOrderStatus = function(orderId) {
    var a = { orderId : $scope.orderStatusArray[orderId]};
    return a;
  };
});
