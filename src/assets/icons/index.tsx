import user from './user.png';
import receipt from './receipt.png';
import check from './check.png';
import close from './close.png';
import loadingIcon from './da-loading.gif';
import { Image } from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AppIcons = {
    userIcon:               user,
    receiptIcon:            receipt,
    checkIcon:              check,
    closeIcon:              close,
    loadingIcon:            loadingIcon,
    Octicons:               Octicons,
    FontAwesome:            FontAwesome,
    FontAwesome5:           FontAwesome5,
    Ionicons:               Ionicons,
    MaterialCommunityIcons: MaterialCommunityIcons,
    Fontisto:               Fontisto,
    MaterialIcons:          MaterialIcons
} as const;

export const renderAlertPng = (type: 'success' | 'info' | 'warning' | 'error' | string) => {
    // Map your alert states straight to your PNG assets
    const iconSource = type === 'success' ? AppIcons.checkIcon : AppIcons.closeIcon;

    return (
        <Image 
            source={iconSource} 
            style={{ width: 50, height: 50, resizeMode: 'contain' }} 
        />
    );
};

export default AppIcons;