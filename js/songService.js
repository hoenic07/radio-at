/**
 * Created by Niklas on 07.02.2016.
 */
app.service("$songService", function($http){

    this.liveRadioHistory=null
    this.station="";

    this.getCurrentPlaylist = function(success, error){
        switch(this.station){
            case "oe3":
                this.getCurrentOe3Playlist(success, error);
                break;
            case "liveradio":
                this.getCurrentLiveRadioPlaylist(success, error);
                break;
            case "kronehit":
                this.getCurrentKronehitPlaylist(success,error);
                break;
        }
    }

    this.getHistory = function(dateTime, success, error){
        switch(this.station){
            case "oe3":
                this.getOe3History(dateTime, success, error);
                break;
            case "liveradio":
                this.getLiveRadioHistory(dateTime, success, error);
                break;
            case "kronehit":
                this.getKronehitHistory(dateTime, success, error);
                break;
        }
    }

    this.getShowInfo = function(success, error){
        switch(this.station){
            case "oe3":
                this.getOe3ShowInfo(success, error);
                break;
            case "liveradio":
                this.getLiveRadioShowInfo(success, error);
                break;
            case "kronehit":
                this.getKronehitShowInfo(success, error);
                break;
        }
    }

    //OE3

    this.getCurrentOe3Playlist = function(success, error){
        $http.get("http://oe3meta.orf.at/oe3mdata/WebPlayerFiles/PlayList200.json")
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
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    this.getOe3ShowInfo = function(success, error){
        $http.get("http://oe3meta.orf.at/oe3mdata/WebPlayerFiles/ShowInfoMobile.json")
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

    this.getOe3History = function(dateTime, success, error){
        $http.get("http://oe3meta.orf.at/ApiV2.php/SongHistory.json?Res=200&DT="+dateTime.toISOString())
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
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    //Live Radio

    this.getCurrentLiveRadioPlaylist = function(success, error){
        $http.get("http://cors.io/?u=http://www.liferadio.at/static/trackhistory_1.json")
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
                        isPlaying: false,
                        isFavorite: false
                    };
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    this.getLiveRadioShowInfo = function(success, error){
        $http.get("http://cors.io/?u=http://www.liferadio.at/radioplayer/php/getModulInfo.php")
            .then(function mySucces(response) {
                var show = {
                    name: response.data.modName,
                    host: ""
                };
                success(show);

            }, error);
    }

    this.getLiveRadioHistory = function(dateTime, success, error){
        var service=this;
        if(this.liveRadioHistory!=null){
            var songs = this.getLatestLiveRadioHistoryItems(dateTime);
            success(songs);
        }
        else{
            $http.get("http://cors.io/?u=http://www.liferadio.at/static/songfinder_1.json?_=1453802479112")
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

    //Kronehit

    this.getCurrentKronehitPlaylist = function(success, error){
        $http.get("https://jsonp.afeld.me/?url=http%3A%2F%2Fwww.kronehit.at%2Falles-ueber-kronehit%2Fhitsuche%2F%3Fformat%3Djson%26channel%3D1")
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data.items;
                for(var i=0;i<res.length;i++){
                    var s = res[i];
                    var song = {
                        title: s.TrackName,
                        artist: s.ArtistName,
                        time:new Date(),
                        isFavorite: false
                    };
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

    this.getKronehitShowInfo = function(success, error){
        var show = {
            name: "KroneHit",
            host: ""
        };
        success(show);
    }

    this.getKronehitHistory = function(dateTime, success, error){
        var hours = dateTime.getHours();
        var minutes = dateTime.getMinutes();
        var date =dateTime.toISOString().substring(0,10);
        $http.get("https://jsonp.afeld.me/?url=http%3A%2F%2Fwww.kronehit.at%2Falles-ueber-kronehit%2Fhitsuche%2F%3Fformat%3Djson%26day%3D"+date+"%26channel%3D1%26hours%3D"+hours+"%26minutes%3D"+minutes)
            .then(function mySucces(response) {
                var songs=[]
                var res  = response.data.items;
                for(var i=0;i<res.length;i++){
                    var s = res[i];
                    var song = {
                        title: s.TrackName,
                        artist: s.ArtistName,
                        time:new Date(),
                        isFavorite: false
                    };
                    songs.push(song);
                }

                success(songs);

            }, error);
    }

});