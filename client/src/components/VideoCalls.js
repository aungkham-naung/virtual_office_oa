import {MY_CHARACTER_INIT_CONFIG} from "./characterConstants";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import MyVideo from "./MyVideo";
import InitiatedVideoCall from "./InitiatedVideoCall";

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
  
  // Capture forwarded signal from the server
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
  }, [webrtcSocket, incomingSignals]);
  
  // Log incoming signals to the console
  useEffect(() => {
    console.log("Updated incoming signals:", incomingSignals);
  }, [incomingSignals]);
  
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