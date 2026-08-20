import {TransitionSpecs} from '@react-navigation/stack';

//for screen transition animation effects
export const Slidingnavigation = {
  gesturesEnabled: false,
  gestureDirection: 'horizontal',
  swipeEnabled: false,
  headerShown: false,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    };
  },
};
