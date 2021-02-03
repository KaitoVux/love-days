const music = [
    "I Do - 911",
    "The One - Kodaline",
    "All Of Me - John Legend",
    "Make You Feel My Love - Adele",
    "Wake Me Up When September Ends - Green D",
    "Can't Take My Eyes Off You",
    "Say You Won't Let Go - James Arthur",
    "Love Someone - Lukas Graham",
    "I'm Yours - Jason Mraz",
    "Perfect - Ed Sheeran",
    "Perfect - Cover by Tanner Patrick",
    "You Are The Reason - Calum Scott",
    "Always - Isak Danielson",
    "Little Things - One Direction",
];

let isPlayed = ["The One - Kodaline"];

document.addEventListener("DOMContentLoaded", function () {
    let song = document.getElementById("song__source");

    songTitle = document.getElementById("song-name");
    songTitle.innerHTML = `The One - Kodaline`;

    let audio = document.querySelector("audio");
    audio.onended = function () {
        // random song
        let nextSong = music[Math.floor(Math.random() * music.length)];
        if (isPlayed.length === music.length) {
            isPlayed = [];
        }
        while (isPlayed.includes(nextSong) && isPlayed.length < music.length) {
            nextSong = music[Math.floor(Math.random() * music.length)];
        }
        song.src = `music/${nextSong}.mp3`;
        audio.load();
        audio.play();
        songName = nextSong;
        document.getElementById("song-name").innerHTML = `${songName}`;
        isPlayed.push(nextSong);
    };
});
