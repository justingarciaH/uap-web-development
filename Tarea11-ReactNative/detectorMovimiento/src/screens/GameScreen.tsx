// /screens/GameScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Platform from '../components/Platform';
import GameOver from '../components/GameOver';
import FallingStar from '../components/FallingStar';
import { gameLogic } from '../utils/gameLogic';
import { FallingObject } from '../types';

const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 20;
const PLAYER_OFFSET_Y = 50;
const OBJECT_SIZE = 30;
const GAME_SPEED = 10;
const LIVES = 3;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const GameScreen = () => {
  const [position, setPosition] = useState(SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Acelerómetro (suscripción única)
  useEffect(() => {
    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x }) => {
      setPosition(prev => Math.max(0, Math.min(SCREEN_WIDTH - PLAYER_WIDTH, prev + x * 50)));
    });
    return () => subscription.remove();
  }, []);

  // Lógica principal del juego
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setFallingObjects(prevObjects => 
        gameLogic.updateGame({
          fallingObjects: prevObjects,
          position,
          screenHeight: SCREEN_HEIGHT,
          screenWidth: SCREEN_WIDTH,
          playerWidth: PLAYER_WIDTH,
          playerHeight: PLAYER_HEIGHT,
          playerOffsetY: PLAYER_OFFSET_Y,
          objectSize: OBJECT_SIZE,
          gameSpeed: GAME_SPEED,
          currentScore: score,
          currentLives: lives,
          onScoreUpdate: setScore,
          onLivesUpdate: setLives
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, score, lives]);

  // Detectar fin de juego
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      gameLogic.handleGameOver();
    }
  }, [lives, gameOver]);

  const handleRestart = () => {
    setScore(0);
    setLives(LIVES);
    setFallingObjects([]);
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      {gameOver ? (
        <GameOver score={score} onRestart={handleRestart} />
      ) : (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.text}>Puntos: {score}</Text>
            <Text style={styles.text}>Vidas: {lives}</Text>
          </View>
          <Platform position={position} />
          {fallingObjects.map(obj => (
            <FallingStar
              key={obj.id}
              x={obj.x}
              y={obj.y}
              size={OBJECT_SIZE}
              caught={obj.caught || false}
              onAnimationEnd={() => {
                setFallingObjects(prev => prev.filter(o => o.id !== obj.id));
              }}
            />
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a237e" },
  infoContainer: {
    position: "absolute",
    top: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  text: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
});

export default GameScreen;
