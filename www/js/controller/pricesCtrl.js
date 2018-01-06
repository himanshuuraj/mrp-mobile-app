app.controller('pricesCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope){


  $scope.loadPrices = function(){
    var usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );

    var internalVsDisplay = loginCred.dbRef.child('internalVsDisplay');
    internalVsDisplay.once('value', function(data){
      $scope.intVsDisp=  data.val();
    })

    var areas = [];var userInfo = JSON.parse(window.localStorage.userInfo);

    var shops = userInfo.shops;
    if(shops!=null){
      for(i=0;i<shops.length;i++){
        var found=false;
        for(ky=0;ky<areas.length;ky++){
          if(areas[ky]==shops[i].areaId){
            found=true;
            break;
          }
        }
        if(!found)
          areas.push(shops[i].areaId);
      }
    }

    $scope.pricesForAreas ={};
    var ricePriorityArray = JSON.parse(window.localStorage.riceItemsPriorityArray);
    var ravvaPriorityArray = JSON.parse(window.localStorage.ravvaItemsPriorityArray);

    var brokenPriorityArray = JSON.parse(window.localStorage.brokenItemsPriorityArray);

    for(j=0;j<areas.length;j++){

      (function(j){
        var ordersRef = loginCred.dbRef.child('priceList/' + areas[j]);
        ordersRef.once('value', function(data){
          //console.log(areas[j]);
          var items = data.val();
          var riceArray = items['rice'];
          var ravvaArray = items['ravva'];
          var brokenArray = items['broken'];
          var foobar ={};
          var bar=[]; var userType = 'Agent';
          if(!window.localStorage.isAgent)
            userType='Outlet';
          ricePriorityArray.forEach( function(object) {
            var displayNameOfProduct = $scope.intVsDisp[object['key']];
            if(displayNameOfProduct ==null)
              displayNameOfProduct = object['key'];

            if( (!riceArray[object['key']]) || (!riceArray[object['key']][userType]) || (riceArray[object['key']][userType]=="" ))
              return;
            var foo={
              name:displayNameOfProduct,
              price:riceArray[object['key']][userType]
            };
            bar.push(foo);
          })
          foobar['Rice']= bar;
          var bar=[]

          ravvaPriorityArray.forEach( function(object) {
            var displayNameOfProduct = $scope.intVsDisp[object['key']];
            if(displayNameOfProduct ==null)
              displayNameOfProduct = object['key'];
            if( ((!ravvaArray[object['key']]) || (!ravvaArray[object['key']][userType]) || (ravvaArray[object['key']][userType]=="" )) )
              return;
            var foo={
              name:displayNameOfProduct,
              price:ravvaArray[object['key']][userType]
            };
            bar.push(foo);
          })
          foobar['Ravva']= bar;
          var bar=[]

          brokenPriorityArray.forEach( function(object) {
            var displayNameOfProduct = $scope.intVsDisp[object['key']];
            if(displayNameOfProduct ==null)
              displayNameOfProduct = object['key'];
            if(((!brokenArray[object['key']]) || (!brokenArray[object['key']][userType]) || (brokenArray[object['key']][userType]=="" )))
              return;
            var foo={
              name:displayNameOfProduct,
              price:brokenArray[object['key']][userType]
            };
            bar.push(foo);
          })
          foobar['Broken']= bar;

          $scope.pricesForAreas[$scope.intVsDisp[areas[j]]] = foobar;
          $scope.$apply();
          //console.log($scope.pricesForAreas);
          $rootScope.$broadcast("cached",{});

        })})(j);
    }

    $rootScope.$broadcast("cached",{});
  };
});
