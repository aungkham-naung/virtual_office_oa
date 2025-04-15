import {useCallback, useEffect, useRef} from "react";
import Peer from "simple-peer";

function ReceivedVideoCall({mySocketId, myStream, othersSocketId, webrtcSocket, offer}) {
  const peerRef = useRef(null);
  
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
  }, [mySocketId, othersSocketId, myStream, webrtcSocket]);
  
  return <></>;
}

export default ReceivedVideoCall;