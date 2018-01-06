app.controller('shopCtrl', function($scope,$http,loginCred,$state,$rootScope,$ionicPopup) {
  var userInfo = {};
  if(window.localStorage.userInfo)
    userInfo = JSON.parse(window.localStorage.userInfo);
  $scope.shopArray = userInfo.shops || [];  $scope.lastOrderedTimeForShop = {};

  $scope.shopArray.forEach(function(shop) {

    var tin = shop.tin;
    if(!tin)
      return;
    var replacedTin = tin.replace(/\./g,'dot');
    var replacedTin = replacedTin.replace(/\//g,'forwardslash');
    var dbRef = loginCred.dbRef.child('shopInfo/' + replacedTin);
    dbRef.once('value', function(data){
      var currentTime = new Date().getTime();
      if(!data.val())
        $scope.lastOrderedTimeForShop[tin]= "N/A";
      else {
        var lastOrdered = data.val() ? data.val() : 0;
        var diff = currentTime - lastOrdered;
        var hours = Math.round(diff/(1000*3600));
        var days = Math.floor(hours/24);
        hours = hours - (days*24);
        $scope.lastOrderedTimeForShop[tin]= days + " days " + hours + " hours ago" ;
      }
    } );

  });

  $scope.showShopInput = false;
  var showPopUp = loginCred.showPopup;
  var userId;
  $scope.editType = false;
  $scope.shop = {
  };

  $scope.showNewShopEdit = function () {
    $scope.showShopInput = true;
  };

  $scope.callShop = function(shop) {
    return "tel:+91"+shop.mobile;
  }

  $scope.getTimeSinceLastOrdered = function(shop){
    return $scope.lastOrderedTimeForShop[shop.tin];
  }

  $scope.showConfirmRemoveShop = function(tin) {
    var myPopup = $ionicPopup.show({
      template: 'Do you want to delete the shop?',
      title: 'Confirm deletion',
      scope: $scope,
      buttons: [
        { text: 'Cancel' }, {
          text: '<b>Place</b>',
          type: 'button-positive',
          onTap: function(e) {
            removeShop(tin);
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  };

  var removeShop = function(tin){
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
    if(!$scope.shop.tin){
      showPopUp('Enter Shop Tin');
      return 0;
    }
    if(!$scope.shop.areaId){
      showPopUp('Enter Shop AreaId');
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
    var areaId = $scope.shop.areaId;
    var areaName = $scope.areasObj[areaId].displayName;
    var district = $scope.areasObj[areaId].district;
    var state = $scope.areasObj[areaId].state;

    var fulladdress = $scope.shop.shopnumber + " ; " +
      $scope.shop.street + " ; " +
      $scope.shop.city + " ; " +
      areaName + " ; " +
      district + " ; " +
      state  + "; " +
      $scope.shop.pincode;

    $scope.shop.district= district;
    $scope.shop.state=state;
    $scope.shop.areaName = areaName;

    $scope.shop.address = fulladdress;
    userInfo["shops"] = userInfo["shops"] || [];
    //console.log($scope.shop);
    userInfo["shops"].push(JSON.parse(JSON.stringify($scope.shop)));
    saveShop('add', $scope.shop);
    $scope.shop = {
      tax_id : {}
    };
  };

  var saveShop = function(type, shop){
    var uid = window.localStorage.uid;

    if(shop.$$hashKey)
      delete shop.$$hashKey

    var dbRef = loginCred.dbRef;
    var usersRef = loginCred.dbRef.child('users/'+ uid +'/shops');
    usersRef.transaction(function(shops){
      if(type == 'add') {
        shops=shops||[];
        shops.push(shop);
        return shops;
      }else {
        for(var i=0;i<shops.length;i++) {
          if(shops[i].tin == shop.tin)
            shops[i]=shop;
        }
        return shops;
      }
    },function(success){
      if(type == 'add'){
        showPopUp("Shop added successfully");
      }
      else if(type == 'edit'){
        showPopUp("Shop edited successfully");
      }
      else{
        showPopUp("Shop deleted successfully");

      }
      window.localStorage.userInfo = JSON.stringify(userInfo);


      $scope.shopArray = userInfo.shops || [];
      $scope.editType = false;
      $scope.showShopInput = false;
      $scope.$apply();
      window.localStorage.userInfo = JSON.stringify(userInfo);

    });

  }

  $scope.showEditBox = function(shop){
    $scope.shop = shop;
    //console.log(shop);
    $scope.showShopInput = true;
    $scope.editType = true;
  };

  $scope.closeEditBox = function(){
    $scope.showShopInput = false;
    $scope.$apply();
  };

  $scope.editShop = function(){
    //console.log(userInfo);
    var length = userInfo.shops.length;
    for(var index = 0; index < length; index++){
      var shop = userInfo.shops[index];
      if($scope.shop.tin == shop.tin){
        userInfo.shops[index] = $scope.shop;
        break;
      }
    }
    saveShop('edit' , $scope.shop);
  };

  $scope.onInit = function () {
    var areasRef = loginCred.dbRef.child('areas');
//            if(window.localStorage.isAgent=="true")
//                $scope.addShopEnabled = true;
//            else
//                $scope.addShopEnabled=false;


    var userInfo = JSON.parse(window.localStorage.userInfo);
    if(userInfo.superAgentMobileNum)
      $scope.editShopEnabled = false;
    else
      $scope.editShopEnabled = true;

    if(window.localStorage.isAgent=="true")
      $scope.addShopEnabled = true;
    else
      $scope.addShopEnabled=false;

    $scope.areasObj = {};
    areasRef.once('value', function (data) {
      //console.log(data.val());
      var areas = $scope.areasObj = data.val();
      var foo = []; var allowedAreas = userInfo.allowedAreas;
      for (var area in areas) {
        if(allowedAreas.indexOf(area) >=0)  {
          foo.push({
            id: area,
            name: areas[area].displayName
          })
        }

      }
      $scope.areas = foo;
      //  console.log('areas =' + foo)
      $scope.$apply();
      //console.log($scope.areas);

    });
    $rootScope.$broadcast("cached",{});
  }

  $scope.shopSearchText = {name : ""};
  $scope.filterShop = function(shop){
    if(!$scope.shopSearchText.name)
      return true;
    return shop.name.toLowerCase().includes($scope.shopSearchText.name.toLowerCase());
  };
})
