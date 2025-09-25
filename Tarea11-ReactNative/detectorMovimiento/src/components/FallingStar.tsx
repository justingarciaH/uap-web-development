// components/FallingStar.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import type { FallingStarProps } from "../types";

const FallingStar = ({ x, y, size, caught, onAnimationEnd }: FallingStarProps) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (caught) {
      // animación cuando atrapamos ⭐
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(onAnimationEnd); // cuando termina, eliminar del estado
    }
  }, [caught]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={styles.starText}>⭐</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  starText: {
    fontSize: 28,
  },
});

export default FallingStar;
