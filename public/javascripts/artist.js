var app = angular.module('app_artist', []);

app.controller('ctr_artist', function ($scope, $http, $document, $window) {

    var baseUrl = '/artist';

    $scope.cur_artist_id = '';

    var chart = Morris.Bar({
        element: 'chart',
        data: [{}],
        xkey: 'date',
        ykeys: ['rank'],
        labels: ['rank']
    });

    var popularity_chart = Morris.Bar({
        element: 'popularity_chart',
        data: [{}],
        xkey: 'year',
        ykeys: ['popularity'],
        labels: ['popularity']
    });

    $scope.searchClick = function () {
        var ctrUrl = baseUrl + '/search';

        var dataObj = {};
        addDataObj(jQuery, dataObj, "searchText", $scope.searchText);
        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.artists = returnData.rows;
            $scope.songs = [];
            chart.setData([]);
            popularity_chart.setData([]);
            $scope.collaborators = [];

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });
    }

    $scope.artistClick = function (artist) {

        $scope.searchText = artist;
        $scope.searchClick();
    }

    $scope.rowClick = function (idx) {
        var ctrUrl = baseUrl + '/song';

        var dataObj = {};
        $scope.cur_artist_id = $scope.artists[idx].id;
        addDataObj(jQuery, dataObj, "searchArtistId", $scope.cur_artist_id);
        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.songs = returnData.rows;
            $scope.getCollaborator();
            $scope.getPopularity();
            chart.setData([]);

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });
    }

    
    $scope.getPopularity = function () {
        var ctrUrl = baseUrl + '/popularity';

        var dataObj = {};
        addDataObj(jQuery, dataObj, "searchArtistId", $scope.cur_artist_id);
        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.popularity = returnData.rows;
            popularity_chart.setData($scope.popularity);

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });
    }

    $scope.getCollaborator = function () {
        var ctrUrl = baseUrl + '/collaborator';

        var dataObj = {};
        addDataObj(jQuery, dataObj, "searchArtistId", $scope.cur_artist_id);
        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.collaborators = returnData.rows;

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });
    }

    function addDataObj(jQuery, dataObj, keyNm, keyVal) {
        eval("jQuery.extend(dataObj, {" + keyNm + " : keyVal})");
    }

    $scope.drawChart = function (idx) {

        var ctrUrl = baseUrl + '/chart';

        var dataObj = {};
        addDataObj(jQuery, dataObj, "song_id", $scope.songs[idx].id);
        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.chart = returnData.rows;

            var chartArray = [];
            var curDate;
            for(var i = 0; i < $scope.chart.length; i++) {
                curDate = $scope.chart[i].date;
                curDate = curDate.substr(0, 4) + '-' + curDate.substr(4, 2) + '-' + curDate.substr(6, 2);
                chartArray.push({date: curDate, rank: $scope.chart[i].rank})
            }

            chart.setData(chartArray);

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });



    }

});