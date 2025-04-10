import {useEffect, useState} from "react";
import MyVideo from "./MyVideo";
import InitiatedVideoCall from "./InitiatedVideoCall";
import ReceivedVideoCall from "./ReceivedVideoCall";
import {MY_CHARACTER_INIT_CONFIG} from "./characterConstants";
import {connect} from "react-redux";

function VideoCalls({myCharacterData, otherCharactersData, webrtcSocket}) {
  const [myStream, setMyStream] = useState(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((stream) => {
        setMyStream(stream);
      });
  }, [])
  const myUserId = myCharacterData?.id;
  const initiateCallToUsers = Object.keys(otherCharactersData)
    .filter((othersUserId) => othersUserId >= myUserId)
    .reduce((filteredObj, key) => {
      filteredObj[key] = otherCharactersData[key];
      return filteredObj;
    }, {})
  
  return <>
    {
      myCharacterData && <div className="videos">
        <MyVideo myStream={myStream} />
        { Object.keys(initiateCallToUsers).map((othersUserId) => {
          return <InitiatedVideoCall
            key={initiateCallToUsers[othersUserId].socketId}
            mySocketId={myCharacterData.socketId}
            myStream={myStream}
            othersSocketId={initiateCallToUsers[othersUserId].socketId}
            webrtcSocket={webrtcSocket}
          />
        })}
        <ReceivedVideoCall webrtcSocket={webrtcSocket}/>
      
      </div>
    }
  </>
}

const mapStateToProps = (state) => {
  const myCharacterData = state.allCharacters.users[MY_CHARACTER_INIT_CONFIG.id];
  const otherCharactersData = Object.keys(state.allCharacters.users)
    .filter(id => id !== MY_CHARACTER_INIT_CONFIG.id)
    .reduce((filteredObj, key) => {
      filteredObj[key] = state.allCharacters.users[key];
      return filteredObj;
    }, {});
  return {myCharacterData: myCharacterData, otherCharactersData: otherCharactersData};
}

export default connect(mapStateToProps, {})(VideoCalls);