
Vue.filter('convert_time', ( time ) => {
	hours = ~~ (time / 3600);
    minutes = ~~ ((time % 3600) / 60);
    seconds = ~~ time % 60;

    result = '';

     if (hours > 0) {
        result += '' + hours + ':' + (minutes < 10 ? '0' : '');
    }
    result += '' + minutes + ':' + (seconds < 10 ? '0' : '');
    result += '' + seconds;
    return result;
})


Vue.filter('default_cover', ( image ) => {
	return image == null || image == '' ? './assets/img/default_cover.png': image
})


Vue.filter('artist_control', ( str ) => {
	return str == null || str == '' ? 'Unknow': str;
})


Vue.component('list', {

    props: ['song', 'index'],

    data () {
    	return {
    		audio_duration: 0,
    		audio: new Audio()
    	}
    },

    created () {
    	this.audio.src = this.song.source;
    	if(this.audio_duration == 0) {
    		setInterval(() => this.audio_duration = this.audio.duration, 100)
    	}
	},

   template: 
        `<div class="music_list_cart" @click="$emit('show_list', false), $emit('selected_song', index)">
            <span class="cover_photo">
                <img :src="song.cover | default_cover">
            </span>
            <span class="music_info">
                <h4>{{song.name | artist_control}}</h4>
                <p>{{song.artist | artist_control}}</p>
            </span>
            <span class="music_duration">
                <p>{{audio_duration | convert_time}}</p>
            </span>
        </div>`,
});


Vue.component('player', {

	props: ['song_detail', 'current_index', 'corrent_song', 'audio'],

	data () {
		return {
			pause: false,
			progress: 0,
			seconds: 0,
			audio_duration: 0,
			index: 0,
			loop: false,
			like: false,
		}
	},

	template: 
        `<div class="player_body">
		    <div class="cover">
		    <img :src="song_detail.cover | default_cover">
		    </div>
			    <div class="player">	
				<div class="control">
				 <button @click="like = !like; $emit('favori', like)">
				        <img v-if="song_detail.favorited" src="./assets/icons/like2.png">
				        <img v-else="song_detail.favorited" src="./assets/icons/like.png">
				 </button>
					<button @click="$emit('counter', --index); clear()">
					    <img src="./assets/icons/before_song.svg">
					</button>
				<div class="play_btn">
					<span @click="pause = !pause; play()">
						<img :src="[!pause ? './assets/icons/play.svg': './assets/icons/pause.svg']" height="24">
					</span>
				</div>
					<button @click="$emit('counter', ++index); clear()">
					    <img src="./assets/icons/after_song.svg">
					</button>
					<button @click="loop = !loop">
					    <img v-if="loop" src="./assets/icons/repeat2.png">
					    <img v-else="loop" src="./assets/icons/repeat.png">
					</button>
				</div>	
				<div class="progress_content">
				<div class="progress_bar" @click="jump_to_time">
					<div :style="{width: progress + '%'}"></div>
					<input type="range" min="0" max="100" step="0.5"v-model="progress">
			    </div>
				    <p>{{seconds | convert_time}}</p>
				    <p>{{audio_duration | convert_time}} </p>
			    </div>		
		     </div>
	     </div>`,


	created () {

		if(this.audio_duration == 0){
		    setInterval(() => this.audio_duration = this.audio.duration, 100)};

		setInterval(() => {
			if(this.pause){
				this.seconds = this.audio.currentTime;
				this.progress = ( this.seconds * 100 ) / this.audio_duration || 0;
			}} ,1000);
	},

	methods: {

		play () {
			this.pause ? this.audio.play(): this.audio.pause();
		},

		clear () {
			setTimeout(() => {
				this.seconds = 0;
				this.progress = 0;
				this.pause ? this.audio.play(): null	
			} ,10);
		},

		jump_to_time () {
			this.seconds = this.audio_duration * ( this.progress / 100 );
			this.audio.currentTime = this.seconds;
		}
	},

	watch: {

		seconds (value) {
			if(value == this.audio_duration){
				if(!this.loop){
					this.$emit('counter', ++this.index);
				    this.loop = false;
				    this.clear();
				}
				this.clear();
			}
		},

		current_index ( value ) {
			this.index = value;
			this.clear();
		},

		index () {
		    this.loop = false;
		}
	}
})


const app = new Vue({

	el: '.container',

	data: {
		audio: new Audio(),
		current_index: 0,
		index: 0,
		show_list: false,
	        song_list: [{
                   name: "The Idol",
                   artist: "W.A.S.P",
                   cover: "./assets/img/wasp_the_idol.jpg",
                   source: "./assets/mp3/The Idol.mp3",
                   favorited: false
                 },
                 {
                   name: "Wild Child",
                   artist: "W.A.S.P",
                   cover: "./assets/img/wasp_wilde_child.jpg",
                   source: "./assets/mp3/Wild Child.mp3",
                   favorited: false
                 },
                 {
                   name: "Johnny B. Goode",
                   artist: "Judas Prist",
                   cover: "./assets/img/judas_prist_ram_it_down.jpg",
                   source: "./assets/mp3/Johnny B. Goode.mp3",
                   favorited: false
                 },
                 {
                   name: "Night Crawler",
                   artist: "Judas Prist",
                   cover: "./assets/img/judas_priest_painkiller.jpg",
                   source: "./assets/mp3/Night Crawler.mp3",
                   favorited: false
                 },
                 {
                  name: "Love Bites",
                  artist: "Def Leppart",
                  cover: "./assets/img/def_leppard_hysteria.jpg",
                  source: "./assets/mp3/Love Bites.mp3",
                  favorited: false
                }, 
                {
                  name: "Too late For Love",
                  artist: "Def Leppart",
                  cover: "./assets/img/def_leppard_pyromania.jpg",
                  source: "./assets/mp3/Too late For Love.mp3",
                  favorited: false
                }]
	       },

	computed: {
		corrent_song () {
			return this.audio.src = this.song_list[this.index].source;
		},
	},

	watch: {
		current_index ( value ) {
			listLength = this.song_list.length;
			value <= -1 ? num = listLength -1: value >= listLength ? num = 0: num = value;
			this.index = num;
		},

	    index ( value ) {
	    	this.current_index = value;
	    }
	}
})

