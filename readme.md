Client side: app.js

The client-side JavaScript code that is executed in the browser is called app.js. The MediaRecorder API is configured in this file to record video, and it then sends each chunk of video it has captured to the server for storage.
The optimal resolution, frame rate, and mimeType for the recording are specified in the start() function's video constraints, which are used to initialize a MediaRecorder object. The MediaRecorder ondataavailable event listener is then configured, and it is triggered each time a new video chunk becomes available.
Each video chunk is added to an array of chunks and stored as a Blob object. After that, the Blob object is joined to a FormData object and submitted to the server as a POST request. 
The mediaRecorder.stop() method is used to cease recording the video after a predetermined amount of time (in this case, 20 seconds).

Server side: server.js

On the server side we are using NodeJs framework that listens for incoming HTTP requests and performs actions based on those requests. The server.js file sets up an Express.js server that listens on port 8000 for incoming HTTP requests. It also creates a MySQL database connection pool to handle database connections. 
When a POST request is received on the /video endpoint, the upload.single() middleware function from the Multer library is used to extract the video chunk from the request body. The video chunk is then stored in the video_segments table of the MySQL database along with a unique ID, the filename and the date of upload.
If there is an error inserting the data into the database, a 500 Internal Server Error response is sent to the client. If the insertion is successful, a 200 OK response is sent.

Html file: index.html

The client is provided with the primary HTML file, index.html. This file includes a video element to show the live video.

Conclusion:

The three files collectively record video in the client's browser, transfer each video chunk to the server for storage in a MySQL database, and show the live video on the client's screen.


