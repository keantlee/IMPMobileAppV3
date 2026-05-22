import React, { useState, useMemo, useCallback, useRef } from 'react';
import { StatusBar, View, Text, Image, FlatList, ScrollView, TouchableOpacity, Pressable, TextInput} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native'; 
import { styles } from './styles';
import { useAuthStore } from '../../../store/useAuthStore';


interface VoucherQrProps {
    navigation: any;
}

const VoucherQR = ({ navigation }: VoucherQrProps) => {
    // Extact params save from session
    const params  = useAuthStore((state) => state.user);
    const email     = params?.email;
    const programs  = params?.programs || [];

    console.log('[Voucher QR Screen] check session params: ', params);

    
}

export default VoucherQR;
