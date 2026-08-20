import React from 'react';
import { View, Text, Button, Platform, Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Drawerscreen from '../Components/drawerscreen';
import BottomTab from './Bottomtab';

const Drawer = createDrawerNavigator();

const Homemodule = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width:  Dimensions.get('window').width*0.85,
                    backgroundColor: Platform.OS === 'ios' ? 'darkcolor' : 'defaultcolor',
                }

            }}
            drawerContent={props => <Drawerscreen {...props} />}>
            <Drawer.Screen name="BottomTab" component={BottomTab} />
        </Drawer.Navigator>

    );
};

export default Homemodule;
