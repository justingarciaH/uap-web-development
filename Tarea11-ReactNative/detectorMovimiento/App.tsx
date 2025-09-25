  import React from "react";
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from "@react-navigation/stack";
  import HomeScreen from './src/screens/HomeScreen';
  import GameScreen from './src/screens/GameScreen';
  import { RootStackParamList } from './src/types'

  const Stack = createStackNavigator<RootStackParamList>();

  export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: "#1a237e" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Detector de Movimiento" }}
          />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ title: "Juego" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }