import React, {useCallback, useEffect, useRef, useState} from "react";
import Peer from "simple-peer";

function InitiatedVideoCall({ myStream, webrtcSocket, othersSocketId, mySocketId }) {
  // Reference to store the Peer instance
  const peerRef = useRef(null);
  const [othersVideo, setOthersVideo] = useState(null);   // State to store others video
  const setVideoNode = useCallback(videoNode => {   // Displaying Video Stream
    videoNode && (videoNode.srcObject = othersVideo);
  }, [othersVideo]);
  
  // Function to create a new Peer instance and does not get recreate on every render
  const createPeer = useCallback((othersSocketId, mySocketId, myStream, webrtcSocket) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: myStream,
    });
    
    // Sending signal to the server under the event 'sendSignal'
    peer.on('signal', (signal) => {
      webrtcSocket.emit('sendSignal', {
        toUser: othersSocketId,
        fromUser: mySocketId,
        offer: signal
      })
    })
    
    return peer;
  }, []);
  
  // Creates a new Peer instance when the component mounts or when the dependencies change
  useEffect(() => {
    peerRef.current = createPeer(othersSocketId, mySocketId, myStream, webrtcSocket);
    
    // Event handler to manage returned signal
    const handleReturnedSignal = (signal) => {
      if(signal.fromUser === othersSocketId && peerRef.current) {
        console.log("Received returned signal", signal.fromUser);
        peerRef.current.signal(signal.offer)
      }
    }
    
    // Event handler to set video
    const handleStream = (stream) => {
      console.log("Received stream from peer");
      setOthersVideo(stream);
    }
    
    webrtcSocket.on('forwardReturnedSignal', handleReturnedSignal);
    peerRef.current.on('stream', handleStream);
    
    return () => {
      webrtcSocket.off("forwardReturnedSignal", handleReturnedSignal);
      
      if (peerRef.current) {
        peerRef.current.off("stream", handleStream);
        peerRef.current.destroy();
      }
    }
  }, [othersSocketId, mySocketId, myStream, webrtcSocket]);
  
  return <>
    {othersVideo && <video width="200px" ref={setVideoNode} autoPlay={true}/> }
  </>
}

export default InitiatedVideoCall;