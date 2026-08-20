import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import HomeScreen from '../Screens/Home/home';
import BookmarkScreen from '../Screens/Bookmark/bookmark';
import ProfileScreen from '../Screens/Profile/profile';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              style={styles.tabButton}
              onPress={onPress}
              activeOpacity={0.8}
            >
              {route.name === 'Home' && (
                <Feather
                  name="home"
                  size={24}
                  color={isFocused ? '#00A3FF' : '#5A6E7F'}
                />
              )}
              {route.name === 'Bookmark' && (
                <Feather
                  name="bookmark"
                  size={24}
                  color={isFocused ? '#00A3FF' : '#5A6E7F'}
                />
              )}
              {route.name === 'Profile' && (
                <Feather
                  name="user"
                  size={24}
                  color={isFocused ? '#00A3FF' : '#5A6E7F'}
                />
              )}
              {isFocused && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookmark" component={BookmarkScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#DEF3FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: 70,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#BAE6FD',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00A3FF',
    marginTop: 4,
  },
});
