import {MY_CHARACTER_INIT_CONFIG} from "./characterConstants";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import MyVideo from "./MyVideo";
import InitiatedVideoCall from "./InitiatedVideoCall";
import ReceivedVideoCall from "./ReceivedVideoCall";

function VideoCalls({webrtcSocket, myCharacterData, otherCharactersData}) {
  const [myStream, setMyStream] = useState(null); // state to hold the video stream
  const [incomingSignals, setIncomingSignals] = useState({}); // state to store incoming signals
  
  // mount video stream on load
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then(stream => {
        setMyStream(stream);
      });
  }, []);
  
  // Capture forwarded signal from the server (from Client A to Client B)
  useEffect(() => {
    webrtcSocket.on('forwardSignal', (data) => {
      console.log(data)
      if(!Object.keys(incomingSignals).includes(data.fromUser)) {
        setIncomingSignals({
          ...incomingSignals,
          [data.fromUser]: data.offer
        });
      }
    });
  }, [webrtcSocket]);
  
  // Capture returned signal from the server (from Client B to Client A)
  useEffect(() => {
    webrtcSocket.on('forwardReturnedSignal', (data) => {
      console.log(data)
    });
  }, [webrtcSocket]);
  
  // Log incoming signals to the console
  // useEffect(() => {
  //   console.log("Updated incoming signals:", incomingSignals);
  // }, [incomingSignals]);
  
  
  // Filter out the characters to call
  const myUserId = myCharacterData?.id
  const usersToCall = Object.keys(otherCharactersData)
    .filter((otherUsersId) => otherUsersId >= myUserId)
    .reduce((filteredObj, key) => {
      filteredObj[key] = otherCharactersData[key];
      return filteredObj;
    }, {});
  
  
  return (
    <>
      <MyVideo myStream={myStream} />
      {Object.keys(usersToCall).map((userKey) => {
        const userData = usersToCall[userKey];
        return (
          <InitiatedVideoCall
            key={userData.socketId}
            mySocketId={myCharacterData.socketId}
            webrtcSocket={webrtcSocket}
            myStream={myStream}
            othersSocketId={userData.socketId}
          />
        );
      })}
      
      // Render the received video calls
      {Object.keys(incomingSignals).map((othersSocketId) => {
        const duplicateId = Object.keys(otherCharactersData)
          .filter((otherUsersId) => otherCharactersData[otherUsersId].socketId === othersSocketId)
        console.assert(
          duplicateId.length === 1,
          "Unexpected duplicate socket ID found in incoming signals",
          duplicateId
        )
        
        return (
          <ReceivedVideoCall
            key={othersSocketId}
            mySocketId={myCharacterData.socketId}
            myStream={myStream}
            webrtcSocket={webrtcSocket}
            othersSocketId={othersSocketId}
            offer={incomingSignals[othersSocketId]} />
        )
      })}
    </>
  )
}

// Get all characters from Redux
const mapStateToProps = (state) => {
  const myCharacterData = state.allCharacters.users[MY_CHARACTER_INIT_CONFIG.id]
  const otherCharactersData = Object.keys(state.allCharacters.users)
    .filter((id) => id !== MY_CHARACTER_INIT_CONFIG.id)
    .reduce((filteredObj, key) => {
      filteredObj[key] = state.allCharacters.users[key];
      return filteredObj;
    }, {});
  
  return { myCharacterData: myCharacterData, otherCharactersData: otherCharactersData };
};

export default connect(mapStateToProps, {})(VideoCalls);