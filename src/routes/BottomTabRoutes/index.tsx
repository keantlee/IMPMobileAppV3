import { JSX } from "react";
import { styles } from "./styles";
import { Icon, IconElement, IconRegistry } from '@ui-kitten/components';
import { HomeScreen, QRScreen, ProfileScreen,  } from "../../screens";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// import Icon from 'react-native-vector-icons/FontAwesome5';

const HomeIcon = ()     => <Icon name='home-outline' style={[styles.iconStyle]}/>
const QRIcon = ()       => <Icon name='home-outline' style={[styles.iconStyle]}/>
const PersonIcon = ()   => <Icon name="person-outline" style={[styles.iconStyle]}/>

interface TabRoute {
    route: string;
    label: string;
    icon: (props: { focused: boolean }) => JSX.Element;
    component: React.ComponentType<any>; // Must be a valid React component
    activeIcon: string;
    inActiveIcon: string;
    headerShown: boolean;
}

const BottomTabRoutesData: TabRoute[] = [
    {
        // Home 
        route: 'Home', 
        label: 'Home', 
        icon: HomeIcon,
        component: HomeScreen, 
        activeIcon: '',
        inActiveIcon: '',
        headerShown: false,
    },
    {
        // Profile 
        route: 'Profile', 
        label: 'Profile', 
        icon: PersonIcon,
        component: ProfileScreen, 
        activeIcon: '',
        inActiveIcon: '',
        headerShown: false,
    },
    // {
    //     // insert new component 
    //     route: '', 
    //     label: '', 
    //     icon: Icon,
    //     component: ComponentScreen, 
    //     activeIcon: '',
    //     inActiveIcon: '',
    //     headerShown: false,
    // },
];

export default BottomTabRoutesData;