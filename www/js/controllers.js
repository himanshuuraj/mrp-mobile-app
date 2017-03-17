angular.module('starter.controllers', ['ngCordova'])

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
    })

    .controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope,loginCred) {
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
        var addToCartElement;
        $rootScope.$on('cached',function (data) {
            $timeout(function() {
                updateCart();
                var x = document.getElementById("ricetab");
                if(x){
                    x.className = "button btnSelected";
                }
            },1000);
        });
        
        var updateCart = loginCred.updateCart;

        $scope.redirect = function(type){
            type = "#/app/"+type;
            window.location.hash = type;
        }

    })

    .controller('summaryCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$rootScope) {
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
        
      
        $scope.applyDiscount = function(){
            var shopArray = $scope.shopArray;
            var totaldiscountedPrice = 0;
            shopArray.forEach(function(shop){
      
                    
                var items = shop.items;
                var riceObject = items.rice;
                var ravvaObject = items.ravva;
                var brokenObject = items.broken;
                var shopRiceWeight = 0;var shopRavvaWeight = 0; var shopBrokenWeight= 0;
                for(var productId in riceObject){
                    shopRiceWeight += riceObject[productId].weight;
                }
                for(var productId in ravvaObject){
                    shopRavvaWeight += ravvaObject[productId].weight;
                }
                for(var productId in brokenObject){
                    shopBrokenWeight += brokenObject[productId].weight;
                }
                var ricediscount=0, ravvadiscount=0;
                
                if(shopRiceWeight >=35 && (shop.areaId =='EG_PDP' || shop.areaId =='EG_KTPD' )){
                                         ricediscount=25;

                }
                if(shopRavvaWeight >=35 && (shop.areaId =='EG_PDP' || shop.areaId =='EG_KTPD' )){
                                         ravvadiscount=20;

                }
                 for(var productId in riceObject){
                        riceObject[productId]['discountedQuintalPrice']=  riceObject[productId].quintalWeightPrice - ricediscount;
                       riceObject[productId]['price']= riceObject[productId].discountedQuintalPrice * riceObject[productId]['weight'];
                       totaldiscountedPrice += ricediscount*riceObject[productId]['weight']
                }
                        for(var productId in ravvaObject){
                                    ravvaObject[productId]['discountedQuintalPrice']=  ravvaObject[productId].quintalWeightPrice - ravvadiscount;
                                    ravvaObject[productId]['price']= ravvaObject[productId].discountedQuintalPrice * ravvaObject[productId]['weight']
                                                           totaldiscountedPrice += ravvadiscount*ravvaObject[productId]['weight'];
                        }                
                   
                              
                
            })
            document.getElementById('discount_amount').innerHTML = "&#8377;"+totaldiscountedPrice.toString();
            $scope.cartArray["discount_amount"] = totaldiscountedPrice;
            $scope.cartArray.totalPrice = $scope.cartArray.grossPrice - totaldiscountedPrice;
        }
        $scope.submitOrder = function(){
            $scope.validateIfLatestPrice(loginCred.dbRef);
            if($scope.flagForPriceModified==true){
                    //$scope.modifiedPriceList
                 //   showPopUp("Prices for few items have changed from the time you saved in cart. <br> Please review the order before submitting.")
                    console.log($scope.modifiedPriceList);
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
            var year = now.getYear();
            var mathRandom = Math.floor((Math.random())*1000);
            var orderId= (now.getDate()).toString()  + monthsText[now.getMonth()] + (now.getYear()%10).toString() + '-'+
                userInfo.name.substring(0,3).toUpperCase() + userInfo.mobile.substring(0,3) +'-'+ mathRandom.toString();

            var cartArray = $scope.cartArray;
            var shopLength = cartArray.shopDetail.length;
            for(var index = 0; index < shopLength; index++)
                delete cartArray.shopDetail[index].$$hashKey;

            var ordersRef =  dbRef.child('orders/' + orderId);
            var orderMsg = document.getElementById("specialMsg").value || '';

            var newOrder = {
                uid : window.localStorage.uid,
                time :  now.getTime(),
                userName : userInfo.name,
                status : "received",
                orderMsg : orderMsg,
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
                showPopUp("Your order has been successfully placed. <br><hr> Order number is <b> "+ orderId+ "</b><br><hr>"+
                         "You can track your order from the orders page","Yay!!");
                window.localStorage.removeItem("cartArray");
                window.localStorage.removeItem("cartInfo");
                window.location.hash = "#/app/search";
            }).catch(function(e){ console.log(e);showPopUp('Some problem occured while submitting the order',"Sorry!!")})
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

    .controller('searchCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$timeout,$interval,$rootScope) {
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
                    window.localStorage.areaId = $scope.shopDetail.areaId;
                    $scope.getItemsPrice();
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

        $scope.removeDiv = function(key){
            var element = document.getElementById(key+"animate");
            element.className = "widthZero animatewidthzero";
        };

        var flagOfAlreadyPresentPrice = false;
        if(window.sessionStorage.flagOfAlreadyPresentPrice) {
            flagOfAlreadyPresentPrice = true;
            $scope.brokenPriceArray = JSON.parse(window.localStorage.brokenPriceArray);
            $scope.ravvaPriceArray = JSON.parse(window.localStorage.ravvaPriceArray);
            $scope.ricePriceArray = JSON.parse(window.localStorage.ricePriceArray);
        }
        var slideIndex = 0;

        $scope.slideImages = function() {
            var i;
            var slides = document.getElementsByClassName("mySlides");
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
            if(!flagOfAlreadyPresentPrice)
                $scope.getItemsPrice();
            if(window.localStorage.shopName){
                $scope.shopDetail = {name : window.localStorage.shopName,tin : window.localStorage.tin};
            }
            if(window.localStorage.cartArray){
                $scope.cartArray = JSON.parse(window.localStorage.cartArray);
                $timeout(function(){updateUI()},100);
            }
            $rootScope.$broadcast("cached",{});
            //document.getElementById("ricetab").className = "button button-positive";
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
                    { text: 'Cancel',
                        onTap: function(e) {
                            e.preventDefault();
                        }
                    }, {
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
        }
        else{
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
            if(tickElement.style.backgroundColor == "darkgray")
            {
                var x = {};
                var quantityElement = document.getElementById(key+"quantity");
                var bagElement = document.getElementById(key+"bag");
                var quantity = quantityElement.value;
                var bag = bagElement.value;
                var priceElement = document.getElementById(key+"computedPrice");
                var price = priceElement.innerText;
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
                price = price.toString(); // array to string
                if(!bag && !quantity){
                    alert("Please insert bag or quantity");
                    return;
                }
                tickElement.style.backgroundColor = "green";
                tickElement.className='button icon ion-checkmark-round';
                //x = value;
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
                window.localStorage.cartArray = JSON.stringify($scope.cartArray);
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
                window.localStorage.cartArray = JSON.stringify($scope.cartArray);
                updateCart();
            }
            console.log($scope.cartArray);
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
            productsRef.once('value').then(function(productSnapshot){
                var productsList = productSnapshot.val();
                $scope.brokenArray = productsList.broken;
                $scope.ravvaArray = productsList.ravva;
                $scope.riceArray = productsList.rice;
                document.getElementById("ricetab").className = "button btnSelected";
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
            var qtyElement = document.getElementById(key+"quantity");
            var price= $scope.getPrice(key);
            var qtyNumber =  Number(qtyElement.value);
            document.getElementById(key+"computedPrice").innerHTML="&#8377;"+qtyNumber*price;
        }

        var earlySelectedShop = {};

        $scope.getItemsPrice = function(){  
            var areaId = window.localStorage.areaId;
            var areaRef = dbRef.child('priceList/'+ areaId);
            areaRef.on('value',function(areaSnapshot){
                var productsList = areaSnapshot.val();
                console.log("Fetched list of prices for selected area" + productsList);
                window.localStorage.brokenPriceArray=JSON.stringify(productsList.broken);
                $scope.brokenPriceArray = productsList.broken;
                window.localStorage.ravvaPriceArray=JSON.stringify(productsList.ravva);
                $scope.ravvaPriceArray = productsList.ravva;
                window.localStorage.ricePriceArray=JSON.stringify(productsList.rice);
                $scope.ricePriceArray = productsList.rice;
                flagOfAlreadyPresentPrice = true;
                window.sessionStorage.flagOfAlreadyPresentPrice = true;
                $scope.getProductItems();
            });

        };

        $scope.getSelectedItemArray = function(){
            $scope.selectedItem = $scope.selectedItem || "rice";
            return $scope[$scope.selectedItem+"Array"] || [];
        }

        $scope.setSearchedShop = function(shop){
            earlySelectedShop["tin"] = $scope.shopDetail.tin;
            window.localStorage.shopName = $scope.shopDetail.name = shop.name;
            window.localStorage.areaId = $scope.shopDetail.areaId=shop.areaId
            window.localStorage.tin = $scope.shopDetail.tin = shop.tin;
            shopInfo[shop.tin] = shop;
            window.localStorage.shopInfo = JSON.stringify(shopInfo);
            $scope.getItemsPrice();
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
                    var computedElement = document.getElementById(arg.pId + "computedPrice");
                    if(!computedElement.innerText) {
                        /*var priceElement = document.getElementById(arg.pId + "price");
                        if (priceElement) {
                            var price = priceElement.innerText;
                            price = price.toString().match(/[0-9]+/).toString();
                            computedElement.innerHTML = obj[arg.index].bag
                        }*/
                        computedElement.innerHTML = obj[arg.index].price;
                    }
                }, 0,true,{pId:productId,index:index});
            }
        }

        var updateCart = loginCred.updateCart;

        var updateUI = function(){
            deleteUI();
            addUI();
            updateCart();
        }

        if(!window.sessionStorage.productData)
            $http.get("https://stage-db-b035c.firebaseio.com/products.json")
                .success(function(data){
                    console.log(data);
                    window.sessionStorage.productData = JSON.stringify(data);
                    $scope.brokenArray = data.broken;
                    $scope.ravvaArray = data.ravva;
                    $scope.riceArray = data.rice;
                    document.getElementById("ricetab").className = "button";
                    $scope.selectedItem = "rice";
                }).error(function(err){
                console.log(err);
            });
        else{
            var data = JSON.parse(window.sessionStorage.productData);
            $scope.brokenArray = data.broken;
            $scope.ravvaArray = data.ravva;
            $scope.riceArray = data.rice;
            $scope.selectedItem = "rice";
        }

        $scope.shopSearchElement ={
            name: ""
        };
        $scope.shopArray = $scope.shopArray || [];
        $scope.filterSearchedArray = function(shop){
            if($scope.shopSearchElement.name === "" || $scope.shopSearchElement.name === undefined)
                return true;
            return shop.name.toLowerCase().includes($scope.shopSearchElement.name.toLowerCase());
        }
    })

    .controller('loginCtrl', function($scope,$http,$state,loginCred,$rootScope,$ionicNavBarDelegate,$cordovaToast,$ionicSideMenuDelegate) {
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
                console.log("The toast was shown");
            }, function (error) {
                console.log("The toast was not shown due to " + error);
            });
        };

        $scope.onClickAnchorTag = function() {
            var anchorText = document.getElementById('toggle').textContent;
            if(anchorText=='SIGN UP'){
                document.getElementById('toggle').textContent='SIGN IN';
                document.getElementById('myOption').textContent = 'SIGN UP';
                document.getElementById('backgroundContent').style.background = '';
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
                            console.log(data);
                            if(data){
                                userInfo = data;
                                window.localStorage.userInfo = JSON.stringify(data);
                                $scope.isAgent = window.localStorage.isAgent = data.isAgent;
                                window.localStorage.isActive = data.active;
                                $rootScope.$broadcast('isAgent',{});
                                if(!userInfo.isAgent){
                                    window.localStorage.shopName = userInfo.shops[0].name;
                                    window.localStorage.areaId = userInfo.shops[0].areaId;
                                    window.localStorage.tin = userInfo.shops[0].tin;
                                    var x ={};
                                    x[userInfo.shops[0].tin] = userInfo.shops[0];
                                          window.localStorage.shopInfo = JSON.stringify(x);
                                }
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
                }).catch(function(e){
                    console.log(e);
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
                console.log(data.val());
                var areas = $scope.areasObj = data.val();
                var foo=[];
                for(var area in areas){
                    foo.push({
                        id: area,
                        name: areas[area].displayName
                    })

                }
                $scope.areas = foo;
                $scope.$apply();
                console.log($scope.areas);

            })
        }

        $scope.fillSignUpData = function(){
            var authId = window.localStorage.authId;

            var shops = [];
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

            var foo = {};
            foo = {
                email : $scope.userData.username,
                active:false,
                name : $scope.signUpData.name,
                mobile : $scope.signUpData.mobile,
                isAgent : $scope.signUpData.isAgent,
                address : $scope.signUpData.address,
                authId : authId,
                shops : shops
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
                showPopUp("Please click the SIGN IN button below to login", "CONGRATULATIONS!!");
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
        window.localStorage.clear();
        window.sessionStorage.clear();

    })

    .controller('shopCtrl', function($scope,$http,loginCred,$state,$rootScope,$ionicPopup) {
        var userInfo = {};
        if(window.localStorage.userInfo)
            userInfo = JSON.parse(window.localStorage.userInfo);
        $scope.shopArray = userInfo.shops || [];
        $scope.showShopInput = false;
        var showPopUp = loginCred.showPopup;
        var userId;
        $scope.editType = false;
        $scope.shop = {
        };

        $scope.showNewShopEdit = function () {
            $scope.showShopInput = true;
        };

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
                showPopUp('Enter Shop Tin');
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
            console.log($scope.shop);
            userInfo["shops"].push(JSON.parse(JSON.stringify($scope.shop)));
            saveShop('add');
            $scope.shop = {
                tax_id : {}
            };
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
                }
                else if(type == 'edit'){
                    showPopUp("Shop edited successfully");
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
                $scope.showShopInput = false;
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

        $scope.closeEditBox = function(){
            $scope.showShopInput = false;
            $scope.$apply();
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

        $scope.onInit = function () {
            var areasRef = loginCred.dbRef.child('areas');
            if(window.localStorage.isAgent=="true")
                $scope.addShopEnabled = true;
            else
                $scope.addShopEnabled=false;
            $scope.areasObj = {};
            areasRef.once('value', function (data) {
                console.log(data.val());
                var areas = $scope.areasObj = data.val();
                var foo = [];
                for (var area in areas) {
                    foo.push({
                        id: area,
                        name: areas[area].displayName
                    })

                }
                $scope.areas = foo;
                $scope.$apply();
                console.log($scope.areas);

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

    .controller('cartCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope) {
        if(window.localStorage.isActive === 'false') {
            alert("User not activated. Please contact administrator");
            return;
        }
        var userInfo = JSON.parse(window.localStorage.userInfo);
        var dbRef = loginCred.dbRef;
        var ordersRef =  dbRef.child('orders');
        $scope.getImageUrl = loginCred.getImageUrl;
        var shopInfo = {};
        if(window.localStorage.shopInfo)
            shopInfo = JSON.parse(window.localStorage.shopInfo);
        $scope.deliveryArray = {};
        var selectedLorrySize = $scope.selectedLorrySize = 10;
        $scope.selectedLorrySizeInQuintals=100;
        var progressBarElement = document.getElementById("progressBar");
        var totalQuantity = $scope.totalQuantity = 0;
        var earlySelectedLorry;
        $scope.deliveryArray = [];
        $scope.lorryArray = [3.5,7,10,17,21,25];

        var myPopUp = loginCred.showPopup;

        $scope.init = function(){
            var temp = [];
            if(window.localStorage.cartArray)
                temp = JSON.parse(window.localStorage.cartArray);
            $scope.cartArray = temp || [];
            console.log($scope.cartArray);
            $timeout(function () {
                showInitialPrice();
            },0);
            $rootScope.$broadcast("cached",{});
            //document.getElementById("naviconIcon").className = "button button-icon button-clear ion-navicon";
            //$ionicNavBarDelegate.showBackButton(false);
        };

        var showInitialPrice = function () {
            for(var key in  $scope.cartArray){
                var length = $scope.cartArray[key].length;
                for(var index = 0; index < length; index++) {
                    var pid = $scope.cartArray[key][index].productId;
                    var itemType = $scope.cartArray[key][index].itemType
                    var element = document.getElementById(key + "computedPrice" + pid);
                    var qty = document.getElementById(key + "quantity" + pid).value;
                    var price = $scope.getPrice(pid, itemType) * qty;
                    element.innerHTML = '₹​' + price;
                }
            }
        };

        $scope.setSelectedLorrySize = function(lorry){
            earlySelectedLorry = $scope.selectedLorrySize;
            $scope.selectedLorrySize = selectedLorrySize = lorry;
            $scope.selectedLorrySizeInQuintals=selectedLorrySize*10;
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
                    {   text: 'Cancel',
                        onTap: function(e) {
                            return;
                        }

                    }, {
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
            value.quantity = document.getElementById(key+"quantity"+value.productId).value;
            value.bag = document.getElementById(key+"bag"+value.productId).value;
            value.price = document.getElementById(key+"computedPrice"+value.productId).innerText.trim();
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
            var price = $scope.getPrice(productId,type);
            var quantity =  Number(qtyElement.value);
            document.getElementById(key+"computedPrice"+productId).innerHTML="&#8377;"+quantity*price;
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
        };

        $scope.getImageUrl = loginCred.getImageUrl;

        $scope.addToDelivery = function(key,value,index){
            var buttonElement = document.getElementById(key+"button"+value.productId);
            if(buttonElement.innerHTML.toString().trim() == "ADD"){
                $scope.addToDeliveryArray(key,value,index);
                buttonElement.innerHTML = "REMOVE";
            }else{
                $scope.removeItemFromDeliverable(key,value);
                buttonElement.innerHTML = "ADD";
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
                    y["quintalWeightPrice"] = Math.round((shopOrderItem.price/Number(shopOrderItem.quantity))*100)/100;
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
                x["areaId"] = shopInfo[key].areaId;
                x["totalShopPrice"] = Math.round(totalShopPrice*100) / 100;
                x["totalWeight"] = Number(totalWeight);
                overAllPrice += totalShopPrice;
                overAllWeight += totalWeight;
                arr.push(x);
            }
            cartInfo["grossPrice"] = cartInfo["totalPrice"] = overAllPrice;
            cartInfo["totalWeight"] = overAllWeight;
            cartInfo["shopDetail"] = arr;
            cartInfo["selectedLorrySize"] = $scope.selectedLorrySize;
            console.log(cartInfo);
            window.localStorage.cartInfo = JSON.stringify(cartInfo);
            window.location.hash = "#/app/summary";
        }
        

        $scope.getShopName = function(tin){
            return shopInfo[tin].name;
        }

    })

    .controller('orderCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope) {
        var usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );
        $scope.orderStatusArray = {};  $scope.ordersArray = [];
        $scope.loadOrders = function(){
            usersRef.once('value' ,
                function(data){
                    $scope.ordersArray = data.val().orders;
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
            console.log("show order clicked"+orderId);
            var ordersRef=loginCred.dbRef.child('orders/'+ orderId);
            ordersRef.once('value', function(data){
                $scope.cartArrayOrderDetail = data.val().cart;
                $scope.shopArrayOrderDetail = $scope.cartArrayOrderDetail.shopDetail;
                $scope.$apply();
            });
            
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
            if (x.style.display === 'none') {
                x.style.display = 'block';
            } else {
                x.style.display = 'none';
            }

            if($scope.orderStatusArray[orderId] != null){
                return ;
            }
            var orderUpdatesRef = loginCred.dbRef.child('orders/'+ orderId);
            var foo=[];
            orderUpdatesRef.once('value', function(data){
                var order = data.val();
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
                        var singleMsg = {
                            timestamp : d.getDate() + '-'+monthNames[d.getMonth()] + '-' + d.getFullYear()+' '+ d.getHours() + ':'+ d.getMinutes(),
                            message : updates[ob].updateMsg,
                            messageType : updates[ob].msgType
                        }
                        foo.push(singleMsg);
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
            var a = { orderId : $scope.orderStatusArray[orderId]}
            return a;
        };
    })
     .controller('pricesCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope){

       
         $scope.loadPrices = function(){
            var usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );
         
             var internalVsDisplay = loginCred.dbRef.child('internalVsDisplay');
             internalVsDisplay.once('value', function(data){
                  $scope.intVsDisp=  data.val();
             })
  
              var areas = [];
              usersRef.once('value', function(data){
                 var userobj = data.val();
                 var shops = userobj.shops;
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
             for(j=0;j<areas.length;j++){
                
                (function(j){
                 var ordersRef = loginCred.dbRef.child('priceList/' + areas[j]);
                 ordersRef.once('value', function(data){
                    console.log(areas[j]);
                    var items = data.val();
                    var riceArray = items['rice'];
                    var ravvaArray = items['ravva'];
                    var brokenArray = items['broken'];
                    var foobar ={};
                    var bar=[]; var userType = 'Agent';
                    if(!window.localStorage.isAgent)
                        userType='Outlet';
                    for(product in riceArray){
                        var displayNameOfProduct = $scope.intVsDisp[product];
                        if(displayNameOfProduct ==null)
                            displayNameOfProduct = product;
                         
                          var foo={
                              name:displayNameOfProduct,
                              price:riceArray[product][userType]
                          };
                          bar.push(foo);
                    }
                    foobar['Rice']= bar;
                                       var bar=[]
 
                    for(product in ravvaArray){
                        var displayNameOfProduct = $scope.intVsDisp[product];
                        if(displayNameOfProduct ==null)
                            displayNameOfProduct = product;
                           var foo={
                              name:displayNameOfProduct,
                              price:ravvaArray[product][userType]
                          };
                          bar.push(foo);
                    }
                    foobar['Ravva']= bar;
                                       var bar=[]
 
                    for(product in brokenArray){
                        var displayNameOfProduct = $scope.intVsDisp[product];
                        if(displayNameOfProduct ==null)
                            displayNameOfProduct = product;
                          var foo={
                              name:displayNameOfProduct,
                              price:brokenArray[product][userType]
                          };
                          bar.push(foo);
                    }
                    foobar['Broken']= bar;
                    
                     $scope.pricesForAreas[$scope.intVsDisp[areas[j]]] = foobar;
                     $scope.$apply();
                     console.log($scope.pricesForAreas);
                     $rootScope.$broadcast("cached",{});
                     
                })})(j);
             }
              })
              $rootScope.$broadcast("cached",{});
         };
     })
     
     
     .controller('profileCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope){
       $scope.userProfile={}; var  usersRef ;var userObj;$scope.userProfileView={};
       var showPopup = loginCred.showPopup;
       $scope.onEditProfile = function() {
           $scope.editProfile=true;
       }
        $scope.loadUserProfile = function(){
            usersRef = loginCred.dbRef.child('users/' + window.localStorage.uid );
             usersRef.once('value', function(data){
                 console.log(data.val());
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
       
             })

            
