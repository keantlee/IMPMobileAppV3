import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Profile from '../screens/profile';
import ManageAccount from '../screens/profile/manageAccount';
import OfficeInfo from '../screens/profile/officeInfo';
import Documentation from '../screens/profile/documentation';
import Accreditation from '../screens/profile/accreditation';
import AppInformation from '../screens/profile/appInformation';
import ScreenNames from './screenNames';

export type ProfileStackParamList = {
  [key: string]: undefined | object;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackComponents: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
      initialRouteName={ScreenNames.PROFILE_STACK.PROFILE_MAIN}>
      <Stack.Screen
        name={ScreenNames.PROFILE_STACK.PROFILE_MAIN}
        component={Profile}
      />
      <Stack.Screen
        name={ScreenNames.PROFILE_STACK.MANAGE_ACCOUNT}
        component={ManageAccount}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name={ScreenNames.PROFILE_STACK.OFFICE_INFO}
        component={OfficeInfo}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name={ScreenNames.PROFILE_STACK.DOCUMENTATION}
        component={Documentation}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name={ScreenNames.PROFILE_STACK.ACCREDITATION}
        component={Accreditation}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name={ScreenNames.PROFILE_STACK.APP_INFORMATION}
        component={AppInformation}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackComponents;
