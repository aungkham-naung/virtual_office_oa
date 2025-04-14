import {useCallback, useEffect, useRef} from "react";
import Peer from "simple-peer";

function InitiatedVideoCall({ myStream, webrtcSocket, othersSocketId, mySocketId }) {
  // Reference to store the Peer instance
  const peerRef = useRef(null);
  
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
  }, [othersSocketId, mySocketId, myStream, webrtcSocket]);
  
  return <></>
}

export default InitiatedVideoCall;