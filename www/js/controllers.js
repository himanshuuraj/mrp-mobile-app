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
            var cartArray = window.localStorage.cartArray;
            var favouriteObject = window.localStorage.favouriteObject;
            var shopInfoObject = window.localStorage.shopInfo;
            window.localStorage.clear();
            if(cartArray)
                window.localStorage.cartArray = cartArray;
            if(favouriteObject)
                window.localStorage.favouriteObject = favouriteObject;
            if(shopInfoObject)
                window.localStorage.shopInfo = shopInfoObject

            window.sessionStorage.clear();
            window.location.hash = "#/app/loginPage";
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
    .controller('loginPageCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$rootScope,$ionicLoading) {
        
    })

    .controller('constituencyCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$rootScope,$ionicLoading) {

        var dbRef = loginCred.dbRef;

        $scope.selectedData = {
            selectedConstituency : {},
            selectedVariety : {},
            selectedItem : {}
        };

        $scope.showCardType = "viewConstituency";

        $scope.constituencyData = {
            conId1 : {
            name : "conName1",
            id : "conId1",
            state : "S1",
            district : "D1",
            city : "C1",
            agent : [{
                    name : "A1",
                    phoneNumber : "9849123866"
                },
                {
                    name : "A2",
                    phoneNumber : "p!"
                }
            ],
            variety : [
                {
                    id : "paddy",
                    name : "Paddy",
                    item : [
                        {
                            id : "rice1D1",
                            name : "riceName1"
                        },
                        {
                            id : "rice1D2",
                            name : "riceName2"
                        },
                        {
                            id : "rice1D3",
                            name : "riceName3"
                        },
                        {
                            id : "rice1D4",
                            name : "riceName4"
                        }
                    ]
                },
                {
                    id : "wheat",
                    name : "Wheat"
                }
            ] 
            }, 
            conId2 : {
                name : "conName2",
                id : "conId2",
                state : "S2",
                district : "D2",
                city : "C2",
                agent : [{
                        name : "A2",
                        phoneNumber : "9849123866"
                    },
                    {
                        name : "A2",
                        phoneNumber : "p!"
                    }
                ],
                variety : [
                    {
                        id : "paddy",
                        name : "Paddy",
                        item : [
                            {
                                id : "crice1D1",
                                name : "criceName1"
                            },
                            {
                                id : "crice1D2",
                                name : "criceName2"
                            },
                            {
                                id : "crice1D3",
                                name : "criceName3"
                            },
                            {
                                id : "crice1D4",
                                name : "criceName4"
                            }
                        ]
                    },
                    {
                        id : "wheat",
                        name : "Wheat"
                    }
                ] 
            }
        };

        var agentConstituencyArray = [];
        $scope.dailyUpdatedData = {};

        $scope.changeView = function(type){
            $scope.edit = false;
            if(type == 'view'){
                $scope.showCardType = "addConstituency";
                for(var index = 0; index < agentConstituencyArray.length; index++){
                    (function(){
                        let i = index;
                        var dailyPricesRef = dbRef.child('dailyPrices/' + getDateString() + "/" + agentConstituencyArray[i].cId + "/" + window.localStorage.uid);
                        dailyPricesRef.once('value', (data) => {
                            $scope.dailyUpdatedData[agentConstituencyArray[i].cId] = {};
                            $scope.dailyUpdatedData[agentConstituencyArray[i].cId][window.localStorage.uid] = data.val();
                            console.log("UPDATED DATA", $scope.dailyUpdatedData);
                        }).catch(() => {
                            alert("OOPS something went wrong");
                        });
                    })();
                }
            }
            else if(type == "add"){
                $scope.showCardType = "viewConstituency";
                $scope.selectedData.selectedConstituency = {};
            }else if (type == "edit"){
                $scope.showCardType = "viewConstituency";
                $scope.selectedData.selectedItem = $scope.selectedData.selectedVariety.item.filter(data => data.id == $scope.itemDetail.id)[0];
                for(var key in $scope.itemDetail){
                    $scope.selectedData.selectedItem[key] = $scope.itemDetail[key];
                }
                $scope.edit = true;
            }else if(type == "delete"){
                $scope.showCardType = "viewConstituency";
                var str = 'dailyPrices/' + getDateString() + "/" + window.localStorage.uid + "/" + 
                        $scope.selectedData.selectedConstituency.id + "/" + $scope.selectedData.selectedVariety.id + 
                        "/" + $scope.itemDetail.id;
                var dailyPricesRef = dbRef.child(str);
                dailyPricesRef.update({}).then(() => {
                    $scope.itemDetail = {};
                    $scope.selectedData.selectedConstituency = {};
                    $scope.selectedData.selectedVariety = {};
                }).catch(() => {
                    alert("OOPS something went wrong");
                });
            }else if(type == "back"){
                $scope.showCardType = "addConstituency";
            }
        }

        $scope.getItemArray = function(){
            if(!$scope.dailyUpdatedData) return;
            var obj = {};
            if($scope.dailyUpdatedData[$scope.selectedData.selectedConstituency.id] 
                && $scope.selectedData.selectedVariety.id
                    && $scope.dailyUpdatedData[$scope.selectedData.selectedConstituency.id][window.localStorage.uid] 
                        && $scope.dailyUpdatedData[$scope.selectedData.selectedConstituency.id][window.localStorage.uid][$scope.selectedData.selectedVariety.id]
                    )
                obj = $scope.dailyUpdatedData[$scope.selectedData.selectedConstituency.id][window.localStorage.uid][$scope.selectedData.selectedVariety.id];
            // console.log(obj);
            return obj;
        }

        $scope.showDetails = function(itemDetail){
            $scope.showCardType = "showDetails";
            $scope.itemDetail = itemDetail;
        }

        function updateConstituencyData(){
            var usersRef = dbRef.child('constituency');
            usersRef.update($scope.constituencyData).then(() => {
                console.log("UPDATED");
            }).catch(() => {
                alert("OOPS something went wrong");
            });
        }

        function getConstituencyData(){
            var usersRef = dbRef.child('constituency');
            // console.log($scope.constituencyData, "CONSTITUENCY DATA")
            usersRef.once('value', (data) => {
            // usersRef.update($scope.constituencyData).then(() => {
                var constituencyData = {};
                var cData = data.val();
                for(var key in cData){
                    var obj = cData[key];
                    if(obj.agent.findIndex(agent => agent.phoneNumber == window.localStorage.uid) != -1)
                        constituencyData[key] = cData[key];
                }
                $scope.constituencyData = constituencyData;
                console.log($scope.constituencyData);
            }).catch(() => {
                alert("OOPS something went wrong");
            }); 
        }

        $scope.onInit = function(){
            // updateConstituencyData();
            getConstituencyData();
            getAgentConstituency();
        }

        function getAgentConstituency(){
            var usersRef = dbRef.child('users/' + window.localStorage.uid + "/constituency");
            usersRef.once('value', (data) => {
                agentConstituencyArray = data.val();
                console.log(agentConstituencyArray, "CONSTITUENCY ARRAY");
            });
        }

        function updateAgentInfo(){
            var usersRef = dbRef.child('users/' + window.localStorage.uid + "/constituency");
            var obj = [
                { 
                    cId : "conId1",
                    cName : "conName1"
                },
                { 
                    cId : "conId2",
                    cName : "conName2"
                }
            ];
            usersRef.update(obj).then(() => {
                alert("DONE");
            });
        }

        function getDateString(){
            var date = new Date();
            var dd = date.getDate();
            if(dd < 10) dd = "0" + dd;
            var mm = date.getMonth();
            mm += 1;
            if(mm < 10) mm = "0" + mm;
            var yy = date.getFullYear();
            return dd + "-" + mm + "-" + yy;
        }

        $scope.storeData = function(){
            if(!$scope.selectedData.selectedConstituency.id){
                alert("Please select a constituency");
                return;
            }
            var date = getDateString();
            var selectedItem = $scope.selectedData.selectedItem;
            delete selectedItem.$$hashKey;
            var usersRef = dbRef.child('dailyPrices/'+ date + "/" + $scope.selectedData.selectedConstituency.id + "/" + window.localStorage.uid + "/" + $scope.selectedData.selectedVariety.id + "/" + selectedItem.id);
            usersRef.update(selectedItem).then(() => {
                alert("Daily price submitted succesfully");
                $scope.selectedData = {
                    selectedConstituency : {},
                    selectedVariety : {},
                    selectedItem : {}
                };
            }).catch(() => {
                alert("OOPS something went wrong");
            });
        }

    })

    .controller('summaryCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$rootScope,$ionicLoading) {
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

             console.log($scope.cartArray);$scope.totaldiscountedPrice = $scope.totaldiscountedPrice || 0 ;
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
            $scope.totaldiscountedPrice = 0;
            var itemsProcessed = 0;
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
                    shopRavvaWeight += ravvaObjectOrg[prapplyDiscountoductId].weight;
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
                if(window.localStorage.superAgentMobileNum)
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
                         "You can track your order from the orders page","Yay!!");
                populateInfoToSuperAgent();
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
           function populateInfoToSuperAgent(){
               var userInfo=JSON.parse(window.localStorage.userInfo);
                if(userInfo.superAgentMobileNum) {
                    var superAgentsRef = dbRef.child('users/' + userInfo.superAgentMobileNum );
                    superAgentsRef.once('value', function(data){
                        var userValue = data.val();
                        userValue["suborders"] = userValue["suborders"] || {};
                        userValue["suborders"][window.localStorage.uid]=userValue["suborders"][window.localStorage.uid] || {};
                        userValue["suborders"][window.localStorage.uid][orderId] = JSON.parse(window.localstorage.userInfo).name;
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
                console.log('orderid is ' + orderId);
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
    })

    .controller('searchCtrl', function($scope,$http,loginCred,$state,$ionicPopup,$timeout,$interval,$rootScope) {
        if(window.localStorage.isActive === 'false') {
            alert("User not activated. Please contact administrator");
            return;
        }
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
        $scope.tabArray = ['rice','ravva','broken'];
        $scope.isAgent = window.localStorage.isAgent;
        if(window.localStorage.isAgent == "true")
            $scope.isAgent = true;
        else
            $scope.isAgent = false;
        var shopInfo = {}; var userInfo= JSON.parse(window.localStorage.userInfo);
        
        
        if(window.localStorage.shopInfo)
            shopInfo = JSON.parse(window.localStorage.shopInfo);
        $scope.selectedItem = "rice";
        var getShopData = function(){
            var id = uid;
            if(userInfo.superAgentMobileNum){
                id= userInfo.superAgentMobileNum;
            }
            var shopsRef = dbRef.child('users/'+id + '/shops');
            shopsRef.once('value', function(snap) {
                existingShops = snap.val();
                if(!$scope.isAgent && existingShops.length == 1){
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
                //console.log(existingShops);
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
          //existingShops = existingShops || [];
          if(userInfo.shops.length > 1)
            return true;
          return false;
        }

        var updateFavourites = function(){
            $scope.favouriteObject = $scope.favouriteObject || [];
            var totalItemInFavouries = $scope.favouriteObject.length;
            if(totalItemInFavouries > 0){
                var favouriteElement = document.getElementById("addToFavouriteLogo");
                //var favouriteTextElement = document.getElementById("addToFavouriteText");
                //favouriteTextElement.innerHTML = totalItemInFavouries;
                favouriteElement.style.color = "red";
            }else{
                var favouriteElement = document.getElementById("addToFavouriteLogo");
                //var favouriteTextElement = document.getElementById("addToFavouriteText");
                //favouriteTextElement.innerHTML = "";
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
            //console.log($scope.showFavouriteFlag);
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
            $scope.brokenPriceArray = priceArray['broken'];
            $scope.ravvaPriceArray = priceArray['ravva'];
            $scope.ricePriceArray = priceArray['rice'];
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
                            //console.log($scope.shopArray);
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
                price = price.toString(); // array to string

                tickElement.className='button icon ion-checkmark-round';
                tickElement.style.backgroundColor="#388e3c"
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
            //console.log($scope.cartArray);
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

                $scope.brokenObject = productsList.broken;
                $scope.ravvaObject = productsList.ravva;
                $scope.riceObject = productsList.rice;

                var riceItemsPriorityArray = [];
                for(var productId in $scope.riceObject) {
                    var prty = $scope.riceObject[productId]['priority'] || 0;
                    riceItemsPriorityArray.push({
                        'key': productId,
                        'value' : prty
                    });
                }
                riceItemsPriorityArray.sort(function(a,b){
                    return a.value - b.value;
                })
                $scope.riceArray = [];

                riceItemsPriorityArray.forEach(function(entry){
                    var ob={};
                    ob[entry.key]=$scope.riceObject[entry.key];
                    $scope.riceArray.push(ob);
                })
                window.localStorage.riceItemsPriorityArray = JSON.stringify(riceItemsPriorityArray)
                //ravva
                 var ravvaItemsPriorityArray = [];
                for(var productId in $scope.ravvaObject) {
                    var prty = $scope.ravvaObject[productId]['priority'] || 0;
                    ravvaItemsPriorityArray.push({
                        'key': productId,
                        'value' : prty
                    });
                }
                ravvaItemsPriorityArray.sort(function(a,b){
                    return a.value - b.value;
                })
                $scope.ravvaArray = [];

                ravvaItemsPriorityArray.forEach(function(entry){
                    var ob={};
                    ob[entry.key]=$scope.ravvaObject[entry.key];
                    $scope.ravvaArray.push(ob);
                })
                window.localStorage.ravvaItemsPriorityArray = JSON.stringify(ravvaItemsPriorityArray)
                //broken
                 var brokenItemsPriorityArray = [];
                for(var productId in $scope.brokenObject) {
                    var prty = $scope.brokenObject[productId]['priority'] || 0;
                    brokenItemsPriorityArray.push({
                        'key': productId,
                        'value' : prty
                    });
                }
                brokenItemsPriorityArray.sort(function(a,b){
                    return a.value - b.value;
                })
                $scope.brokenItemsArray = [];

                brokenItemsPriorityArray.forEach(function(entry){
                    var ob={};
                    ob[entry.key]=$scope.brokenObject[entry.key];
                    $scope.brokenItemsArray.push(ob);
                });
                window.localStorage.brokenItemsPriorityArray = JSON.stringify(brokenItemsPriorityArray)
                if(!$scope.$$phase) {
                    $scope.$apply();
                }

            });

        };

        $scope.getPrice = function(key){
            //
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

            //var x = document.getElementById(key+"buy");

            if(price == 'N/A'){
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
                $scope.brokenPriceArray = productsList.broken;
                $scope.ravvaPriceArray = productsList.ravva;
                $scope.ricePriceArray = productsList.rice;
                var tin  = window.localStorage.tin;
                if(!tin)
                    return;
                var x= window.localStorage.priceArray ? JSON.parse(window.localStorage.priceArray) : {};
                x[tin] = {'rice' : productsList.rice,
                    'ravva': productsList.ravva,
                    'broken': productsList.broken
                     } ;
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
            document.getElementById('brokentab').className='button';
            document.getElementById('ravvatab').className='button';
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
                    //animateElement.className = "widthFull animatewidthfull";
                    animateElement.className = "widthZero";// animatewidthzero";
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

    .controller('loginCtrl', function($scope,$http,$state,loginCred,$rootScope,$ionicNavBarDelegate,$cordovaToast,$ionicSideMenuDelegate) {
        var dbRef = loginCred.dbRef;
        var authRef = loginCred.authRef;
        $scope.userData = {};
        $scope.otpLogin=false;
        $scope.loginAgain = false;
        var showPopUp = loginCred.showPopup;
        $scope.isChecked = true;
        var userInfo;
        var uid;
        $scope.page = 'first';
        $scope.number;
        $scope.signUpData = {
            isAgent : true,
            shop :{
            }
        };
        $scope.otp = "";

        $scope.gotoEmailSignIn = function(){
            window.location.hash = "#/app/login";
        }

          $scope.gotoMobileSignIn = function(){
            window.location.hash = "#/app/loginPage";
        }

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
         $scope.onSignupUsingMobile = function() {
             window.location.hash="#/app/login";
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

        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('myOption', {
                    'size': 'invisible',
                    'callback': function(response) {
                  //  $scope.onClickButton();
            }
        });

        $scope.sendOTP = function() {
            $scope.page = 'second';
            var phoneNumber   = '+91'+ $scope.userData.mobileNumber || $scope.mobileNumber;
                var appVerifier = window.recaptchaVerifier;
                firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
                    .then(function (confirmationResult) {
                    window.confirmationResult = confirmationResult;
                }).catch(function (error) {
                    console.log(error);
                    showPopUp("Could not send OTP. Please try again");
                 });
        };

        $scope.back = function(){
          $scope.page = 'first';
        }

        $scope.ontoggleToOTPLogin = function(){
            $scope.otpLogin=true;
        };
        $scope.ontoggleToEmailLogin = function(){
            $scope.otpLogin=false;
        };

        $scope.onClickButton = function() {
            var buttonText = document.getElementById('myOption').textContent;
                         var self=this;
              var getMobileNumberFromAuthMobileMap = function(uuid){

              var mobileNum=$scope.userData.mobileNumber;
              if(mobileNum!=null) {
                //check if existing user
                var usersRef = dbRef.child('users/' +  mobileNum);
                 usersRef.once('value', function(data){
                     data=data.val()
                     if(data){
                          var userInfo =data;
                                window.localStorage.userInfo = JSON.stringify(data);
                               
                                if(userInfo.superAgentMobileNum){
                                        var shopsRef = dbRef.child('users/'+userInfo.superAgentMobileNum + '/shops');
                                        shopsRef.once('value', function(snap) {
                                            var superAgentShops = snap.val();
                                            var uInfo = JSON.parse(window.localStorage.userInfo);
                                            uInfo.shops=superAgentShops;
                                            window.localStorage.userInfo = JSON.stringify(uInfo);
                                        })
                                }
                                    
                                $scope.isAgent = window.localStorage.isAgent = data.isAgent;
                                window.localStorage.isActive = data.active;
                                window.localStorage.uid=mobileNum;
                                $rootScope.$broadcast('isAgent',{});
                                if(!userInfo.isAgent && userInfo.shops && userInfo.shops.length == 1){
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
                          var authIdMobileMapRef = dbRef.child('authMobileMap/' + uuid);
                          var promiseFromAuthMobile = authIdMobileMapRef.set(mobileNum);
                          promiseFromAuthMobile.then(function(e){
                            console.log("Successfully added mobile mapping to the auth id");
                            window.localstorage.uid=mobileNumber;
                         }).catch(e => console.log("Could not add mobile mapping"));

                     }else{
                         //user signed up using mobile
                     var authMobileRef = dbRef.child('authMobileMap/'+ uuid);
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
                                            var superAgentShops = snap.val();
                                            var uInfo = JSON.parse(window.localStorage.userInfo);
                                            uInfo.shops=superAgentShops;
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

                     }

                 })
             }else{

              var authMobileRef = dbRef.child('authMobileMap/'+ uuid);
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
                                            var superAgentShops = snap.val();
                                            var uInfo = JSON.parse(window.localStorage.userInfo);
                                            uInfo.shops=superAgentShops;
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
                }

            };


            if(buttonText == 'SIGN IN') {

                if($scope.userData.otp) {
                    var confirmationResult =  window.confirmationResult;
                    var otp = $scope.userData.otp;
                    otp=otp.toString();
                    confirmationResult.confirm(otp).then(function (result) {
                        var uid = result.user.uid;

                            getMobileNumberFromAuthMobileMap(uid);


                    }).catch(function (error) {
                     showPopUp("Invalid login. Please try again");
                    });
                }else{
                    if(!$scope.userData.password || !$scope.userData.username){
                    //showPopUp("Please fill the required info");
                    $scope.showToast('this is a test', 'long', 'center');
                    return;
                    }
                      var promise = authRef.signInWithEmailAndPassword($scope.userData.username,$scope.userData.password);
                promise.then(function(e) {
                    getMobileNumberFromAuthMobileMap(e.uid);
                }).catch(
                    function(e){
                        showPopUp("Username password doesnt match");
                        console.log(e);
                    });
                }

            }else {

                 if($scope.userData.otp) {
                    var confirmationResult =  window.confirmationResult;
                    var otp = $scope.userData.otp;
                    otp=otp.toString();
                    confirmationResult.confirm(otp).then(function (result) {
                        var uid = result.user.uid;
                        window.localStorage.authId = uid;
                        $scope.showUserInputField = true;
                        $scope.$apply();
                    }).catch(function (error) {
                     showPopUp("Invalid login. Please try again");
                    });
                }else{

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
                                showPopUp(e)
                            });
                }
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
                $scope.areas = foo;
                $scope.$apply();
            });
        }

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
            if($scope.userData.mobileNumber != null)
                $scope.userData.username=$scope.userData.mobileNumber;
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
            
            
            if($scope.signUpData.superAgentMobile) {
               foo.superAgentMobileNum=$scope.signUpData.superAgentMobile;
            }
             createUser(foo);
          

        };

        var createUser = function(foo){
            var authId = window.localStorage.authId;
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
                if($scope.mobileSignup){
                    window.location.hash="#/app/loginPage";
                    $scope.page = 'first';
                    showPopUp("Please Sign In", "CONGRATULATIONS!!");
                    window.recaptchaVerifier = null;
                    window.recaptcha = null;
                    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('myOption', {
                                'size': 'invisible',
                                'callback': function(response) {
                              //  $scope.onClickButton();
                        }
                    });

                }else{
                    showPopUp("Please click the SIGN IN button below to login", "CONGRATULATIONS!!");
                }

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

        $scope.clickOnToggle = function(param){

            if(param == 'false'){
                $scope.mobileSignup = "false";
                document.getElementById("signUpSpan").style.color = "#B2B2B2";
                document.getElementById("loginDiv").style.cssText = "margin-top:65%;text-align: center;padding:4%;background-color: #065f2c;z-index: 1;border-radius: 10px;box-shadow: 2px 2px 1px #888888;";
                document.getElementById("SignupDiv").style.cssText = "margin-top:65%;text-align: center;padding:4%;";
                document.getElementById("myOption").textContent="SIGN IN";
            }else{
                $scope.mobileSignup = "true";
                document.getElementById("loginSpan").style.color = "#B2B2B2";
                document.getElementById("loginDiv").style.cssText = "margin-top:65%;text-align: center;padding:4%;";
                document.getElementById("SignupDiv").style.cssText = "margin-top:65%;text-align: center;padding:4%;background-color: #065f2c;z-index: 1;border-radius: 10px;box-shadow: 2px 2px 1px #888888;";
                document.getElementById("myOption").textContent="SIGN UP";

            }
//            $scope.$apply();

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

    })

    .controller('shopCtrl', function($scope,$http,loginCred,$state,$rootScope,$ionicPopup) {
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
            saveShop('edit');
        };

        $scope.onInit = function () {
            var areasRef = loginCred.dbRef.child('areas');
            
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
                var foo = [];
                for (var area in areas) {
                    foo.push({
                        id: area,
                        name: areas[area].displayName
                    })

                }
                $scope.areas = foo;
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
                $scope.$apply();
            });

            $timeout(function () {
                    showInitialPrice();
            },1);
            $rootScope.$broadcast("cached",{});


        };

        $scope.moveSubAgentOrderToCart = function(subAgentMobileNum,orderId){
            var ordersRef = loginCred.dbRef.child('orders/'+ orderId);
            ordersRef.once('value', function(order){
                var shopDetailArray = order.val().cart.shopDetail;
                shopDetailArray.forEach(function(eachShop){
                    var tin= eachShop.tin;var areaId=eachShop.areaId;
                    fetchPriceForEachShop(areaId,tin);
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

                    var itemsInEachShop = eachShop.items;
                    var riceItems=itemsInEachShop.rice;
                    var ravvaItems = itemsInEachShop.ravva;
                    var brokenItems = itemsInEachShop.broken;
                    for(var productId in riceItems){
                        var riceProductObject = riceItems[productId];
                        var ob = {};
                        ob.itemType = "rice";
                        ob.bag = riceProductObject.bags;
                        ob.master_weight = Number(riceProductObject.weight)*100/Number(riceProductObject.bags)+'KG';
                        ob.name=riceProductObject.name;
                        ob.price=riceProductObject.price;
                        ob.productId=productId;
                        ob.quantity=riceProductObject.weight;
                       var existingObjects = $scope.cartArray[tin] || [];
                       existingObjects.push(ob);
                       $scope.cartArray[tin] = existingObjects;

                    }
                    for(var productId in brokenItems){
                        var brokenProductObject = brokenItems[productId];
                        var ob = {};
                        ob.itemType = "broken";
                        ob.bag = brokenProductObject.bags;
                        ob.master_weight = Number(brokenProductObject.weight)*100/Number(brokenProductObject.bags)+'KG';
                        ob.name=brokenProductObject.name;
                        ob.price=brokenProductObject.price;
                        ob.productId=productId;
                        ob.quantity=brokenProductObject.weight;
                         var existingObjects = $scope.cartArray[tin] || [];
                       existingObjects.push(ob);
                       $scope.cartArray[tin] = existingObjects;
                    }
                    for(var productId in ravvaItems){
                        var ravvaProductObject = ravvaItems[productId];
                        var ob = {};
                        ob.itemType = "ravva";
                        ob.bag = ravvaProductObject.bags;
                        ob.master_weight = Number(ravvaProductObject.weight)*100/Number(ravvaProductObject.bags)+'KG';
                        ob.name=ravvaProductObject.name;
                        ob.price=ravvaProductObject.price;
                        ob.productId=productId;
                        ob.quantity=ravvaProductObject.weight;
                        var existingObjects = $scope.cartArray[tin] || [];
                       existingObjects.push(ob);
                       $scope.cartArray[tin] = existingObjects;
                    }
                    $scope.$apply();
                    window.localStorage.cartArray=JSON.stringify($scope.cartArray);
                     $timeout(function () {
                        showInitialPrice();
                    },1);
                }
                );


            });
//            var subAgentOrdersRef = loginCred.dbRef.child('users/'+ window.localStorage.uid +
//                    '/suborders/'+subAgentMobileNum + '/' +orderId);
//            subAgentOrdersRef.remove();
        };

        var fetchPriceForEachShop = function(areaId,tin){
            var areaRef = dbRef.child('priceList/'+ areaId);
            areaRef.on('value',function(areaSnapshot){
                var productsList = areaSnapshot.val();
                $scope.brokenPriceArray = productsList.broken;
                $scope.ravvaPriceArray = productsList.ravva;
                $scope.ricePriceArray = productsList.rice;

                 var existingPriceArray = {};
                if(window.localStorage.priceArray)
                    var existingPriceArray = JSON.parse(window.localStorage.priceArray);
                existingPriceArray[tin]={'rice' : productsList.rice,
                    'ravva': productsList.ravva,
                    'broken': productsList.broken
                     } ;
                window.localStorage.priceArray = JSON.stringify(existingPriceArray);
            });
        }

        $scope.deleteSubAgentOrder = function(subAgentMobileNum, orderId){
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
                console.log('Tapped!', res);
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
            //console.log($scope.deliveryArray);
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
            return shopInfo[tin] != null ? shopInfo[tin].name : '';
        }

    })

    .controller('orderCtrl', function($scope,$http,$stateParams,loginCred,$ionicNavBarDelegate,$ionicPopup,$timeout,$rootScope) {
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
            console.log(shopObjectsGroup);
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
            var a = { orderId : $scope.orderStatusArray[orderId]};
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
