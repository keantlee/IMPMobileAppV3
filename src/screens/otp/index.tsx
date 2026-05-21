import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    Image, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginSchema, LoginFormData } from '../../types/schemas/loginSchema';
import { useLoginMutation } from '../../api/auth'; // Our brand new TanStack Hook wrapper
import { styles } from './styles';
import { Images } from '../../assets';
import AwesomeAlert from 'react-native-awesome-alerts';
import MaskedEmail from '../../components/maskedEmail';

interface OtpProps {
    navigation: any;
};

const Otp = ({ navigation }: OtpProps) => {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.subContainer}>
                    <View style={styles.logoContainer}>
                        <Image
                            style={styles.logo}                        
                            source={Images.logos.daLogo}
                            resizeMode="contain"                      
                        />
                    </View>   

                     <Text style={ styles.textTitle }> OTP Verification </Text>
                     <Text style={ styles.text }>Enter the 6-digit code send to  {'\n'} <MaskedEmail email="kentley.ong@mail.da.gov.ph" /> </Text>
                </View>
            </SafeAreaView>
        );
}

export default Otp;

