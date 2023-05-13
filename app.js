let duration = 3000;
let mediaRecorder;

let sequenceNumber = 0;
const recordButton = document.getElementById('record-button');
const video = document.getElementById('video-player');
const statusButton = document.getElementById('show-status');

// Video constraints
// Resolution: 720p, Frame Rate: 30 fps
// Encoding type: H.264 video compression
// Bit rate: 5 Mbps
const constraints = {
    video: {
        width: {ideal: 1280},
        height: {ideal: 720},
        frameRate: {ideal: 30},
        mimeType: 'video/webm;codecs=H264',
        videoBitsPerSecond: 5000000
    },
    audio: false
}

const start = async () => {

    // prompt the user for media permission
    navigator.mediaDevices.getUserMedia(constraints).then(async stream => {
        video.srcObject = stream;
        video.play();
        
        mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=h264'});

        // Function fired every "duration" seconds
        mediaRecorder.ondataavailable = async (e) => {
            sequenceNumber++;

            let blob = e.data;
            // Upload the captured chunk to remote server
            let fd = new FormData();
            fd.append('upl', blob, `blobby_${sequenceNumber}.webm`)
            fd.append('chunkNumber', sequenceNumber);
            const response = await fetch("http://localhost:8000/video", {
                method: "POST",
                body: fd,
            });
            const result = await response.json();
            console.log(result);
        };
        
        // start the recording
        mediaRecorder.start(duration);
    })


    // Stop the live video capturing after few seconds
    setTimeout(()=> {
        console.log("Stopping...");
        mediaRecorder.stop();
    }, 20000);
}

recordButton.addEventListener('click', async () => {
    try{    
        start();
    } catch(error){
        console.error('Error accessing media devices.', error);
    }
})

statusButton.addEventListener('click', async () => {
    try{
        const response = await fetch("http://localhost:8000/getStatus", {
                method: "GET",
            });
        const result = await response.json();
        document.getElementById("myText").innerHTML = result.count;
    } catch(error){
        console.error('Error while getting number of chunks uploaded.', error);
    }
})



// Download the chunk
// const downloadLink = document.createElement('a');
// const url = URL.createObjectURL(blob);
// downloadLink.href = url;
// downloadLink.download = `chunk_${sequenceNumber}.webm`;
// downloadLink.click();
