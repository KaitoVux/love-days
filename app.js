const yourDate = new Date("2020-08-22T00:00:00"),
      music = ["I Do - 911", "The One - Kodaline", "All Of Me - John Legend", "Make You Feel My Love - Adele", "Wake Me Up When September Ends - Green D"];
let isPlayed = [];

document.addEventListener('DOMContentLoaded', function () {
      var rootTime = document.querySelector("time");

      document.querySelector("anni").textContent = `${(yourDate.getDate() > 9) ? yourDate.getDate() : "0" + yourDate.getDate()}-${(yourDate.getMonth() > 8) ? (yourDate.getMonth() + 1) : "0" + (yourDate.getMonth() + 1)}-${yourDate.getFullYear()}`;

      document.querySelector("date").textContent = Math.floor(Math.floor((new Date() - yourDate) / 1000) / 60 / 60 / 24) + " days";

      function olock() {
            var today = new Date(),
                  hrs = (Math.floor(Math.floor((today - yourDate) / 1000) / 60 / 60)) % 24,
                  min = (Math.floor(Math.floor((today - yourDate) / 1000) / 60)) % 60,
                  sec = Math.floor((today - yourDate) / 1000) % 60;
            rootTime.textContent = `${(hrs > 9) ? hrs : "0" + hrs}:${(min > 9) ? min : "0" + min}:${(sec > 9) ? sec : "0" + sec}`;
      } olock();
      var timer = setInterval(function () { olock() }, 1000);

      let songName = music[Math.floor(Math.random() * music.length)];
      isPlayed.push(songName);

      let audio = document.querySelector("audio");

      audio.setAttribute("src", `music/${songName}.mp3`);

      document.getElementById("song-name").innerHTML = `${songName}`;

      audio.onended = function () {
            let nextSong = music[Math.floor(Math.random() * music.length)];
            if (isPlayed.length === music.length) {
                  isPlayed = [];
            }
            while (isPlayed.includes(nextSong) && isPlayed.length < music.length) {
                  nextSong = music[Math.floor(Math.random() * music.length)];
            }
            audio.src = `music/${nextSong}.mp3`;
            audio.pause();
            audio.load();
            audio.play();
            songName = nextSong;
            document.getElementById("song-name").innerHTML = `${songName}`;
            isPlayed.push(nextSong);

      };

      document.getElementsByTagName("body")[0].insertAdjacentHTML(
            "beforeend",
            "<div id='mask'></div>"
      );

}, false);