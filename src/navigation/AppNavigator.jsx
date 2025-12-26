import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import ClassDetailsScreen from '../screens/ClassDetailsScreen';
import TakeAttendanceScreen from '../screens/TakeAttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
            />
            <Stack.Screen
                name="ClassDetails"
                component={ClassDetailsScreen}
            />
            <Stack.Screen
                name="TakeAttendance"
                component={TakeAttendanceScreen}
            />
            <Stack.Screen
                name="AttendanceHistory"
                component={AttendanceHistoryScreen}
            />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Home') {
                            iconName = 'home';
                        } else if (route.name === 'Statistics') {
                            iconName = 'bar-chart';
                        }
                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textSecondary,
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                    tabBarStyle: {
                        backgroundColor: COLORS.card,
                        borderTopWidth: 1,
                        height: Platform.OS === 'ios' ? 88 : 80,
                        paddingBottom: Platform.OS === 'ios' ? 28 : 18,
                        paddingTop: 8,
                        elevation: 8,
                        shadowColor: COLORS.shadow,
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                        marginTop: 4,
                    },
                    tabBarIconStyle: {
                        marginTop: 12,
                    },
                })}>
                <Tab.Screen name="Home" component={HomeStack} />
                <Tab.Screen
                    name="Statistics"
                    component={StatisticsScreen}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;