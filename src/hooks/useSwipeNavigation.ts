// src/hooks/useSwipeNavigation.ts
import { Platform, PanResponder, GestureResponderHandlers } from "react-native";
import { Gesture, Directions } from "react-native-gesture-handler";

type SwipeConfig = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

/**
 * Hook universal:
 * - No mobile → usa GestureHandler (Fling)
 * - Na Web → usa PanResponder (arrastar mouse)
 */
export function useSwipeNavigation({ onSwipeLeft, onSwipeRight }: SwipeConfig) {
  // ======== SWIPE WEB (mouse + trackpad) ========
  const panResponder: GestureResponderHandlers =
    Platform.OS === "web"
      ? PanResponder.create({
          onMoveShouldSetPanResponder: (_, gesture) => {
            return (
              Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
              Math.abs(gesture.dx) > 10
            );
          },
          onPanResponderRelease: (_, gesture) => {
            if (gesture.dx < -40 && onSwipeLeft) onSwipeLeft();
            if (gesture.dx > 40 && onSwipeRight) onSwipeRight();
          },
        }).panHandlers
      : {};

  // ======== SWIPE MOBILE (GestureHandler) ========
  const flingLeft =
    Platform.OS !== "web" && onSwipeLeft
      ? Gesture.Fling().direction(Directions.LEFT).onEnd(onSwipeLeft)
      : undefined;

  const flingRight =
    Platform.OS !== "web" && onSwipeRight
      ? Gesture.Fling().direction(Directions.RIGHT).onEnd(onSwipeRight)
      : undefined;

  let gestureWrapper = null;

  if (Platform.OS !== "web" && flingLeft && flingRight) {
    gestureWrapper = Gesture.Race(flingLeft, flingRight);
  }

  return {
    panResponder,
    gestureWrapper,
  };
}
