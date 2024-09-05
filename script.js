console.log("Spotify");

let cards = document.querySelectorAll(".card");
let playButtons = document.querySelectorAll(".play_btn i");
let trackBanner = document.querySelector(".track_area img");
let trackInfo = document.querySelector(".track_info");
let playerBtn = document.querySelector("#play_bt i");
let currentTime = document.querySelector("#current-time");
let maxTime = document.querySelector("#duration");
let progressBar = document.querySelector("#progress-bar");
let thumb = document.querySelector("#thumb");
let nextBtn = document.querySelector(".nxt");
let prevBtn = document.querySelector(".prev");
let volbtn = document.querySelector("#volume-bar");
let currentAudio = new Audio();
let currentPlayingElement = null;
let currentPlayingButton = null;

main();

async function main() {
    const songs = await getSongs();

    const songDetails = createSongDetails(songs);
    setupPlayButtons(songDetails);
    setupPlayerButton();
    setupProgressBar();
    setupNavigationButtons(songDetails);
    setupVolumeControl();
}

function createSongDetails(songs) {
    let songDetails = {};

    for (let i = 0; i < songs.length; i++) {
        songDetails[songs[i].innerText] = {
            href: songs[i].href,
            imgSrc: cards[i].children[0].currentSrc,
            title: songs[i].innerText,
            artists: Array.from(cards[i].children[2].children[1].children)
        };
    }

    currentAudio.src = songDetails[songs[0].innerHTML].href;
    currentPlayingElement = songs[0];
    updateTrackInfo(songDetails[songs[0].innerHTML].imgSrc, songDetails[songs[0].innerHTML].title, songDetails[songs[0].innerHTML].artists);

    return songDetails;
}

function setupPlayButtons(songDetails) {
    playButtons.forEach((btn) => {
        btn.addEventListener("click", () => handlePlayButtonClick(btn, songDetails));
    });
}

function handlePlayButtonClick(btn, songDetails) {

    let banner = btn.parentElement.parentElement.children[0].currentSrc;
    let title = btn.parentElement.parentElement.children[2].children[0].innerText;
    let artist = btn.parentElement.parentElement.children[2].children[1].children;

    clearTrackInfo();
    updateTrackInfo(banner, title, artist);

    let song = songDetails[title];

    if (song) {
        handleSongPlayPause(song, btn);
    }
}

function clearTrackInfo() {
    while (trackInfo.firstChild) {
        trackInfo.removeChild(trackInfo.firstChild);
    }
}

function updateTrackInfo(banner, value, artist) {
    trackBanner.setAttribute("src", banner);
    let title = document.createElement("p");
    title.innerText = value;
    trackInfo.appendChild(title);

    for (let i = 0; i < artist.length; i++) {
        let list = document.createElement("span");
        list.innerHTML = `<a> ${artist[i].innerText} </a>`;
        trackInfo.appendChild(list);
    }
}

function handleSongPlayPause(song, btn) {
    let link = song.href;

    if (currentAudio && currentPlayingElement) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // reset the current time
        if (currentPlayingButton) {
            currentPlayingButton.setAttribute("class", "fa-solid fa-play");
            playerBtn.setAttribute("class", "fa-solid fa-play");
        }
    }

    if (currentPlayingElement === song) {
        // If clicking the same song, just pause and reset
        currentAudio.src = "";
        currentPlayingElement = null;
        currentPlayingButton = null;
        btn.setAttribute("class", "fa-solid fa-play");
        playerBtn.setAttribute("class", "fa-solid fa-play");
    } else {
        // Play the new song
        currentAudio.src = link;
        currentAudio.play();
        currentPlayingElement = song;
        currentPlayingButton = btn;
        btn.setAttribute("class", "fa-solid fa-pause");
        playerBtn.setAttribute("class", "fa-solid fa-pause");
    }
}

function setupPlayerButton() {
    playerBtn.addEventListener("click", () => {
        if (currentAudio && currentPlayingElement) {
            if (currentAudio.paused) {
                currentAudio.play();
                playerBtn.setAttribute("class", "fa-solid fa-pause");
            } else {
                currentAudio.pause();
                playerBtn.setAttribute("class", "fa-solid fa-play");
            }
        }
    });
}

function setupProgressBar() {
    currentAudio.addEventListener("timeupdate", () => {
        currentTime.innerHTML = formatTime(currentAudio.currentTime);
        maxTime.innerHTML = formatTime(currentAudio.duration);
        thumb.style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
    });

    progressBar.addEventListener("click", (event) => {
        let percent = (event.offsetX / event.target.getBoundingClientRect().width) * 100;
        currentAudio.currentTime = (currentAudio.duration * percent) / 100;
        thumb.style.left = percent + "%";
    });
}

function setupNavigationButtons(songDetails) {
    const songs = Object.values(songDetails);
    const links = Object.values(songDetails).map(song => song.href);

    nextBtn.addEventListener("click", () => {
        let currentIndex = links.indexOf(currentAudio.src);
        let nextIndex = (currentIndex + 1) % links.length;
        currentAudio.src = links[nextIndex];
        clearTrackInfo()
        updateTrackInfo(songs[nextIndex].imgSrc, songs[nextIndex].title, songs[nextIndex].artists);
        currentAudio.play();
    });

    prevBtn.addEventListener("click", () => {
        let currentIndex = links.indexOf(currentAudio.src);
        let prevIndex = (currentIndex - 1 + links.length) % links.length;
        currentAudio.src = links[prevIndex];
        clearTrackInfo()
        updateTrackInfo(songs[prevIndex].imgSrc, songs[prevIndex].title, songs[prevIndex].artists);
        currentAudio.play();
    });
}

function setupVolumeControl() {
    volbtn.addEventListener("input", () => {
        let vol = volbtn.value / 100;
        currentAudio.volume = vol;
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
}

async function getSongs() {
    const DATA = await fetch("http://127.0.0.1:3000/Songs/");
    const data = await DATA.text();

    const box = document.createElement("div");
    box.innerHTML = data;

    const titles = Array.from(box.querySelectorAll("tbody tr td a"));
    titles.splice(0, 1);
    const songs = document.querySelectorAll(".card h4");

    for (let i = 0; i < titles.length; i++) {
        titles[i].innerHTML = titles[i].innerHTML.replace("_320(PagalWorld.com.sb).mp3", "");
        songs[i].innerHTML = titles[i].innerHTML;
    }
    return titles;
}