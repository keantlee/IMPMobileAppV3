import user from './user.png';
import receipt from './receipt.png';
import check from './check.png';
import close from './close.png';
import loadingIcon from './da-loading.gif';
import { Image } from 'react-native';

const AppIcons = {
    userIcon:       user,
    receiptIcon:    receipt,
    checkIcon:      check,
    closeIcon:      close,
    loadingIcon:    loadingIcon,
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