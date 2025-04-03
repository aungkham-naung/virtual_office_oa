import React from "react";
import OtherCharacter from "./OtherCharacter";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";

function OtherCharacters({ OtherCharactersData }) {
  return (
    <>
      {Object.keys(OtherCharactersData).map((id) => (
        <OtherCharacter
          key={id}
          name={OtherCharactersData[id]["name"]}
          x={OtherCharactersData[id]["position"]["x"]}
          y={OtherCharactersData[id]["position"]["y"]}
          characterClass={OtherCharactersData[id]["characterClass"]}
        />
      ))}
    </>
  );
}

const mapStateToProps = (state) => {
  const OtherCharactersData = Object.keys(state.allCharacters.users)
    .filter((id) => id !== MY_CHARACTER_INIT_CONFIG.id)
    .reduce((obj, id) => {
      obj[id] = state.allCharacters.users[id];
      return obj;
    }, {});

  return { OtherCharactersData: OtherCharactersData };
};

export default connect(mapStateToProps, {})(OtherCharacters);
