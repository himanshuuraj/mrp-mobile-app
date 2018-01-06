app.service('loginCred', function($ionicPopup) {

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

  this.showPopup = function(msg,title) {
    title = title || "Alert";
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: msg
    });
    alertPopup.then(function(res) {
      console.log('Thank you for not eating my delicious ice cream cone');
    });
  };
  var computePrice = this.computePrice = function(key,index) {
    var bagElement = document.getElementById(key+"bag");
    var price= this.getPrice(key);
    price= Number(loginCred.toNumberFormat(price));
    var bagNumber =  Number(bagElement.value);
    document.getElementById(key+"computedPrice").innerHTML="&#8377;"+bagNumber*price;

  };
  this.textInBag = function(key,master_weight,index){
    var weight =  master_weight.getWeight();
    var bagElement = document.getElementById(key+"bag");
    var bagNumber = parseInt(bagElement.value);
    document.getElementById(key+"quantity").value = (bagNumber * weight)/100;
  };

  this.textInQuantity = function(key,weight,index){
    var quantityElement = document.getElementById(key+"quantity");
    var quantity = Number(quantityElement.value);
    var bag = document.getElementById(key+"bag");
    weight = weight.getWeight();
    bag.value =  quantity*100/weight;
  };
  this.getImageUrl = function(key,selectedItem){
    return urlOfImage+selectedItem+"_200/"+key+".png";
  };
  this.updateCart = function(){
    var addToCartElement = document.getElementById("addToCartLogo");
    var totalItemInCart = 0;
    var x = window.localStorage.cartArray || "{}";
    if(x)
      x = JSON.parse(x);
    for(var key in x){
      totalItemInCart += x[key].length;
    }
    if(!addToCartElement)
      return;
    if(addToCartElement){
      if(totalItemInCart === 0)
        addToCartElement.innerHTML = "";
      else
        addToCartElement.innerHTML = totalItemInCart;
    }
  };

  this.toCommaFormat = function(x){
    if(!x)
      return "0";

    if(Number(x) === x && x % 1 === 0) {
      x=x.toString();
      var lastThree = x.substring(x.length-3);
      var otherNumbers = x.substring(0,x.length-3);
      if(otherNumbers != '')
        lastThree = ',' + lastThree;
      var y = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
      return y;
    }
    else {
      x=x.toString();
      var afterPoint = '';
      if(x.indexOf('.') > 0)
        afterPoint = x.substring(x.indexOf('.'),x.length);
      x = Math.floor(x);
      x=x.toString();
      var lastThree = x.substring(x.length-3);
      var otherNumbers = x.substring(0,x.length-3);
      if(otherNumbers != '')
        lastThree = ',' + lastThree;
      var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
      return res;
    }

  };
  this.toNumberFormat = function(x){
    return x.replace(/,/g , "");
  };
});
