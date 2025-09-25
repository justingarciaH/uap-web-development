// /utils/gameLogic.tsx
import { FallingObject } from '../types';

interface UpdateGameProps {
  fallingObjects: FallingObject[];
  position: number;
  screenHeight: number;
  screenWidth: number;
  playerWidth: number;
  playerHeight: number;
  playerOffsetY: number;
  objectSize: number;
  gameSpeed: number;
  onScoreUpdate: (newScore: number) => void;
  onLivesUpdate: (newLives: number) => void;
  currentScore: number;
  currentLives: number;
}

export const gameLogic = {
  updateGame: ({
    fallingObjects,
    position,
    screenHeight,
    screenWidth,
    playerWidth,
    playerHeight,
    playerOffsetY,
    objectSize,
    gameSpeed,
    onScoreUpdate,
    onLivesUpdate,
    currentScore,
    currentLives,
  }: UpdateGameProps) => {
    let newScore = currentScore;
    let newLives = currentLives;

    const platformY = screenHeight - playerOffsetY - playerHeight;

    const updatedObjects = fallingObjects
      .map((obj) => {
        if (obj.caught) return obj;

        const newY = obj.y + gameSpeed;

        // Colisión con la plataforma
        if (
          newY + objectSize >= platformY &&
          newY <= platformY + playerHeight &&
          obj.x + objectSize >= position &&
          obj.x <= position + playerWidth
        ) {
          newScore += 10;
          return { ...obj, caught: true, y: platformY - objectSize };
        }

        // Restar vidas si la estrella se pierde
        if (newY > platformY + playerHeight && !obj.caught) {
          newLives = Math.max(0, newLives - 1);
        }

        return { ...obj, y: newY };
      })
      .filter((obj) => obj.y < screenHeight); // mantener atrapadas hasta que animación termine

    // Generar un nuevo objeto
    if (Math.random() > 0.95) {
      updatedObjects.push({
        id: Date.now(),
        x: Math.random() * (screenWidth - objectSize),
        y: -objectSize,
        caught: false,
      });
    }

    onScoreUpdate(newScore);
    onLivesUpdate(newLives);

    return updatedObjects;
  },

  handleGameOver: () => {
    console.log('Juego terminado');
  },
};
