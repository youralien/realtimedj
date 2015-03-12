// First-beat extraction and assembly
// You will need to supply your Echo Nest API key, the trackID, and a URL to the track.
// The supplied track can be found in the audio subdirectory.
var apiKey = 'SWHCFHJA2PPHKX7A5';

// SAIL song
var trackID = 'TRWHQOK13B357AB74A'; 
var trackURL = 'audio/Sail.mp3'
// var trackID = 'TRCYWPQ139279B3308';
// var trackURL = 'audio/1451_-_D.mp3';

var remixer;
var player;
var track;
var remixed;
var current;
var prev_dur;
var tiles = remixed;
var divider = 1;

function keydown(evt) {

    console.log('key', evt.which);

    // when < is pressed
    if (evt.which == 190) {  // , slower
        console.log(player); 
        var factor = player.getSpeedFactor() + .05;
        setSpeedFactor(factor)
        player.stop()
        player.play(player.curTime(), remixed);
        console.log(player.curTime());
        evt.preventDefault();
    }

    // when > is pressed
    if (evt.which == 188) {  // . faster
        console.log(player);
        var factor = player.getSpeedFactor() - .05;
        if (factor < 0) {
            factor = 0;
        }
        setSpeedFactor(factor)
        player.stop()
        player.play(player.curTime(), remixed)
        console.log(player.curTime());
        evt.preventDefault();
    }

    if (evt.which == 186) {  // way slower
        var factor = player.getSpeedFactor();
        factor /= 2;
        setSpeedFactor(factor)
        evt.preventDefault();
    }

    if (evt.which == 222) {  // way faster
        var factor = player.getSpeedFactor();
        factor *= 2./3.;
        setSpeedFactor(factor)
        evt.preventDefault();
    }
}


function init() {
    $("#play").click(
        function() {
            if (driver.isRunning()) {
                driver.stop();
            } else {
                driver.setAutobot(false);
                driver.start();
            }
        }
    );
    $(document).keydown(keydown);
    // setting up basic audio stuff?
    var contextFunction = window.webkitAudioContext || window.AudioContext;
    if (contextFunction === undefined) {
        $("#info").text("Sorry, this app needs advanced web audio. Your browser doesn't"
            + " support it. Try the latest version of Chrome?");
    } else {
        // apparently contextFunction is an important input to createJRemixer
        var context = new contextFunction();
        remixer = createJRemixer(context, $, apiKey);
        player = remixer.getPlayer();
        $("#info").text("Loading analysis data...");

        // You can remix tracks by some ID using Echo Nest's API
        remixer.remixTrackById(trackID, trackURL, function(t, percent) {
            track = t;

            $("#info").text(percent + "% of the track loaded");
            if (percent == 100) {
                $("#info").text(percent + "% of the track loaded, remixing...");
            }

            if (track.status == 'ok') {
                remixed = new Array();
                // Do the remixing here!
                for (var i=0; i < track.analysis.beats.length; i++) {
                    current = track.analysis.beats[i];
                    if (i % 1 == 0) {
                        // prev_dur = current.duration;
                        // current.start = current.start - prev_dur + .4;
                        // current.duration = .3;
                        remixed.push(current);
                        // remixed.push(track.analysis.beats[i])
                    }
                }
                $("#info").text("Remix complete!");
            }
        });
        driver = Driver(player); // line 955
    }
    $(document).keydown(keydown);
}

function setSpeedFactor(factor) {
    // debugger;
    player.setSpeedFactor(factor)
    $("#speed").text(Math.round(factor * 100));
}

function Driver(player) {
    var curTile = null;
    var curOp = null;
    var incr = 1;
    var nextTile = null;
    var loopStart = null;
    var loopEnd = null;
    var isBeats = true;
    var autobot = false;

    var autoprobs = [ 1,1,1,1,1, 1, 1,1,1,1,1, 1,1, 0,0,-1, -1, -2, -4];

    var tileDiv = $("#tile");
    var incrDiv = $("#incr");
    var autoBotField = $("#d_autobot");

    function next() {
        if (autobot) {
            if (curTile == null || curTile == undefined) {
                return tiles[0];
            } else {
                var r = _.random(0, autoprobs.length - 1);
                incr = autoprobs[r];
                var which = curTile.which;
                var next = which + incr
                if (next >= tiles.length) {
                    return null;
                } else if (next < 0) {
                    return curTile;
                } else {
                    return tiles[next];
                }
            }
            return tiles[0];
        } else if (curTile == null || curTile == undefined) {
            return tiles[0];
        } else {
            var which = curTile.which;
            var next = which + incr
            if (next >= tiles.length) {
                return null;
            } else if (next < 0) {
                return curTile;
            } else {
                return tiles[next];
            }
            autoBotField.text(" ");
        }
    }


    function stop () {
        curOp = null;
        curTile = null;
        player.stop();
        $("#play").text("Play");
        setURL();
        $("#tweet-span").show();
    }

    function process() {
        if (curTile !== null && curTile !== undefined) {
            curTile.normal();
        }

        if (curOp) {
            if (nextTile != null) {
                curTile = nextTile;
                nextTile = null;
            } else if (curTile === loopEnd  && loopStart !== null) {
                curTile = loopStart;
            } else {
                curTile = curOp();
            }

            if (curTile !== null) {
                var delay = player.play(0, curTile.q);
                setTimeout( function () { process(); }, 1000 * delay);
                curTile.playStyle();
                tileDiv.text(curTile.which);
                incrDiv.text(incr);
            } else {
                stop();
            }
        }
    }

    var interface = {
        start: function() {
            curOp = next;
            process();
            $("#inc").text(incr);
            $("#play").text("Stop");
            $("#tweet-span").hide();
            setURL();
        },

        stop: stop,

        setAutobot: function(state) {
            autobot = state;
            autoBotField.text( autobot ? "autobot" : "");
        },

        toggleAutobot: function() {
            autobot = !autobot;
            autoBotField.text( autobot ? "autobot" : "");
        },

        isRunning: function() {
            return curOp !== null;
        },

        getIncr: function() {
            return incr;
        },

        getCurTile : function() {
            return curTile;
        },

        setIncr: function(inc) {
            incr = inc;
            incrDiv.text(incr);
        }, 

        setNextTile: function(tile) {
            nextTile = tile;
        },

        setLoopStart: function() {
            loopStart = curTile;
        },

        setLoopEnd: function() {
            loopEnd = curTile;
        },

        loopCancel: function() {
            loopStart = null;
            loopEnd = null;
        },

        toggleBeatsTatums : function() {
            if (!isBeats) {
                goBeats();
                if (curTile) {
                    var which = Math.round(curTile.which / 2);
                    curTile = tiles[which];
                }
            } else {
                goTatums();
                if (curTile) {
                    var which = curTile.which * 2;
                    curTile = tiles[which];
                }
            }
            isBeats = !isBeats
        },

        isBeats: function() {
            return isBeats;
        }
    }
    return interface;
}

window.onload = init;