import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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
import SearchScreen from '../Screens/Search/search';
import NotificationsScreen from '../Screens/Notifications/notifications';
import SubscriptionScreen from '../Screens/Subscription/subscrption';
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

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
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
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Schedules" component={SchedulesScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
