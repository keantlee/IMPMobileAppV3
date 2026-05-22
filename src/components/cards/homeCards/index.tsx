import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { moduleCardsStyles } from "../styles/moduleCards";
// NOTE: Adjust paths below based on your actual assets/icons folder
import AppIcons from "../../../assets/icons"; 
import AppImages from "../../../assets/images";

interface RenderModuleProps {
    handleViewTransactionHistory:   () => void;
    handleViewRegisteredPrograms:   () => void;
    handleViewAccreditation:        () => void;    
    handleScanQR:                   () => void; // Added QR scan to complete the 4-quadrant grid
}

export const RenderModules: React.FC<RenderModuleProps> = ({
    handleViewTransactionHistory,
    handleViewRegisteredPrograms,
    handleViewAccreditation,
    handleScanQR
}) => {
    
    // Quick helper array to loop over our 4 dashboard metrics/actions
    const modules = [
        {
            id: 'scan',
            title: 'Scan QR',
            description: 'Process distribution',
            icon: { uri: 'https://placehold.co/100' }, // fallback placeholder
            action: handleScanQR,
            bg: '#E3F2FD', // Light Blue tint
            accent: '#0D47A1'
        },
        {
            id: 'programs',
            title: 'Programs',
            description: 'View registered programs',
            icon: AppImages.intervention || { uri: 'https://placehold.co/100' },
            action: handleViewRegisteredPrograms,
            bg: '#E8F5E9', // Light Green tint
            // accent: '#1B5E20'
        },
        {
            id: 'history',
            title: 'Transaction Logs',
            description: 'Review claimed transactions',
            icon:   AppImages.transaction || { uri: 'https://placehold.co/100' },
            action: handleViewTransactionHistory,
            bg: '#FFF3E0', // Light Orange tint
            // accent: '#E65100'
        },
        {
            id: 'accreditation',
            title: 'Accreditation',
            description: 'Check supplier status',
            icon:  AppImages.accreditation || { uri: 'https://placehold.co/100' },
            action: handleViewAccreditation,
            bg: '#F3E5F5', // Light Purple tint
            // accent: '#4A148C'
        }
    ];

    return (
        <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingVertical: 12
        }}>
            {modules.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={item.action}
                    style={{
                        backgroundColor: '#ffffff',
                        width: '48%', // Creates the clean 2-column look
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#EFEFEF',
                        // Elegant native UI drop shadows
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 6,
                        elevation: 2,
                        justifyContent: 'space-between',
                        minHeight: 140
                    }}
                >
                    {/* Icon Wrapper Badge */}
                    <View style={{
                        backgroundColor: item.bg,
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 12
                    }}>
                        <Image 
                            source={item.icon} 
                            style={{ width: 70, height: 70, tintColor: item.accent, resizeMode: 'contain' }} 
                        />
                    </View>

                    {/* Metadata labels */}
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                            {item.title}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#7A7A7A', lineHeight: 14 }}>
                            {item.description}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};