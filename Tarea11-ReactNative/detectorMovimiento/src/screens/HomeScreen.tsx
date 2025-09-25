import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}> Bienvenido al </Text>
        <Text style={styles.title}> ⭐ Atrapa Estrellas </Text>
        <Text style={styles.title}> Justino ⭐ </Text>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e', // Color de fondo del juego
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 4, // Coloca el título más arriba
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#bdbdbd',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffc107', // Un amarillo brillante para el botón
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    position: 'absolute',
    bottom: SCREEN_HEIGHT / 4, // Coloca el botón más abajo
  },
  buttonText: {
    color: '#1a237e',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default HomeScreen;