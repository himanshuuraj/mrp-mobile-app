app.controller('loginCtrl', function($scope,$http,$state,loginCred,$rootScope,$ionicNavBarDelegate,$cordovaToast,$ionicSideMenuDelegate) {
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
    }
  };

  $scope.showToast = function(message, duration, location) {
    $cordovaToast.show(message, duration, location).then(function(success) {
      //console.log("The toast was shown");
    }, function (error) {
      //console.log("The toast was not shown due to " + error);
    });
  };

  $scope.onClickAnchorTag = function() {
    var anchorText = document.getElementById('toggle').textContent;
    if(anchorText=='SIGN UP'){
      document.getElementById('toggle').textContent='SIGN IN';
      document.getElementById('myOption').textContent = 'SIGN UP';
      document.getElementById('backgroundContent').style.cssText = 'height: 100%; background: url("img/lalithaSignUpImage.jpg") 0% 0% / 100% 100% no-repeat;  ';
      document.getElementById('welcomeDiv').style.display='block';
      document.getElementById('loginDiv').style.marginTop='10%';


    }else{
      document.getElementById('toggle').textContent='SIGN UP';
      document.getElementById('myOption').textContent = 'SIGN IN';
      //document.getElementById('backgroundContent').style.background = "url('img/lalithaLoginImage.jpg')";
      document.getElementById('backgroundContent').style.cssText = "height:100%;background: url('img/lalithaLoginImage.jpg');background-size:100% 100%; background-repeat: no-repeat;";
      document.getElementById('welcomeDiv').style.display='none';
      document.getElementById('loginDiv').style.marginTop='65%';

    }
  };
  $scope.onForgotPassword = function() {

    showPopUp("Please contact administrator", "oops!!" );
  };

  $scope.onClickButton = function() {
    var buttonText = document.getElementById('myOption').textContent;
    if(buttonText == 'SIGN IN') {
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
            //console.log(data);
            if(data){
              userInfo = data;
              window.localStorage.userInfo = JSON.stringify(data);
              if(userInfo.superAgentMobileNum){
                var shopsRef = dbRef.child('users/'+userInfo.superAgentMobileNum + '/shops');
                shopsRef.once('value', function(snap) {
                  var superAgentShops = snap.val() || [];
                  var allowedAreas=userInfo.allowedAreas || [];
                  var filteredShops=[];
                  for (var i=0;i<superAgentShops.length;i++){
                    if(allowedAreas.indexOf(superAgentShops[i]['areaId']) >=0)
                      filteredShops.push(superAgentShops[i]);
                  }

                  var uInfo = JSON.parse(window.localStorage.userInfo);
                  var existingShops = uInfo.shops || [];
                  uInfo.shops = existingShops.concat(filteredShops);
                  window.localStorage.userInfo = JSON.stringify(uInfo);
                })

                var myOwnShopsRef = dbRef.child('users/'+uid + '/shops');
                myOwnShopsRef.once('value' , function(data){
                  var myshops = data.val() || [];
                  var uInfo = JSON.parse(window.localStorage.userInfo);
                  var existingShops = uInfo.shops || [];
                  uInfo.shops = existingShops.concat(myshops);

                  window.localStorage.userInfo = JSON.stringify(uInfo);

                })

              }
              $scope.isAgent = window.localStorage.isAgent = data.isAgent;
              window.localStorage.isActive = data.active;
              $rootScope.$broadcast('isAgent',{});
              if(!userInfo.isAgent && userInfo.shops && userInfo.shops.length == 1){
                window.localStorage.shopName = userInfo.shops[0].name;
                window.localStorage.areaId = userInfo.shops[0].areaId;
                window.localStorage.tin = userInfo.shops[0].tin;
                var x ={};
                x[userInfo.shops[0].tin] = userInfo.shops[0];
                window.localStorage.shopInfo = JSON.stringify(x);
              }

              if(!data.active){
                alert("User not activated. Please contact administrator")
              }else if(!userInfo.superAgentMobileNum && (!userInfo.shops || userInfo.shops.length == 0) )
                window.location.hash = "#/app/shop";
              else{
                window.location.hash = "#/app/search";
              }
            }
            else{
              $scope.showUserInputField = true;
              $scope.$apply();
            }
          }).catch(function(e){//console.log(e)
          });
        }).catch(function(e){
          //console.log(e)
        });


      }).catch(
        function(e){
          showPopUp("Username password doesnt match");
          // console.log(e);
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
      }).catch(function(e){
        // console.log(e);
        showPopUp(e)
      });
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
    }).catch(function(e){
      alert("Network error");
    });

  };

  var validateField = function(){
    if(!$scope.signUpData.name){
      showPopUp('Enter Name Of User');
      return 0;
    }else if(/^[a-zA-Z0-9- ]*$/.test($scope.signUpData.name) == false) {
      showPopUp('Name should not contain special characters like . , @ ');
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

    if(!$scope.signUpData.shop.tin){
      showPopUp('Enter Shop Tin');
      return 0;
    }
    if(!$scope.signUpData.shop.area){
      showPopUp('Please chose shop area from the drop down');
      return 0;
    }

    return 1;
  }
  $scope.initOnSignup = function(){
    var areasRef = loginCred.dbRef.child('areas' );
    $scope.areasObj = {};
    areasRef.once('value', function(data){
      //console.log(data.val());
      var areas = $scope.areasObj = data.val();
      var foo=[];
      for(var area in areas){
        foo.push({
          id: area,
          name: areas[area].displayName
        })

      }
      //   console.log($scope.areasObj);
      $scope.areas = foo;
      $scope.$apply();
    });
  }

  $scope.selectedAreas = [];

  $scope.fillSignUpData = function(){
    var authId = window.localStorage.authId;
    var shops = [];
    if(!validateField())
      return;
    if(!$scope.signUpData.isAgent){
      var areaId = $scope.signUpData.shop.area;
      var areaName = $scope.areasObj[areaId].displayName;
      var district = $scope.areasObj[areaId].district;
      var state = $scope.areasObj[areaId].state;

      var fulladdress = $scope.signUpData.shop.shopnumber + " ; " +
        $scope.signUpData.shop.street + " ; " +
        $scope.signUpData.shop.city + " ; " +
        areaName + " ; " +
        district + " ; " +
        state  + "; " +
        $scope.signUpData.shop.pincode;

      shops = [{
        name: $scope.signUpData.shop.name,
        proprietor_name : $scope.signUpData.shop.proprietor_name,
        mobile : $scope.signUpData.shop.mobile,
        pan : $scope.signUpData.shop.pan,
        tin : $scope.signUpData.shop.tin,
        state : state,
        areaId : areaId,
        areaName : areaName,
        district : district,
        city : $scope.signUpData.shop.city,
        address : fulladdress,
        taxType : $scope.signUpData.shop.taxType
      }];

    }

    var foo = {}; var now = (new Date().getTime()) * -1;
    foo = {
      email : $scope.userData.username,
      active:false,
      name : $scope.signUpData.name,
      mobile : $scope.signUpData.mobile,
      isAgent : $scope.signUpData.isAgent,
      address : $scope.signUpData.address,
      authId : authId,
      priority : now,
      shops : shops
    };

    var selectedAreas=[];
    var index = 0;
    for(var key in $scope.areasObj){
      index++;
      var element = document.getElementById("area"+index)
      if(element){
        if(element.checked)
          selectedAreas.push(element.value);

      }

    }

    if($scope.signUpData.superAgentMobile) {
      foo.superAgentMobileNum=$scope.signUpData.superAgentMobile;
    }
    foo.allowedAreas = selectedAreas; // fill the selected areas here
    createUser(foo);


  };

  var createUser = function(foo){
    var authId = window.localStorage.authId;
    var uid = $scope.signUpData.mobile
    var authIdMobileMapRef = dbRef.child('authMobileMap/' + authId);
    var promiseFromAuthMobile = authIdMobileMapRef.set(uid);
    promiseFromAuthMobile.then(function(e){
      //    console.log("Successfully added mobile mapping to the auth id");
      window.localstorage.uid=uid;
    }).catch(function(e){//console.log(e);
      //console.log("Could not add mobile mapping")
    });
    var usersRef = dbRef.child('users/'+ uid );
    var promise = usersRef.set(foo);
    promise.then(function(e) {
      showPopUp("Please click the SIGN IN button below to login", "CONGRATULATIONS!!");
      $scope.showUserInputField = false;
      //window.localStorage.clear();
      //window.sessionStorage.clear();
      $scope.$apply();
    }).catch(e => showPopUp("Please try again"));

    if($scope.signUpData.superAgentMobile) {
      var superAgentMobileNum = $scope.signUpData.superAgentMobile;
      //what if user gives wrong mobile - then the whole data will be wiped out
      var superAgentsRef = dbRef.child('users/' +  superAgentMobileNum + '/subagents/' + uid);
      var promise = superAgentsRef.set(uid);
      promise.then(function(e) {
        window.localStorage.superAgentMobileNum=superAgentMobileNum;
      }).catch(e => showPopUp("Could not update super agent information"));
    }
  }

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

});
