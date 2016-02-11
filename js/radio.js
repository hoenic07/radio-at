/**
 * Created by Niklas on 07.02.2016.
 */

app.controller('main', function($scope, $songService) {
    //static data
    $scope.stations = [
        {
            name: "Hitradio Ö3",
            id:"oe3",
            streamUrl:"http://mp3stream7.apasf.apa.at:8000/;",
        },
        {
            name: "KroneHit",
            id:"kronehit",
            streamUrl:"http://onair-ha1.krone.at/kronehit-hd.mp3",
        },
        {
            name: "LiveRadio",
            id:"liveradio",
            streamUrl:"http://94.136.28.10:8000/liferadio",
        },
    ];

    $scope.viewNames=[
        "Live",
        "History",
        "Favoriten"
    ]

    //Dynamic data
    $scope.view = 0;
    $scope.currentStation;
    $scope.title;
    $scope.livePlaylist = [];
    $scope.currentShow = {};
    $scope.history = [];
    $scope.favorites=[];
    $scope.isPlaying=false;
    $scope.historyDate=new Date();

    $scope.switchStation = function(id){
        w3_close();
        for(var i=0;i<$scope.stations.length;i++){
            var st = $scope.stations[i];
            if(st.id==id){
                $scope.currentStation=st;
            }
        }
        $scope.updateViewAndShow();
        $scope.title = $scope.getTitle();
        audio_set_src($scope.currentStation.streamUrl)
        $scope.isPlaying=true;
    }

    $scope.switchView = function(view){
        w3_close();
        $scope.view = view;
        $scope.title = $scope.getTitle();
        $scope.updateViewAndShow();
    }

    $scope.updateViewAndShow = function(){
        $songService.station=$scope.currentStation.id;
        switch($scope.view){
            case 0:
                $scope.loadLivePlaylist();
                break;
            case 1:
                $scope.loadHistory();
                break;
            case 2:
                $scope.loadFavorites()
                break;
        }
        $scope.loadShow();
    }

    $scope.getTitle = function(){
        if($scope.view == 2){
            return $scope.viewNames[$scope.view];
        }
        else{
            return $scope.currentStation.name +" "+ $scope.viewNames[$scope.view]
        }
    }

    $scope.loadLivePlaylist = function(){
        $songService.getCurrentPlaylist(
            function(songs){
                $scope.livePlaylist=songs;
            },
            function(){
                //TODO: Show something here
            }
        );
    };

    $scope.loadHistory = function(){
        $songService.getHistory($scope.historyDate,
            function(history){
                $scope.history=history;
            },
            function(){
                //TODO: Show something here
            }
        );
    }

    $scope.loadFavorites= function(){

    }

    $scope.loadShow = function(){
        $songService.getShowInfo(
            function(show){
                $scope.currentShow=show;
            },
            function(){
                //TODO: Show something here
            }
        );
    }

    $scope.playPause = function(){
        if($scope.isPlaying==true){
            $scope.isPlaying=false;
            audio_pause();
        }
        else{
            $scope.isPlaying=true;
            audio_play();
        }
    }


    $scope.ctor = function(){
        $scope.switchStation($scope.stations[0].id);
        $scope.title=$scope.getTitle();
        $scope.updateViewAndShow();
    }

    $scope.ctor();

});