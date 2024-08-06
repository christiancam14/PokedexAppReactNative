import 'react-native-gesture-handler';

import {StackNavigator} from './presentation/navigator/StackNavigator';
import {NavigationContainer} from '@react-navigation/native';

export const PokedexApp = () => {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};
