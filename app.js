let duration = 3000;
let mediaRecorder;

let sequenceNumber = 0;
const recordButton = document.getElementById('record-button');
const video = document.getElementById('video-player');
const statusButton = document.getElementById('show-status');

// Video constraints
// Resolution: 720p, Frame Rate: 30 fps
// Encoding type: vp9 video compression
// Bit rate: 5 Mbps
const constraints = {
    video: {
        width: {ideal: 426},
        height: {ideal: 240},
        frameRate: {ideal: 30},
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 700000
    },
    audio: false
}

const start = async () => {

    // prompt the user for media permission
    navigator.mediaDevices.getUserMedia(constraints).then(async stream => {
        video.srcObject = stream;
        video.play();
        
        mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp9'});

        // Function fired every "duration" seconds
        mediaRecorder.ondataavailable = async (e) => {
            sequenceNumber++;

            let blob = e.data;
            // Upload the captured chunk to remote server
            let fd = new FormData();
            fd.append('upl', blob, `blob_${sequenceNumber}`);
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
    setTimeout( async ()=> {
        console.log("Stopping...");
        mediaRecorder.stop();

        // End the write stream on the server
        try{
            const response = await fetch("http://localhost:8000/close", {
                    method: "GET",
                });
            const result = await response.json();
            if(result.closed){
                console.log("Stream is closed on the server !")
            }
        } catch(error){
            console.error('Error while getting number of chunks uploaded.', error);
        }


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
