import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import CanvasContext from "./CanvasContext";

import { update } from "./slices/allCharactersSlice";

import { MOVE_DIRECTIONS, MAP_DIMENSIONS, TILE_SIZE } from "./mapConstants";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import { checkMapCollision } from "./utils";

const GameLoop = ({ children, allCharactersData }) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    // frameCount used for re-rendering child components
    console.log("initial setContext");
    setContext({ canvas: canvasRef.current.getContext("2d"), frameCount: 0 });
  }, [setContext]);

  // keeps the reference to the main rendering loop
  const loopRef = useRef();
  const mycharacterData = allCharactersData[MY_CHARACTER_INIT_CONFIG.id];

  const moveMyCharacter = useCallback(
    (e) => {
      var currentPosition = mycharacterData.position;
      const atEnd = checkMapCollision(currentPosition.x, currentPosition.y);
      console.log(atEnd);
      console.log("current:", currentPosition);
      const key = e.key;
      if (MOVE_DIRECTIONS[key]) {
        // ***********************************************
        // TODO: Add your move logic here
        // y = 0 -- cannot "w"
        // y = 24 -- cannot "s"
        // x = 0 -- cannot "a"
        // x = 24 -- cannot "d"

        /* 
        export const MOVE_DIRECTIONS = {
            w: [0, -1],
            a: [-1, 0],
            s: [0, 1],
            d: [1, 0],
            };
        */

        const [x, y] = MOVE_DIRECTIONS[key];

        // if (currentPosition.x === 0 && x < 0) {
        //   return;
        // } else if (currentPosition.x === 24 && x > 0) {
        //   return;
        // }

        // if (currentPosition.y === 0 && y < 0) {
        //   return;
        // } else if (currentPosition.y === 24 && y > 0) {
        //   return;
        // }

        const newPosition = {
          x: currentPosition.x + x,
          y: currentPosition.y + y
        };

        if (checkMapCollision(newPosition.x, newPosition.y)) {
          return;
        }

        const updatedUserList = {
          ...allCharactersData,
          [MY_CHARACTER_INIT_CONFIG.id]: {
            ...mycharacterData,
            position: newPosition
          }
        };

        dispatch(update(updatedUserList));
        // console.log("updated user:", updatedUserList);
      }
    },
    [mycharacterData, allCharactersData, dispatch]
  );

  const tick = useCallback(() => {
    if (context != null) {
      setContext({
        canvas: context.canvas,
        frameCount: (context.frameCount + 1) % 60
      });
    }
    loopRef.current = requestAnimationFrame(tick);
  }, [context]);

  useEffect(() => {
    loopRef.current = requestAnimationFrame(tick);
    return () => {
      loopRef.current && cancelAnimationFrame(loopRef.current);
    };
  }, [loopRef, tick]);

  useEffect(() => {
    document.addEventListener("keydown", moveMyCharacter);
    return () => {
      document.removeEventListener("keydown", moveMyCharacter);
    };
  }, [moveMyCharacter]);

  return (
    <CanvasContext.Provider value={context}>
      <canvas
        ref={canvasRef}
        width={TILE_SIZE * MAP_DIMENSIONS.COLS}
        height={TILE_SIZE * MAP_DIMENSIONS.ROWS}
        class="main-canvas"
        tabIndex="0"
      />
      {children}
    </CanvasContext.Provider>
  );
};

const mapStateToProps = (state) => {
  return { allCharactersData: state.allCharacters.users };
};

export default connect(mapStateToProps, {})(GameLoop);
