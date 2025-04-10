import React, { useEffect } from "react";

function ReceivedVideoCall({ webrtcSocket }) {
  useEffect(() => {
    // Listener for the "offerReceived" event
    const handleOfferReceived = (data) => {
      console.log("Received offer on client 2:", data);
    };
    
    webrtcSocket.on("offerReceived", handleOfferReceived);
    
    return () => {
      webrtcSocket.off("offerReceived", handleOfferReceived);
    };
  }, [webrtcSocket]);
  
  return <></>;
}

export default ReceivedVideoCall;