// First-beat extraction and assembly
// You will need to supply your Echo Nest API key, the trackID, and a URL to the track.
// The supplied track can be found in the audio subdirectory.
var apiKey = 'SWHCFHJA2PPHKX7A5';

// SAIL song
var trackID = 'TRWHQOK13B357AB74A'; 
var trackURL = 'audio/Sail.mp3'

var remixer;
var player;
var track;
var remixed;
var current;
var prev_dur;
var divider = 1;

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
                remixed = track.analysis.beats;
                $("#info").text("Remix complete!");
            }
        });
    }
}

function setSpeedFactor(factor) {
    player.setSpeedFactor(factor)
}

window.onload = init;