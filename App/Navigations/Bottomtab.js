import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { SubscriptionService } from '../Services/subscriptionService';

import HomeScreen from '../Screens/Home/home';
import SearchScreen from '../Screens/Search/search';
import BookmarkScreen from '../Screens/Bookmark/bookmark';
import ProfileScreen from '../Screens/Profile/profile';

const Tab = createBottomTabNavigator();

function NeumorphicTabBar({ state, descriptors, navigation }) {
  const checkAccessAndNavigate = async (routeName) => {
    try {
      const status = await SubscriptionService.getStatus();
      if (status && status.hasAccess === false) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TrialExpired' }]
        });
        return;
      }
    } catch (e) {}
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              checkAccessAndNavigate(route.name);
            }
          };

          let iconName = 'home';
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'SearchTab') iconName = 'search';
          else if (route.name === 'BookmarkTab') iconName = 'bookmark';
          else if (route.name === 'ProfileTab') iconName = 'user';

          return (
            <TouchableOpacity
              key={route.name}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                isFocused ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
            >
              <Feather
                name={iconName}
                size={22}
                color={isFocused ? '#25AAE2' : '#7C8BA0'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabNavigator({ navigation }) {
  useEffect(() => {
    (async () => {
      try {
        const status = await SubscriptionService.getStatus();
        if (status && status.hasAccess === false) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'TrialExpired' }]
          });
        }
      } catch (e) {}
    })();
  }, [navigation]);

  return (
    <Tab.Navigator
      tabBar={props => <NeumorphicTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="BookmarkTab" component={BookmarkScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBF2FA',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#EBF8FE',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
});
