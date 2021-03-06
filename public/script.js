const socket = io('/')

const videoGrid = document.getElementById('video-grid');
// console.log(myVideo)

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030'
})
// my video
const myVideo = document.createElement('video');
myVideo.muted = true;

// list of currently logged users
const peers = {}

// to have ability to stop video
let myVideoStream

// getting cam and mic
    navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
    }).then(stream => {
      myVideoStream = stream;
      addVideoStream(myVideo, stream)
    
      peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream);
        });
      })
      socket.on('user-connected', userID => {
        connectToNewUser(userID, stream);
      })
    })
    
    socket.on('user-disconnected', userID => {
      if(peers[userID]) peers[userID].close();
    })
    peer.on('open', id=> {
      socket.emit('join-room', ROOM_ID, id)
    })

    
    
const connectToNewUser = (userID, stream) => {
  const call = peer.call(userID, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove();
  })
  peers[userID] = call
  console.log('peers', peers)
}


const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	});
	videoGrid.append(video);
};


// chat messages
    let text = $('input');
    $('html').keydown(e => {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
      }
    })
  
    socket.on('createMessage', message => {
      $('ul').append(`<li class="message"><b>user</b><br/>${message} </li>`);
      scrollToBottom();
    });

function scrollToBottom (){
  const mainChat = $('.main__chat_window');
  mainChat.scrollTop(mainChat.prop('scrollHeight'))
}


 //   =============== mute and stop ===================== //   
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	} else {
		setMuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};

const playStop = () => {
	console.log('object');
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};


// buttons for mic and video
const setMuteButton = () => {
	const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
	document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
	const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
	document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
	const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
	document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
	const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
	document.querySelector('.main__video_button').innerHTML = html;
};
