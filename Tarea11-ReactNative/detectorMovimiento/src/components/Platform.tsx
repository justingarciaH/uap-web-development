// componente para la plataforma que se mueve segun el acelerometro 
import React from 'react';
import { View, StyleSheet } from 'react-native';

type PlatformProps = {
    position: number;
}

const Platform = ({ position}: PlatformProps) => {
    return (
        <View style = {[styles.platform, { transform: [{ translateX: position}] }] } />
    )
}

const styles = StyleSheet.create ({
    platform: {
        width: 100,
        height: 20,
        backgroundColor: 'blue',
        position: 'absolute',
        bottom: 50,
    },
})

export default Platform;
