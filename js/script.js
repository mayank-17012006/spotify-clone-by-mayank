let songs;
let currentSong = new Audio();  // Audio element
let currentFolder = "";

function getmp3img(mp3Path, pathimg) {
  fetch(mp3Path)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      jsmediatags.read(new Blob([buffer]), {
        onSuccess: function (tag) {
          const tags = tag.tags;
          const picture = tags.picture;

          if (picture) {
            const base64String = arrayBufferToBase64(picture.data);
            const imgUrl = `data:${picture.format};base64,${base64String}`;
            document.querySelector(`${pathimg}`).src = imgUrl;
          }
        },
        onError: function (error) {
          console.log(error);
        }
      });
    })
    .catch(error => console.log(error));

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currentFolder = folder;

  // Fetch raw folder content from GitHub using API
  let response = await fetch(`https://api.github.com/repos/mayank-17012006/spotify-clone-by-mayank/contents/songs/${folder}`);
  let data = await response.json();
  songs = [];
  for (let file of data) {
    if (file.name.endsWith(".mp3")) {
      songs.push(file.download_url); // Get raw URL for the MP3
    }
  }

  // Show all the songs in the playlist
  let songDIV = document.querySelector(".play").getElementsByTagName("div")[0];
  songDIV.innerHTML = "";

  for (const song of songs) {
    songDIV.innerHTML += `
      <div class="flex playlist">
        <img class="invert songimg" width="34" src="img/music.svg" alt=""> 
        <div class="info">
          <div>${song.split('/').pop().replaceAll("%20", " ")}</div>
          <div>Harry</div>
        </div>
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="">
      </div>`;
  }

  // Attach event listener to each song
  Array.from(songDIV.querySelectorAll(".playlist")).forEach((element, index) => {
    element.addEventListener("click", () => {
      PlayMusic(songs[index]);
    });
  });

  return songs;
}

const PlayMusic = (track, pause = false) => {
  currentSong.src = track; // Set the raw MP3 URL to the audio source
  console.log("Playing song:", currentSong.src);
  if (!pause) {
    let mp3Path = currentSong.src;
    console.log("mp3 is:", mp3Path);
    getmp3img(mp3Path, ".mp3img");
    currentSong.play();
    play.src = "img/pause.svg"; // Change play button to pause
  }
  document.querySelector(".songname").innerHTML = decodeURI(track.split('/').pop());
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}
async function displayAlbums() {
  let response = await fetch('https://api.github.com/repos/mayank-17012006/spotify-clone-by-mayank/contents/songs');
  let data = await response.json();
  let cardContainers = document.querySelector(".cards");
  
  for (let folder of data) {
    if (folder.type === "dir") {  // Skip non-folder directories
      let albumData = await fetch(`https://raw.githubusercontent.com/mayank-17012006/spotify-clone-by-mayank/main/songs/${folder.name}/info.json`);
      let albumInfo = await albumData.json();
      
      // Correct URL format for cover image
      let coverImageURL = `https://raw.githubusercontent.com/mayank-17012006/spotify-clone-by-mayank/main/songs/${folder.name}/cover.jpg`;

      cardContainers.innerHTML += `
      <div data-folder="${folder.name}" class="card">
        <div class="playbtn">
          <svg width="50px" height="50px" viewBox="-16.8 -16.8 57.60 57.60" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000">
            <g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-16.8" y="-16.8" width="57.60" height="57.60" rx="28.8" fill="#00ff2a"></rect></g>
            <path d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" fill="#1C274C"></path>
          </svg>
        </div>
        <div class="img">
          <img src="${coverImageURL}" alt="Album Cover" width="90%">
          <h1>${albumInfo.title}</h1>
          <p>${albumInfo.description}</p>
        </div>
      </div>`;
    }
  }

  // Attach event listeners to cards
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      let songs = await getSongs(item.currentTarget.dataset.folder);
      PlayMusic(songs[0]); // Play the first song in the folder
    });
  });
}


async function main() {
  await getSongs("Diljit"); // Default folder to load songs
  PlayMusic(songs[0], true); // Play first song
  displayAlbums();

  // Play/Pause button functionality
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add event listener to seekbar
  document.querySelector(".bar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  });

  // Volume functionality
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 1;
      document.querySelector(".range input").value = 100;
    }
  });


  
    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0"
  })


      // Add an event listener for close button
      document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    
}

main();
