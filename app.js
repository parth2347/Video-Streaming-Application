let duration = 3000;
let chunks = [];
let startTime;
let mediaRecorder;
let i = 0;

const constraints = {
    video: {
        width: {ideal: 854}, 
        height: {ideal: 480},
        frameRate: {ideal: 30},
        mimeType: 'video/webm;codecs=H264',
        videoBitsPerSecond: 2000000
    },
    audio: false
}

const start = async () => {
    const video = document.getElementById('video-player');

    navigator.mediaDevices.getUserMedia(constraints).then(async stream => {
        video.srcObject = stream;
        video.play();
        
        mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=h264'});

        mediaRecorder.ondataavailable = async (e) => {
            i++;
            console.log(i);

            var blob = e.data;
            chunks.push(blob);

            let fd = new FormData();
            fd.append('upl', blob, `blobby_${i}.txt`)
            const response = await fetch("http://localhost:8000/video", {
                method: "POST",
                body: fd,
            });
            
            const result = await response.json();
            console.log("Success:", result);

            if (!startTime) {
                startTime = e.timeStamp;
            } else {
                const duration = e.timeStamp - startTime;
                console.log(`Chunk duration: ${duration}ms`);
                startTime = e.timeStamp;
            }
            console.log(chunks);
        };

        mediaRecorder.start(duration);
    })


    setTimeout(()=> {
        console.log("Stopping...");
        mediaRecorder.stop();
    }, 20000);
}
start();


// Create a URL object from the blob
// const downloadLink = document.createElement('a');
// const url = URL.createObjectURL(blob);
// console.log(url);
// downloadLink.href = url;
// downloadLink.download = `chunk_${i}.webm`;
// downloadLink.click();
