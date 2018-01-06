app.controller('profileCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope){
  $scope.userProfile={}; var  usersRef ;var userObj;$scope.userProfileView={};
  var showPopup = loginCred.showPopup;
  $scope.onEditProfile = function() {
    $scope.editProfile=true;
  }
  $scope.loadUserProfile = function(){
    usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );
    usersRef.once('value', function(data){
      //console.log(data.val());
      userObj = data.val();

      $scope.userProfileView['Name'] = userObj['name'];
      $scope.userProfileView['Email'] = userObj['email'];
      $scope.userProfileView['Is Agent'] = userObj['isAgent'];
      $scope.userProfileView['Address'] = userObj['address'];
      $scope.userProfileView['Mobile'] = userObj['mobile'];
      $scope.$apply();

    })

    $rootScope.$broadcast("cached",{});
  };

  $scope.sendEmail = function() {
    var aRef = loginCred.authRef;
    var email = aRef.currentUser.email;
    var showPopUp = loginCred.showPopup;

    aRef.sendPasswordResetEmail(email).then(function() {
      showPopUp("An email to reset password has been sent successfully ", "Success!!" );
    }).catch(function(error) {
        showPopUp("Problem occured. Could not send email", "oops!!" );

      }
    );
  };

  $scope.updateProfile = function(){

    userObj['name'] = $scope.userProfile['name'];
    userObj['address'] = $scope.userProfile['address'];

    var promise = usersRef.update(userObj);
    promise.then(function(data){
      $scope.editProfile=false;
      $scope.userProfileView['Name'] = userObj['name'];
      $scope.userProfileView['Address'] = userObj['address'];
      $scope.$apply();
      showPopup('User information updated successfully', 'Success');

    }).catch(function(e){ console.log(e);showPopUp('Some problem occured while updating the user information',"Failed!!")})

  };

  $scope.cancel = function(){
    $scope.editProfile = false;
  };

});
