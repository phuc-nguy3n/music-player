const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "PLAYER_KEY";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  // config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Ngày mai em đi",
      singer: "Touliver, Lê Hiếu, Soobin Hoàng Sơn",
      path: "./assets/music/spotifydown.com - Ngày Mai Em Đi.mp3",
      image: "./assets/image/ngay-mai-em-di.jpg",
    },
    {
      name: "1800-LOVE",
      singer: "MANBO, HIEUTHUHAI, HURRYKNG",
      path: "./assets/music/spotifydown.com - 1-800-LOVE.mp3",
      image: "./assets/image/1800-love.jpg",
    },
    {
      name: "Moshi Moshi",
      singer: "Nozomi Kitay, GAL D, MUKADE",
      path: "./assets/music/spotifydown.com - Moshi Moshi.mp3",
      image: "./assets/image/moshi-moshi.jpg",
    },
    {
      name: "ごめんね",
      singer: "AYANE",
      path: "./assets/music/spotifydown.com - ごめんね.mp3",
      image: "./assets/image/ごめんね.jpg",
    },
    {
      name: "Baby with you",
      singer: "Wren Evans, Evy",
      path: "./assets/music/spotifydown.com - Thói Quen.mp3",
      image: "./assets/image/baby-with-you.jpg",
    },
    {
      name: "Save your tears",
      singer: "The weeknd",
      path: "./assets/music/spotifydown.com - Save Your Tears.mp3",
      image: "./assets/image/save-your-tears.jpg",
    },
  ],

  // randomSort: function (a, b) {
  //   return Math.random() - 0.5;
  // },

  // shuffledSongs: function () {
  //   const randomSongs = this.songs.sort(this.randomSort);
  //   console.log(randomSongs);
  //   return randomSongs;
  // },

  // setConfig: function (key, value) {
  //   this.config[key] = value;
  //   localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  // },

  render: function () {
    const html = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
        <div
          class="thumb"
          style="
            background-image: url(${song.image});
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
        `;
    });
    playlist.innerHTML = html.join("");
  },

  definProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Handle CD spins / stops
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 giây
      iterations: Infinity,
    });

    cdThumbAnimate.pause();

    // Handles CD enlargement / reduction
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Handle when click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // When the song is played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // When the song is pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // When the song progress changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Handling when seek
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // When next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }

      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // When prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }

      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Handle random song on/off
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      // _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Handles repetition of a song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Process next song when audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Listen for click behavior on playlists
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // Handle when clicking on the song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Handle when clicking on the song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  getCurrentSong: function () {
    return this.songs[this.currentIndex];
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.getCurrentSong().name;
    cdThumb.style["background-image"] = `url('${this.getCurrentSong().image}')`;
    audio.src = this.getCurrentSong().path;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.currentIndex === randomIndex);

    this.currentIndex = randomIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Define properties for the object
    this.definProperties();

    // Listen/handle events (DOM events)
    this.handleEvents();

    // Load song information first into the UI when running the app
    this.loadCurrentSong();

    // Render platylist
    this.render();

    // this.shuffledSongs();
  },
};

app.start();
