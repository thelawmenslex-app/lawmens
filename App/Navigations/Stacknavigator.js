import { SubscriptionService } from '../Services/subscriptionService';
import { fcmNotificationService } from '../Services/fcmNotificationService';
import { liveSyncService } from '../Services/liveSyncService';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from '../Screens/Welcome/welcome';
import LoginScreen from '../Screens/Auth/Login/login';
import SignupScreen from '../Screens/Auth/Signup/signup';
import ForgotPasswordScreen from '../Screens/Auth/Forgotpassword/forgotpassword';
import OtpScreen from '../Screens/Auth/Otp/otp';
import BottomTabNavigator from './Bottomtab';
import ActOptionsScreen from '../Screens/ActOptions/actOptions';
import ChapterlistScreen from '../Screens/Chapterlist/chapterlist';
import MappingTableScreen from '../Screens/MappingTable/mappingTable';
import SeclistScreen from '../Screens/Seclist/seclist';
import ComparisonScreen from '../Screens/Comparison/comparison';
import SectionDetailScreen from '../Screens/SectionDetail/sectionDetail';
import MinorActsScreen from '../Screens/MinorActs/minorActs';
import PdfViewerScreen from '../Screens/PdfViewer/pdfViewer';
import SearchScreen from '../Screens/Search/search';
import NotificationsScreen from '../Screens/Notifications/notifications';
import SubscriptionScreen from '../Screens/Subscription/subscrption';
import TrialExpiredScreen from '../Screens/Subscription/TrialExpiredScreen';
import PaymentScreen from '../Screens/Payment/payment';
import HistoryScreen from '../Screens/History/history';
import SchedulesScreen from '../Screens/Schedules/schedules';
import SettingsScreen from '../Screens/Settings/settings';
import ProfileScreen from '../Screens/Profile/profile';
import BookmarkScreen from '../Screens/Bookmark/bookmark';
import AboutScreen from '../Screens/CMS/about';
import PrivacyPolicyScreen from '../Screens/CMS/privacy';
import DisclaimerScreen from '../Screens/CMS/disclaimer';
import ContactScreen from '../Screens/CMS/contact';
import TermsAndConditionsScreen from '../Screens/CMS/terms';
import {
  LoadingScreen,
  EmptyScreen,
  SuccessScreen,
  ErrorScreen,
  NoInternetScreen,
  PermissionDeniedScreen,
  PartialDataScreen,
  FormValidationErrorScreen,
  SessionExpiredScreen
} from '../Screens/StateScreens';

import LawAnimation3D from '../Components/LawAnimation3D';

const Stack = createStackNavigator();

// 3D Perspective Card Transition Interpolator
const custom3DCardInterpolator = ({ current, next, layouts }) => {
  const progress = current.progress;

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });

  const rotateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['12deg', '0deg'],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.6, 1],
  });

  return {
    cardStyle: {
      opacity,
      transform: [
        { translateX },
        { scale },
        { perspective: 1000 },
        { rotateY },
      ],
    },
  };
};

export default function Routes() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkAuthSession();
    liveSyncService.init();
    fcmNotificationService.checkAndRequestPermission();
  }, []);

  const checkAuthSession = async () => {
    try {
      const token = await AsyncStorage.getItem('@authtoken');
      if (token) {
        const subStatus = await SubscriptionService.getStatus();
        if (subStatus && subStatus.hasAccess === false) {
          setInitialRoute('TrialExpired');
        } else {
          setInitialRoute('MainTabs');
        }
      } else {
        setInitialRoute('Welcome');
      }
    } catch (e) {
      setInitialRoute('Welcome');
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#181A20', alignItems: 'center', justifyContent: 'center' }}>
        <LawAnimation3D size={100} color="#25AAE2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: custom3DCardInterpolator,
          gestureEnabled: true
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Forgotpassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="ActOptions" component={ActOptionsScreen} />
        <Stack.Screen name="Chapterlist" component={ChapterlistScreen} />
        <Stack.Screen name="MappingTable" component={MappingTableScreen} />
        <Stack.Screen name="Seclist" component={SeclistScreen} />
        <Stack.Screen name="Comparison" component={ComparisonScreen} />
        <Stack.Screen name="SectionDetail" component={SectionDetailScreen} />
        <Stack.Screen name="MinorActs" component={MinorActsScreen} />
        <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Schedules" component={SchedulesScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="TrialExpired" component={TrialExpiredScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Bookmark" component={BookmarkScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        <Stack.Screen name="Terms" component={TermsAndConditionsScreen} />
        <Stack.Screen name="LoadingState" component={LoadingScreen} />
        <Stack.Screen name="EmptyState" component={EmptyScreen} />
        <Stack.Screen name="SuccessState" component={SuccessScreen} />
        <Stack.Screen name="ErrorState" component={ErrorScreen} />
        <Stack.Screen name="NoInternetState" component={NoInternetScreen} />
        <Stack.Screen name="PermissionDeniedState" component={PermissionDeniedScreen} />
        <Stack.Screen name="PartialDataState" component={PartialDataScreen} />
        <Stack.Screen name="FormValidationErrorState" component={FormValidationErrorScreen} />
        <Stack.Screen name="SessionExpiredState" component={SessionExpiredScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
