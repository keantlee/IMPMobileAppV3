import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { useAuthStore } from '../../store/useAuthStore';
import { RenderModules } from '../../components/cards'; 
import AppIcons from '../../assets/icons';

interface HomeProps {
    navigation: any;
}

interface IListItem {
    id: string;
    refNo: string;
    transactDate: string;
    amount: string;
    status: string;
}

const mockTransactions: IListItem[] = [
    { id: '1', refNo: 'REF-SVZ-8831', transactDate: 'May 22, 2026', amount: '₱15,000.00', status: 'Success' },
    { id: '2', refNo: 'REF-RFDV-9912', transactDate: 'May 20, 2026', amount: '₱5,000.00', status: 'Success' },
    { id: '3', refNo: 'REF-RFDV-4412', transactDate: 'May 19, 2026', amount: '₱7,500.00', status: 'Success' },
    { id: '4', refNo: 'REF-CFDV-1029', transactDate: 'May 15, 2026', amount: '₱3,000.00', status: 'Success' },
    { id: '5', refNo: 'REF-SVZ-3321', transactDate: 'May 12, 2026', amount: '₱15,000.00', status: 'Success' },
];

const Home = ({ navigation }: HomeProps) => {
    const userProfile   = useAuthStore((state) => state.user);
    const fullName      = userProfile?.fullName;
    const supplierName  = userProfile?.supplierName;

    const handleViewRegisteredPrograms = () => console.warn('View Registered Programs');
    const handleViewAccreditation      = () => console.warn('View Accreditation');
    const handleViewTransactionHistory = () => console.warn('View All Transaction History');
    const handleScanQR                 = () => console.log('Opening Scanner view...');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            {/* Header Identity Block */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 20,
                backgroundColor: '#009246',
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.05,
                shadowRadius: 8
            }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Welcome Back
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: '800', color: '#ffffff', marginVertical: 2 }}>
                        {fullName}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: '#ffffff', fontWeight: '600' }}>
                        📍 {supplierName}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => console.warn('Go to profile screen')}
                >
                    <Image source={AppIcons.userIcon || { uri: 'https://placehold.co/100' }} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
            </View>

            {/* Main Dynamic Scrolling Screen Frame */}
            <FlatList
                data={null} // We set data to null because we use ListHeaderComponent as our dashboard layout builder
                renderItem={null}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={{ marginTop: 20 }}>
                        
                        {/* 4 Dashboard Metric Quadrants */}
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#2C3E50', marginBottom: 12 }}>
                            Menu
                        </Text>
                        
                        <RenderModules 
                            handleViewTransactionHistory={handleViewTransactionHistory}
                            handleViewRegisteredPrograms={handleViewRegisteredPrograms}
                            handleViewAccreditation={handleViewAccreditation}
                            handleScanQR={handleScanQR}
                        />

                        {/* The unified transaction card container */}
                        <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 16,
                            padding: 16,
                            marginTop: 16,
                            marginHorizontal: 2, // KEY FIX: Creates a tiny breathing room inside the container so shadows don't clip!
                            borderWidth: 1,
                            borderColor: '#EFEFEF',
                            
                            // 360-Degree Premium Shadow Configuration
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.06,
                            shadowRadius: 10,
                            elevation: 4 // Crisp elevation for modern Android devices
                        }}>
                            
                            {/* Card Header Section */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16
                            }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#2C3E50' }}>
                                    Recent Voucher Claims
                                </Text>
                                <TouchableOpacity onPress={handleViewTransactionHistory}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#3498DB' }}>
                                        See All
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Loop rendering the latest 5 transactions cleanly inside this secure card panel */}
                            {mockTransactions.map((item) => (
                                <TouchableOpacity 
                                    key={item.id}
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: '#FAFAFA',
                                        padding: 14,
                                        borderRadius: 10,
                                        marginBottom: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: '#EAEAEA'
                                    }}
                                >
                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 4 }}>
                                            {item.refNo}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#95A5A6' }}>
                                            {item.transactDate}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#2E7D32', marginBottom: 4 }}>
                                            {item.amount}
                                        </Text>
                                        <View style={{
                                            backgroundColor: '#E8F5E9',
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                            borderRadius: 4
                                        }}>
                                            <Text style={{ fontSize: 10, color: '#2E7D32', fontWeight: '600' }}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default Home;