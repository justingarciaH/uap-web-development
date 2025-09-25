export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
};


export type FallingStarProps = {
  x: number;
  y: number;
  size: number;
  caught: boolean; // si la atrapamos
  onAnimationEnd: () => void; // para eliminarla del estado después de animar
};


export type FallingObject = {
  id: number;
  x: number;
  y: number;
  caught?: boolean; // opcional
};
