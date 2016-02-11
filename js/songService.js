/**
 * Created by Niklas on 07.02.2016.
 */
app.service("$songService", function($http, $storageService){

    this.oe3;
    this.kronehit;
    this.liveradio;

    this.currentStation;

    this.setStation = function(st){
        switch(st) {
            case "oe3":
                this.currentStation = this.oe3;
                break;
            case "liveradio":
                this.currentStation = this.liveradio;
                break;
            case "kronehit":
                this.currentStation = this.kronehit;
                break;
        }
    }

    this.getCurrentPlaylist = function(success, error){
        this.currentStation.getCurrentPlaylist(success,error);
    }

    this.getHistory = function(dateTime, success, error){
        this.currentStation.getHistory(dateTime,success,error);
    }

    this.getShowInfo = function(success, error){
        this.currentStation.getShowInfo(success,error);
    }

    this.ctor = function(){
        this.oe3=new Oe3Service($http);
        this.liveradio=new LiveRadioService($http);
        this.kronehit=new KronehitService($http);
    }

    this.ctor();

});

var Oe3Service = function($http){
    this.getCurrentPlaylist = function(success, error){
        $http.get("http://oe3meta.orf.at/oe3mdata/WebPlayerFiles/PlayList200.json?rand="+Math.random())
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data;
                for(var i=0;i<res.length;i++){
                    var s = res[i];
                    var song = {
                        title: s.SongName,
                        artist: s.Artist,
                        cover: s.Cover,
                        time:new Date(s.Time),
                        isPlaying: s.Status=="Playing",
                        isFavorite: false
                    };

                    if(song.cover=="http://oe3meta.orf.at/oe3mdata/Pictures/200/"){
                        song.cover="img/song_na.png";
                    }

                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    this.getShowInfo = function(success, error){
        $http.get("http://oe3meta.orf.at/oe3mdata/WebPlayerFiles/ShowInfoMobile.json?rand="+Math.random())
            .then(function mySucces(response) {
                var res  = response.data;
                for(var i=0;i<res.length;i++){
                    var s = res[i];
                    if(s.Status=="Playing"){
                        var show = {
                            name: s.Show,
                            host: s.Host
                        };
                        success(show);
                        return;
                    }
                }
                error();

            }, error);
    }

    this.getHistory = function(dateTime, success, error){
        var date = new Date(dateTime.getTime()+1000*60*60)
        $http.get("http://oe3meta.orf.at/ApiV2.php/SongHistory.json?Res=200&DT="+date.toISOString()+"&rand="+Math.random())
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data;
                for(var i=0;i<res.length;i++){
                    var s = res[i];
                    var song = {
                        title: s.SongName,
                        artist: s.Artist,
                        cover: s.Cover,
                        time:new Date(s.Time),
                        isFavorite: false
                    };

                    if(song.cover=="http://oe3meta.orf.at/oe3mdata/Pictures/200/"){
                        song.cover="img/song_na.png";
                    }

                    songs.push(song);
                }

                success(songs);

            }, error);
    }

}

var LiveRadioService = function($http){

    this.liveRadioHistory=null;
    this.lastRequestTime=null;

    this.getCurrentPlaylist = function(success, error){
        $http.get("http://cors.io/?u=http://www.liferadio.at/static/trackhistory_1.json?rand="+Math.random())
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data;
                for(var i=0;i<res.length;i++){
                    var s = res[i];
                    var song = {
                        title: s.titel,
                        artist: s.interpret,
                        cover: s.image,
                        time:new Date(parseInt(s.starttime_unixtimestamp)*1000),
                        isPlaying: i==0,
                        isFavorite: false
                    };
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    this.getShowInfo = function(success, error){
        $http.get("http://cors.io/?u=http://www.liferadio.at/radioplayer/php/getModulInfo.php?rand="+Math.random())
            .then(function mySucces(response) {
                var show = {
                    name: response.data.sendung,
                    host: response.data.modName
                };

                success(show);

            }, error);
    }

    this.getHistory = function(dateTime, success, error){
        var service=this;

        //Make an update of the history when last request is older than 15min
        var wasLastRequestMoreThan15MinAgo = false;
        if(this.lastRequestTime!=null){
            var time = new Date().getTime() - this.lastRequestTime.getTime();
            var min = time/1000/60;
            if(min>=15){
                wasLastRequestMoreThan15MinAgo=true;
            }
        }

        if(this.liveRadioHistory!=null&&!wasLastRequestMoreThan15MinAgo){
            var songs = this.getLatestLiveRadioHistoryItems(dateTime);
            success(songs);
        }
        else{
            $http.get("http://cors.io/?u=http://www.liferadio.at/static/songfinder_1.json?rand="+Math.random())
                .then(function mySucces(response) {
                    service.liveRadioHistory=[]
                    var res  = response.data;
                    for(var i=0;i<res.length;i++){
                        var s = res[i];
                        var song = {
                            title: s.titel,
                            artist: s.interpret,
                            cover: s.image,
                            time:new Date(parseInt(s.starttime_unixtimestamp)*1000),
                            isFavorite: false
                        };

                        service.liveRadioHistory.push(song);
                    }
                    this.lastRequestTime=new Date();
                    var songs = service.getLatestLiveRadioHistoryItems(dateTime);
                    success(songs);

                }, error);
        }
    }

    this.getLatestLiveRadioHistoryItems = function(dateTime){
        var songs=[];
        var MinMillis15=15*60*1000;
        for(var i=0;i<this.liveRadioHistory.length;i++){
            var date = this.liveRadioHistory[i].time;
            var diff = Math.abs(date.getTime() - dateTime.getTime());
            if(diff < MinMillis15){
                songs.push(this.liveRadioHistory[i])
            }
        }
        return songs;
    }
}

var KronehitService = function($http){
    this.getCurrentPlaylist = function(success, error){
        $http.get("https://jsonp.afeld.me/?url=http%3A%2F%2Fwww.kronehit.at%2Falles-ueber-kronehit%2Fhitsuche%2F%3Fformat%3Djson%26channel%3D1%26rand="+Math.random())
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data.items;
                for(var i=0;i<res.length;i++){
                    var s = res[i];

                    //calc time
                    var hours = parseInt(s.PlayTime.substr(0,2));
                    var min = parseInt(s.PlayTime.substr(3,2));
                    var dt = new Date();
                    dt.setHours(hours,min,0);

                    var song = {
                        title: s.TrackName,
                        artist: s.ArtistName,
                        cover:"img/song_na.png",
                        time:dt,
                        isPlaying: s.IsSelected==true,
                        isFavorite: false
                    };
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    this.getShowInfo = function(success, error){
        var show = {
            name: "KroneHit",
            host: ""
        };
        success(show);
    }

    this.getHistory = function(dateTime, success, error){
        var hours = dateTime.getHours();
        var minutes = dateTime.getMinutes();
        var date =dateTime.toISOString().substring(0,10);
        $http.get("https://jsonp.afeld.me/?url=http%3A%2F%2Fwww.kronehit.at%2Falles-ueber-kronehit%2Fhitsuche%2F%3Fformat%3Djson%26day%3D"+date+"%26channel%3D1%26hours%3D"+hours+"%26minutes%3D"+minutes+"%26rand="+Math.random())
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data.items;
                for(var i=0;i<res.length;i++){
                    var s = res[i];

                    //calc time
                    var hours = parseInt(s.PlayTime.substr(0,2));
                    var min = parseInt(s.PlayTime.substr(3,2));
                    var dt = new Date();
                    dt.setHours(hours,min,0);

                    var song = {
                        title: s.TrackName,
                        artist: s.ArtistName,
                        time:dt,
                        cover:"img/song_na.png",
                        isFavorite: false
                    };
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

}