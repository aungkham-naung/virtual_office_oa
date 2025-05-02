import {useCallback, useEffect, useRef, useState} from "react";
import Peer from "simple-peer";

function ReceivedVideoCall({mySocketId, myStream, othersSocketId, webrtcSocket, offer}) {
  const peerRef = useRef(null);
  const [othersVideo, setOthersVideo] = useState(null); // State to store others video
  const setVideoNode = useCallback(videoNode => { // Displaying Video Stream
    videoNode && (videoNode.srcObject = othersVideo);
  }, [othersVideo]);
  
  const createPeer = useCallback((othersSocketId, mySocketId, myStream, webrtcSocket, offer) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: myStream,
    });
    
    // Receiving signal from the server under the event 'forwardSignal'
    peer.on('signal', (signal) => {
      webrtcSocket.emit('sendReturnedSignal', { // send the signal back to the server
        toUser: othersSocketId,
        fromUser: mySocketId,
        offer: signal
      })
    })
    
    peer.signal(offer); // Signal the incoming offer
    return peer;
  }, []);
  
  useEffect(() => {
    peerRef.current = createPeer(othersSocketId, mySocketId, myStream, webrtcSocket, offer);
    
    // Event handler to set video
    const handleSentSignal = (signal) => {
      if(signal.fromUser === othersSocketId && peerRef.current) {
        console.log("Received returned signal", signal.fromUser);
        peerRef.current.signal(signal.offer)
      }
    }
    
    const handleStream = (stream) => {
      console.log("Received stream from peer");
      setOthersVideo(stream);
    }
    
    webrtcSocket.on('forwardSignal', handleSentSignal);
    peerRef.current.on('stream', handleStream);
    
    return () => {
      webrtcSocket.off("forwardSignal", handleSentSignal);
      
      if (peerRef.current) {
        peerRef.current.off("stream", handleStream);
        peerRef.current.destroy();
      }
    }
  }, [mySocketId, othersSocketId, myStream, webrtcSocket]);
  
  return <>
    {othersVideo && <video width="200px" ref={setVideoNode} autoPlay={true}/>}
  </>;
}

export default ReceivedVideoCall;