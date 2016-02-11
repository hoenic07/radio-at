/**
 * Created by Niklas on 11.02.2016.
 */
app.service("$storageService", function(){

    this.favoriteSongs=[];

    this.storeSong = function(song){
        if(song==null||song.title==null||song.artist==null){
            return;
        }

        var songCleared = {
            title:song.title,
            artist:song.artist,
            cover:song.cover
        };

        //remove the song from the favs
        for(var i=0;i<this.favoriteSongs.length;i++){
            var s = this.favoriteSongs[i];
            if(this.isSongEqual(songCleared,s)){
                return;
            }
        }

        this.favoriteSongs.push(song);

        this.storeEverything();
    }

    this.getFavoriteSongs = function(){
        return this.favoriteSongs;
    }

    this.loadAllSongs = function(){
        var songsStr = window.localStorage.getItem("songs");
        if(songsStr!=null){
            this.favoriteSongs=JSON.parse(songsStr);
        }

    }

    this.removeSong = function(song){
        if(song==null||song.title==null||song.artist==null){
            return;
        }

        //remove the song from the favs
        for(var i=0;i<this.favoriteSongs.length;i++){
            var s = this.favoriteSongs[i];
            if(this.isSongEqual(song,s)){
                this.favoriteSongs.splice(i,1);
                break;
            }
        }

        this.storeEverything();
    }

    this.storeEverything = function(){
        var songString = JSON.stringify(this.favoriteSongs);
        window.localStorage.setItem("songs",songString);
    }

    this.isSongEqual = function(songA, songB){
        return songA.title.toLowerCase()==songB.title.toLowerCase()&&
            songA.artist.toLowerCase()==songB.artist.toLowerCase();
    }

    this.isSongFavorite = function(song){
        if(song==null||song.title==null||song.artist==null){
            return false;
        }

        for(var i=0;i<this.favoriteSongs.length;i++){
            var s = this.favoriteSongs[i];
            if(this.isSongEqual(song,s)){
                return true;
            }
        }

        return false;

    }

    this.ctor = function(){
        this.loadAllSongs();
    }

    this.ctor();

});
