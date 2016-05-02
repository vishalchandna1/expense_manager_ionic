angular.module('controllers', [])
    .directive('dividerCollectionRepeat', function($parse) {
        return {
            priority: 1001,
            compile: compile
        };

        function compile(element, attr) {
            var height = attr.itemHeight || '73';
            attr.$set('itemHeight', 'item.isDivider ? 37 : ' + height);

            element.children().attr('ng-hide', 'item.isDivider');
            element.prepend(
                '<div style="background-color: #886aea;color:white"class="item item-divider ng-hide" ng-show="item.isDivider" ng-bind="item.divider"></div>'
            );
        }
    })
    .filter('groupByMonthYear', function($parse) {
        var dividers = {};

        return function(input) {
            if (!input || !input.length) return;

            var output = [],
                previousDate,
                currentDate;

            for (var i = 0, ii = input.length; i < ii && (item = input[i]); i++) {
                currentDate = moment(item.date);
                if (!previousDate ||
                    currentDate.month() != previousDate.month() ||
                    currentDate.year() != previousDate.year()) {

                    var dividerId = currentDate.format('MMYYYY');

                    if (!dividers[dividerId]) {
                        dividers[dividerId] = {
                            isDivider: true,
                            divider: currentDate.format('MMMM YYYY')
                        };
                    }

                    output.push(dividers[dividerId]);
                }

                output.push(item);
                previousDate = currentDate;
            }

            return output;
        };
    })
    .filter('category', function() {
        return function(input, cat) {
            var out = [];
            angular.forEach(input, function(language) {
                if (language.catText === cat) {
                    out.push(language)
                }
            })
            return out;
        }
    })
    .factory('DBService', function($q) {
        var DB;


        var Data;

        return {
            initDB: initDB,
            getData: getData,
            addData: addData,
            updateData: updateData,
            deleteData: deleteData
        };

        function initDB() {

            DB = new PouchDB('Data', {
                adapter: 'websql'
            });
            console.log(DB)
        }

        function addData(expense) {
            return $q.when(DB.post(expense));
        }

        function updateData(expense, e) {
            DB.put(expense, e);
        }

        function deleteData(expense) {

            return $q.when(DB.remove(expense));

        }

        function getData(expense) {
            //if(!Data){
            return $q.when(DB.allDocs({
                    include_docs: true
                }))
                .then(function(docs) {

                    Data = docs.rows.map(function(row) {
                        console.log(row.doc.date);
                        row.doc.date = new Date(row.doc.date);
                        console.log(row.doc.date.toString().substring(0, 16));
                        return row.doc;

                    });




                    return Data;
                });
        }
        // }

    })
    .controller('AppCtrl', function($scope, $ionicPlatform, $ionicModal, $timeout, $cordovaSQLite, DBService) {
        DBService.initDB();


        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;

        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function() {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };
    })

.controller('overviewCtrl', function($scope, $rootScope, $state, DBService, $timeout, UserService) {
    $scope.vm = {};
    var date = new Date();
    $scope.months = [];
    $scope.showBudgetVariables = false;
    $scope.selectedMonth = 'Current Month'
    $scope.totalBudget = 0;
    $scope.totalExpense = 0;
    $scope.overSpent = false;
    var budgetData = UserService.getBudget().data;

    var showBudgetInfo = function(month, year) {
      budgetData = UserService.getBudget().data;
        for (var i = 0; i < budgetData.length; i++) {
            if (year == (new Date(budgetData[i].currentDate)).getFullYear() &&
                month == (new Date(budgetData[i].currentDate)).getMonth()) {
                $scope.totalBudget = budgetData[i].value;
                $scope.showBudgetVariables = true;
                if (($scope.totalBudget - $scope.totalExpense >= 0))
                    $scope.overSpent = false;
                else
                    $scope.overSpent = true;
            }
        }
    }

    $scope.graphData = [0, 0, 0, 0, 0, 0, 0, 0];
    var insertCorrespondingGraphData = function(object) {
        $scope.totalExpense += object.debitAmount;
        if (object.catText == 'Food') {
            $scope.graphData[0] += object.debitAmount;
        } else if (object.catText == 'Electronic Bills') {
            $scope.graphData[1] += object.debitAmount;
        } else if (object.catText == 'Family') {
            $scope.graphData[2] += object.debitAmount;
        } else if (object.catText == 'Automobile') {
            $scope.graphData[3] += object.debitAmount;
        } else if (object.catText == 'Entertainment') {
            $scope.graphData[4] += object.debitAmount;
        } else if (object.catText == 'Health Care') {
            $scope.graphData[5] += object.debitAmount;
        } else if (object.catText == 'Money Transfer') {
            $scope.graphData[6] += object.debitAmount;
        } else if (object.catText == 'Other') {
            $scope.graphData[7] += object.debitAmount;
        }

    }
   
    var getGraphData = function(month, year) {


        console.log($scope.selectedMonth)
        $scope.graphData = [0, 0, 0, 0, 0, 0, 0, 0];
        $scope.totalBudget = 0;
        $scope.totalExpense = 0;
        $scope.overSpent = false;
        $scope.showBudgetVariables = false;

        for (var i = 0; i < $scope.data.length; i++) {
          
                if ($scope.months[$scope.months.length - 1].getMonth() != $scope.data[i].date.getMonth()) {
                    $scope.months.push($scope.data[i].date);
                }


            if ($scope.data[i].date.getFullYear() == year) {
                if ($scope.data[i].date.getMonth() == month) {
                    insertCorrespondingGraphData($scope.data[i]);

                }
            }

        }
        console.log($scope.graphData);
        temp = false;

    }
    $scope.chooseMonth = function(month) {
        console.log((new Date(month)).getMonth())
        $scope.selectedMonth = month;

        getGraphData((new Date($scope.selectedMonth)).getMonth(), (new Date($scope.selectedMonth)).getFullYear());
        showBudgetInfo((new Date($scope.selectedMonth)).getMonth(), (new Date($scope.selectedMonth)).getFullYear());

        showGraph();
    }
    $rootScope.$on('$ionicView.enter', function() {
        $timeout(function() {
            $scope.graphData = [0, 0, 0, 0, 0, 0, 0, 0];
            DBService.getData().then(function(snap) {
                var d = snap;
                d.sort(function(date1, date2) {
                    if (date1.date > date2.date) return -1;
                    if (date1.date < date2.date) return 1;
                    return 0;
                })
                $scope.data = d;
                $scope.months = [];

                if ($scope.data.length > 0) {
                    $scope.selectedMonth = $scope.data[0].date;
                    $scope.months.push($scope.data[0].date);
                }
                getGraphData($scope.selectedMonth.getMonth(), $scope.selectedMonth.getFullYear());
                showBudgetInfo($scope.selectedMonth.getMonth(), $scope.selectedMonth.getFullYear());
                showGraph();
            });
        }, 10);
    });




    var showGraph = function() {


        $scope.vm.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 300,
                margin: {
                    left: 90
                },
                x: function(d) {
                    return d.label;
                },
                y: function(d) {
                    return d.value;
                },
                showYAxis: false,
                showControls: false,
                showValues: false,
                duration: 500,
                stacked: false,
                barColor: function(d, i) {
                    var colors = d3.scale.category20().range();
                    var rnd = Math.floor(Math.random() * colors.length)
                    return colors[rnd];
                },
                multibar: {
                    dispatch: {

                        elementClick: function(e) {

                        },

                    }
                },
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {

                    tickFormat: function(d) {
                        return d3.format(',.2f')(d);
                    }
                }
            }
        };
        console.log($scope.graphData)

        $scope.vm.data = [{
            'key': "Current Month",

            'values': [{
                'label': 'Food',
                'value': $scope.graphData[0]
            }, {
                'label': 'Electronic Bills',
                'value': $scope.graphData[1]
            }, {
                'label': 'Family',
                'value': $scope.graphData[2]
            }, {
                'label': 'Automobile',
                'value': $scope.graphData[3]
            }, {
                'label': 'Entertainment',
                'value': $scope.graphData[4]
            }, {
                'label': 'Health Care',
                'value': $scope.graphData[5]
            }, {
                'label': 'Money Transfer',
                'value': $scope.graphData[6]
            }, {
                'label': 'Other',
                'value': $scope.graphData[7]
            }]
        }];
        $scope.vm.budgetOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 120,
                x: function(d) {
                    return d.label;
                },
                y: function(d) {
                    return d.value;
                },
                margin: {
                    left: 110
                },
                showYAxis: false,
                showControls: false,
                showValues: true,
                duration: 500,
                stacked: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {


                },
                barColor: function(d, i) {
                    var colors = d3.scale.category20().range();
                    var rnd = Math.floor(Math.random() * colors.length)
                    return colors[rnd];
                },
            }
        };
        $scope.vm.budgetData = [{
            'key': "Expense",

            'values': [{
                'label': 'Expense vs Budget',
                'value': $scope.totalExpense
            }]
        }, {
            'key': "Budget",

            'values': [{
                'label': 'Expense vs Budget',
                'value': $scope.totalBudget
            }]
        }];

    }




    $scope.addExpense = function() {
        $state.go('app.postExpense')
    }



    /*$scope.vm.options.chart.multiBarHorizontalChart.dispatch.on("elementClick", function(e) {
    console.log(e);
  });
*/
})

.controller('postExpenseCtrl', function($scope, $state, $stateParams, DBService, $timeout) {

    $scope.expense = {
        catText: 'Choose Category',
        date: new Date()
    };
    $scope.expense.catText = 'Choose Category';


    $scope.chooseCat = function(cat) {
        $scope.expense.catText = cat;

    }
    var currentDate = new Date();
    var datePickerCallback = function(val) {
        if (typeof(val) === 'undefined') {
            console.log('No date selected');
            $scope.expense.date = currentDate;
        } else {
            $scope.expense.date = val;
        }
    };

    $scope.datepickerObject = {
        titleLabel: 'Choose Date',
        todayLabel: 'Today',
        closeLabel: 'Close',
        setLabel: 'Set',
        setButtonType: 'button-assertive',
        todayButtonType: 'button-assertive',
        closeButtonType: 'button-assertive',
        inputDate: $scope.expense.date,

        templateType: 'popup',
        showTodayButton: 'true',
        modalHeaderColor: 'bar-assertive',
        modalFooterColor: 'bar-assertive',
        from: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getUTCDay() + 10),
        to: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getUTCDay() - 10),
        callback: function(val) { //Mandatory
            datePickerCallback(val);
        },
        dateFormat: 'dd-MM-yyyy',
        closeOnSelect: true,
    };


    $scope.addExpenseToDB = function() {
        //console.log($scope.expense);
        $scope.expense.date = $scope.expense.date;
        if ($scope.expense.catText == 'Choose Category')
            $scope.expense.catText = 'Other';
        DBService.addData($scope.expense);

        console.log($scope.expense.date);

        //DBService.deleteData('D9928BF5-9812-A98C-B7C7-9D0539EC0CED');
        $timeout(function() {
            console.log(DBService.getData());
            $state.go('app.overview')
        }, 500)
    }
})
    .controller('historyCtrl', function($scope, $stateParams, DBService, $timeout) {
        $scope.$on('$ionicView.enter', function() {

            DBService.getData().then(function(snap) {
                var d = snap;
                d.sort(function(date1, date2) {
                    if (date1.date > date2.date) return -1;
                    if (date1.date < date2.date) return 1;
                    return 0;
                })
                $scope.data = d;
                console.log(d)
            });

        });





    })
    .controller('categoriesCtrl', function($scope, $rootScope, $state, $stateParams, DBService) {
        $rootScope.$on('$ionicView.enter', function() {

            DBService.getData().then(function(snap) {
                var d = snap;
                d.sort(function(date1, date2) {
                    if (date1.date > date2.date) return -1;
                    if (date1.date < date2.date) return 1;
                    return 0;
                })
                $scope.data = d;

            });

        });
        $scope.goToCat = function(cat) {
            console.log($scope.data);
            $state.go('app.category', {
                data: $scope.data,
                cat: cat
            });
        }
    })
    .controller('categoryCtrl', function($scope, $stateParams) {
        console.log($stateParams.data);
        $scope.data = $stateParams.data;
        $scope.cat = $stateParams.cat;
    })

.controller('statisticsCtrl', function($scope, $rootScope, $timeout, DBService, $stateParams) {
    $scope.selectedMonth = "Current Month";
    $scope.chooseMonth = function(month) {
        console.log((new Date(month)).getMonth())
        $scope.selectedMonth = month;

        pieChartData((new Date($scope.selectedMonth)).getMonth(), (new Date($scope.selectedMonth)).getFullYear());

    }
    var currentDate = new Date();
    $rootScope.$on('$ionicView.enter', function() {

        DBService.getData().then(function(snap) {
            var d = snap;
            d.sort(function(date1, date2) {
                if (date1.date > date2.date) return -1;
                if (date1.date < date2.date) return 1;
                return 0;
            })
            $scope.data = d;
            $scope.months = [];

            if ($scope.data.length > 0) {
                $scope.months.push($scope.data[0].date);
                $scope.selectedMonth = $scope.data[0].date;
                console.log($scope.selectedMonth)
            }
            for (var i = 0; i < $scope.data.length; i++) {
                if ($scope.months[$scope.months.length - 1].getMonth() != $scope.data[i].date.getMonth()) {
                    $scope.months.push($scope.data[i].date);
                }
            }
            console.log($scope.months)


            pieChartData($scope.selectedMonth.getMonth(), $scope.selectedMonth.getFullYear());
            showLineChart();


        });

    });

    var showPieChart = function() {
        $scope.pieChartOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d) {
                    return d.key;
                },
                y: function(d) {
                    return d.y;
                },
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,


                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };
        $scope.pieChartData = [{
            key: "Food",
            y: $scope.pieChartData1[0]
        }, {
            key: "Electronic Bills",
            y: $scope.pieChartData1[1]
        }, {
            key: "Family",
            y: $scope.pieChartData1[2]
        }, {
            key: "Automobile",
            y: $scope.pieChartData1[3]
        }, {
            key: "Entertainment",
            y: $scope.pieChartData1[4]
        }, {
            key: "Health Care",
            y: $scope.pieChartData1[5]
        }, {
            key: "Money Transfer",
            y: $scope.pieChartData1[6]
        }, {
            key: "Other",
            y: $scope.pieChartData1[7]
        }];
    }

    var insertCorrespondingPieChartData = function(object) {

        if (object.catText == 'Food') {
            $scope.pieChartData1[0] += object.debitAmount;
        } else if (object.catText == 'Electronic Bills') {
            $scope.pieChartData1[1] += object.debitAmount;
        } else if (object.catText == 'Family') {
            $scope.pieChartData1[2] += object.debitAmount;
        } else if (object.catText == 'Automobile') {
            $scope.pieChartData1[3] += object.debitAmount;
        } else if (object.catText == 'Entertainment') {
            $scope.pieChartData1[4] += object.debitAmount;
        } else if (object.catText == 'Health Care') {
            $scope.pieChartData1[5] += object.debitAmount;
        } else if (object.catText == 'Money Transfer') {
            $scope.pieChartData1[6] += object.debitAmount;
        } else if (object.catText == 'Other') {
            $scope.pieChartData1[7] += object.debitAmount;
        }

    }
    var pieChartData = function(month, year) {
        $scope.pieChartData1 = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < $scope.data.length - 1; i++) {

            if ($scope.data[i].date.getFullYear() == year) {
                if ($scope.data[i].date.getMonth() == month)
                    insertCorrespondingPieChartData($scope.data[i]);

            }
        }
        console.log($scope.pieChartData1)
        showPieChart();
    }

    var showLineChart = function() {
        $scope.lineChartOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function(d) {
                    return d.x;
                },
                y: function(d) {
                    return d.y;
                },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e) {
                        console.log("stateChange");
                    },
                    changeState: function(e) {
                        console.log("changeState");
                    },
                    tooltipShow: function(e) {
                        console.log("tooltipShow");
                    },
                    tooltipHide: function(e) {
                        console.log("tooltipHide");
                    }
                },
                xAxis: {
                    axisLabel: 'nth Expense(Latest-->)'
                },
                yAxis: {
                    axisLabel: 'Expense',
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -10
                },
                callback: function(chart) {
                    console.log("!!! lineChart callback !!!");
                }
            }


        };
        $scope.lineChartData = function() {
            var expenseData = [],
                budgetData = [];
            for (var i = $scope.data.length - 1; i >= 0; i--) {
                expenseData.push({
                    x: i,
                    y: $scope.data[i].debitAmount
                })
                console.log('i= ' + i + ' data= ' + $scope.data[i].debitAmount);
            }

            return [{
                values: expenseData, //values - represents the array of {x,y} data points
                key: 'Expense', //key  - the name of the series.
                color: '#ff7f0e', //color - optional: choose your own line color.
                strokeWidth: 2,
                classed: 'dashed'
            }];
        }
    }
})

.controller('budgetCtrl', function($scope, $stateParams) {

})
    .service('UserService', function($ionicLoading) {

        var startLoading = function() {
            $ionicLoading.show({
                template: '<ion-spinner style = "stroke:#ffffff;fill: #ffffff;" icon="lines"></ion-spinner>',
                animation: 'fade-in'

            });
        }
        var stopLoading = function() {
            $ionicLoading.hide();
        }


        var setUser = function(user_data) {
            window.localStorage.budgetStorage = JSON.stringify(user_data);
        };
        var getUser = function() {

            console.log(window.localStorage)
            return JSON.parse(window.localStorage.budgetStorage || '{}');
        };

        return {
            getBudget: getUser,
            setBudget: setUser,
            startLoading: startLoading,
            stopLoading: stopLoading
        };
    })
    .controller('setExpenseCtrl', function($scope,$rootScope, $timeout,$stateParams, UserService, $state) {
        $scope.budget = {};
        $scope.budget.currentDate = new Date();
        $scope.dataAvailable=false;

        $rootScope.$on('$ionicView.enter', function() {
            var budgetData = UserService.getBudget().data;
            if (budgetData == undefined)
                UserService.setBudget({
                    data: []
                });
            $scope.budgetHistory = UserService.getBudget().data;
            $scope.storeBudget = function() {
                var temp = UserService.getBudget().data;
                if ($scope.budget.value != undefined) {
                    for (var i = 0; i < temp.length; i++) {
                        if ($scope.budget.currentDate.getMonth() == (new Date(temp[i].currentDate)).getMonth()) {
                            temp.pop();
                            break;
                        }
                    }
                    temp.push($scope.budget)
                    UserService.setBudget({
                        data: temp
                    });
                    $timeout(function(){
                    $state.go('app.overview')

                    },300)
                }
            }
            if($scope.budgetHistory.length==0)
              $scope.dataAvalable = false;
            else
              $scope.dataAvailable = true;
        });
    });