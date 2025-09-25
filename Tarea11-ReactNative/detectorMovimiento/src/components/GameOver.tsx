// src/screens/GameOver.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

const GameOver = ({ score, onRestart }: GameOverProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Fin del juego!</Text>
      <Text style={styles.score}>Puntaje Final: {score}</Text>
      <Button title="Reiniciar juego" onPress={onRestart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',  // Semi-transparente para sombrear el fondo
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  score: {
    fontSize: 24,
    color: 'white',
  },
});

export default GameOver;