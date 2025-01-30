
let songs;
let curretnSongs = new Audio();
let currFolder="";
getmp3img("http://192.168.218.127:5500//songs/Diljit/Tum%20Se%20Hi.mp3",".mp3img")
function getmp3img(mp3Path,pathimg){
  fetch(mp3Path)
      .then(response => response.arrayBuffer())
      .then(buffer => {
          jsmediatags.read(new Blob([buffer]), {
              onSuccess: function(tag) {
                  const tags = tag.tags;
                  const picture = tags.picture;
  
                  if (picture) {
                      const base64String = arrayBufferToBase64(picture.data);
                      const imgUrl = `data:${picture.format};base64,${base64String}`;
                      document.querySelector(`${pathimg}`).src = imgUrl;
                      console("displaying img")
                  } else {
                      console.log("No album cover found.");
                  }
              },
              onError: function(error) {
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

function secondsToMinutesSeconds(seconds){
  if(isNaN(seconds) || seconds < 0) {
    return "00:00"
  }

  const minutes = Math.floor(seconds /60);
  const remainingSeconds = Math.floor(seconds % 60);

  const forMattedMinutes = String(minutes).padStart(2,'0');
  const forMattedSEconds = String(remainingSeconds).padStart(2,'0');

  return ` ${forMattedMinutes}:${forMattedSEconds}`;
}

async function getSongs(folder) {
  currFolder = folder;

  let a = await fetch(`${folder}/`
  );
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
   songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }

  // show all the songs in the platlist

  let songDIV = document.querySelector(".play").getElementsByTagName("div")[0];

  songDIV.innerHTML = "";
  

  for (const song of songs) {
    
    songDIV.innerHTML =
      songDIV.innerHTML +
      `
                          <div class="flex playlist">

                      <img class="invert songimg" width="34" src="img/music.svg" alt=""> 
                      
                      <div class="info">
                          
                          <div>${song.replaceAll("%20", " ")}</div>
                          <div>Harry</div>
                        </div>
                        
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>`;
  }

  // Attach an event listener to each song

  Array.from(songDIV.querySelectorAll(".playlist")).forEach((element, index)=>{
    element.addEventListener("click", () => {
      PlayMusic(songs[index]);
    })
  })

  return songs
}

const PlayMusic =(track, pause =false)=>{
  curretnSongs.src =`${currFolder}/`+ track;
  console.log("curretnSongs is "+curretnSongs);
  if(!pause){
    let mp3Path=curretnSongs.src
    console.log("mp3 is : "+mp3Path)
   getmp3img(mp3Path,".mp3img");
   console.log("runnig getmp3img function")
    curretnSongs.play()
    play.src= "img/pause.svg"
  }
  document.querySelector(".songname").innerHTML= decodeURI(track)
  document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

async function displayAlbums() {
  console.log("displaying albums");
  let response = await fetch(`http://192.168.218.127:5500/songs/`);
  let text = await response.text();
  let div=document.createElement("div");
  div.innerHTML=text;
  let achors = div.getElementsByTagName("a");
  let cardContainers = document.querySelector(".cards");
  let array=Array.from(achors);
  console.log(array)
  
  for (let index = 4; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
      let folder =`${e.href}`;
      console.log(folder);
        
        let a= await fetch (`${folder}/info.json`)
        let response = await a .json();
        cardContainers.innerHTML=cardContainers.innerHTML+` <div data-folder="${folder}" class="card">
         <div class="playbtn">
                <svg width="50px" height="50px" viewBox="-16.8 -16.8 57.60 57.60" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-16.8" y="-16.8" width="57.60" height="57.60" rx="28.8" fill="#00ff2a" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" fill="#1C274C"></path> </g></svg>
            </div>
            <div class="img">
            <img src="${folder}/cover.jpg" alt="" width="90%">
            <h1>${response.title}</h1>
            <p>${response.description}</p>
            </div>
        </div>`
      }
      
    }
    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
      e.addEventListener("click", async item => {
        console.log("Fetching Songs for folder:", item.currentTarget.dataset.folder);
        let songs = await getSongs(`${item.currentTarget.dataset.folder}`);
        console.log("Songs:", songs);
        PlayMusic(songs[0]);
    });
});
}



async function main() {
   await getSongs("songs/Diljit");
   
   PlayMusic(songs[0], true);
   displayAlbums();

   // Attach an event listener to play, next and previous

   play.addEventListener("click", () =>{
    if(curretnSongs.paused){
      curretnSongs.play()
      play.src="img/pause.svg"
    }
    else{
      curretnSongs.pause()
      play.src="img/play.svg"
    }
   })
   
  }

// Listen for timeupdate event
curretnSongs.addEventListener("timeupdate", () => {
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(curretnSongs.currentTime)} / ${secondsToMinutesSeconds(curretnSongs.duration)}`
  document.querySelector(".circle").style.left = (curretnSongs.currentTime / curretnSongs.duration) * 100 + "%";

  
  let index = songs.indexOf(curretnSongs.src.split("/").pop())
 if(curretnSongs.currentTime===curretnSongs.duration){
    PlayMusic(songs[index+1])
  }
})

  // Add an event listener to seekbar
  document.querySelector(".bar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    curretnSongs.currentTime = ((curretnSongs.duration) * percent) / 100
})

 // Add an event listener to previous
 previous.addEventListener("click", ()=>{
  curretnSongs.pause()

  let index = songs.indexOf(curretnSongs.src.split("/").pop())
  console.log(index)
  console.log(index-1);
  if((index - 1 )>=0){
    PlayMusic(songs[index-1])
  }
  else{
    PlayMusic(songs[0])
  }
 })

 // Add an event listener to next
 next.addEventListener("click", ()=>{
  curretnSongs.pause()

  let index = songs.indexOf(curretnSongs.src.split("/").pop())

  if((index+1)<songs.length){
    PlayMusic(songs[index+1])
  }
  else{
    PlayMusic(songs[0])
  }
 })
   // Add an event to volume

   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) =>{
    console.log("setting volume to",e.target.value, "/100")
    curretnSongs.volume=parseInt(e.target.value)/100
    if(curretnSongs.volume>0){
      document.querySelector(".volume").src = document.querySelector(".volume").src.replace("mute.svg","volume.svg")
    }
    if(curretnSongs.volume==0){
      document.querySelector(".volume").src = document.querySelector(".volume").src.replace("volume.svg","mute.svg")
    }
   })

   // Add event listener to mute the track

   document.querySelector(".volume").addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src=e.target.src.replace("volume.svg", "mute.svg")
      curretnSongs.volume=0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;

    }
    else{
      e.target.src=e.target.src.replace("mute.svg","volume.svg")
      curretnSongs.volume=1;
      document.querySelector(".range").getElementsByTagName("input")[0].value=100;
      
    }
   })

   
    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0"
  })


      // Add an event listener for close button
      document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    
main();
