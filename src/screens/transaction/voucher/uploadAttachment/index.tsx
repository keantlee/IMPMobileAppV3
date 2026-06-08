import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    FlatList,
    BackHandler,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary, Asset, PhotoQuality } from 'react-native-image-picker';

import { AttachmentSchema, AttachmentFormData } from '../../../../types/schemas/AttachmentSchema';
import ScreenNames from '../../../../navigation/screenNames';
import { styles } from './styles';
import { UploadAttachments } from '../../../../@types/attachment';

interface TransactionRouteParams {
    uploadAttachments: UploadAttachments;  
}

// Layout helper mapping matrix for fixed document slot items
interface FixedSlotConfig {
    key: keyof Omit<AttachmentFormData, 'otherDocs'>;
    label: string;
}

const FIXED_SLOTS: FixedSlotConfig[] = [
    { key: 'beneficiary', label: 'Beneficiary with Commodity' },
    { key: 'frontID',     label: 'Front Valid ID' },
    { key: 'backID',      label: 'Back Valid ID' },
    { key: 'receipt',     label: 'Receipt' },
];

const UploadAttachment = () => {
    const navigation = useNavigation<any>();
    const route      = useRoute<any>();

    const routeParams           = (route.params || {}) as TransactionRouteParams;
    const { uploadAttachments } = routeParams;

    console.log('[UPLOAD ATTACHMENT SCREEN] Incoming parameters structure:', routeParams);

    // 1. Centralized Form Engine Controller Initialization
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<AttachmentFormData>({ 
        resolver: zodResolver(AttachmentSchema),
        defaultValues: {
            beneficiary:    undefined,
            frontID:        undefined,
            backID:         undefined,
            receipt:        undefined,
            otherDocs:      [],
        }
    });

    // Watchers for immediate real-time layout rendering evaluation updates
    const currentFormValues = watch();

    // 2. Active Selection Overlay Management States
    const [activeSelector, setActiveSelector] = useState<{ fieldName: keyof AttachmentFormData; mode: 'fixed' | 'array' } | null>(null);
    const [lightboxUri, setLightboxUri] = useState<string | null>(null);

    // 3. Image Picker Camera/Gallery Selection Hooks
    const triggerImagePicker = async (source: 'camera' | 'gallery') => {
        if (!activeSelector) return;

        // Flatten the options object so properties sit at the top level
        const options = {
            mediaType: 'photo' as const,
            quality: 0.75 as PhotoQuality,
            maxWidth: 1200,
            maxHeight: 1200,
            selectionLimit: 1,
            includeBase64: false,
        };

        // Correctly await the method execution
        const result = source === 'camera' 
            ? await launchCamera(options) 
            : await launchImageLibrary(options);

        console.log("[UPLOAD ATTACHMENTS] picker result:", result);

        const targetSelection = activeSelector;
        setActiveSelector(null);

        if (result.didCancel || result.errorMessage || !result.assets?.[0]) return;
        const freshAsset = result.assets[0];

        const formattedAsset = {
            uri:       freshAsset.uri || '',
            fileName:  freshAsset.fileName || `upload_${Date.now()}.jpg`,
            type:      freshAsset.type || 'image/jpeg',
        };

        if (targetSelection.mode === 'fixed') {
            setValue(targetSelection.fieldName as keyof Omit<AttachmentFormData, 'otherDocs'>, formattedAsset, { shouldValidate: true });
        } else {
            const dynamicFilesArray = currentFormValues.otherDocs || [];
            setValue('otherDocs', [...dynamicFilesArray, formattedAsset], { shouldValidate: true });
        }
    };

    const clearFixedSlot = (fieldName: keyof Omit<AttachmentFormData, 'otherDocs'>) => {
        setValue(fieldName, null, { shouldValidate: true });
    };

    const removeSupplementalDocIndex = (targetIndex: number) => {
        const structuralArray = currentFormValues.otherDocs || [];
        const cleanFilteredSet = structuralArray.filter((_, idx) => idx !== targetIndex);
        setValue('otherDocs', cleanFilteredSet, { shouldValidate: true });
    };

    // 4. Submit Verification Method Handler
    const onSubmit = (data: AttachmentFormData) => {
        console.log("[UPLOAD ATTACHMENT] Form payload structurally validated by Zod schema:", data);
        
        Alert.alert(
            "Upload Complete",
            "Are you sure you want to finalize and save these verification documents?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Upload",
                    onPress: () => {
                        // Place your RTK Query/TanStack mutation action trigger logic package here.
                        Alert.alert("Success", "Transaction materials uploaded successfully.", [
                            { text: "OK", onPress: () => navigation.navigate(ScreenNames.BOTTOM_TABS.HOME) }
                        ]);
                    }
                }
            ]
        );
    };

    // 5. Back Navigation Controllers
    const handleSyncAndGoBack = useCallback(() => {
        // When back to home reset the form
        navigation.navigate(ScreenNames.BOTTOM_TABS.HOME);
    }, [navigation]);

    useEffect(() => {
        const hardwareBackAction = () => {
            handleSyncAndGoBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", hardwareBackAction);
        return () => backHandler.remove();
    }, [handleSyncAndGoBack]);

    // 6. Fragment Sub-Layout Elements Rendering Blocks
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleSyncAndGoBack} activeOpacity={0.7}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Upload Attachments</Text>
            <View style={styles.backPlaceholder} />
        </View>
    );

    const renderFixedSlotRow = ({ item }: { item: FixedSlotConfig }) => {
        const errorObject = errors[item.key];

        return (
            <Controller
                control={control}
                name={item.key}
                render={({ field: { value } }) => (
                    <View style={[styles.slotCard, errorObject && styles.slotCardError]}>
                        <View style={styles.slotDetails}>
                            <Text style={styles.slotName}>
                                {item.label} <Text style={styles.asterisk}>*</Text>
                            </Text>
                            <Text style={[styles.slotStatus, value && { color: '#009246', fontWeight: '600' }]}>
                                {value ? "✓ Ready to submit" : "No attachment uploaded"}
                            </Text>
                            {errorObject?.message && (
                                <Text style={styles.errorFieldMessage}>{String(errorObject.message)}</Text>
                            )}
                        </View>

                        {value?.uri ? (
                            <View style={styles.thumbnailContainer}>
                                <TouchableOpacity onPress={() => setLightboxUri(value.uri || null)}>
                                    <Image source={{ uri: value.uri }} style={styles.thumbnailPreview} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.removeBadge} onPress={() => clearFixedSlot(item.key)}>
                                    <MaterialIcons name="cancel" size={18} color="#D9383A" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.uploadTriggerButton}
                                onPress={() => setActiveSelector({ fieldName: item.key, mode: 'fixed' })}
                            >
                                <MaterialIcons name="add-a-photo" size={22} color="#009246" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />
            {renderHeader()}

            <FlatList
                data={FIXED_SLOTS}
                renderItem={renderFixedSlotRow}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.scrollContainer}
                ListFooterComponent={
                    <View style={{ marginTop: 16 }}>
                        <Text style={styles.sectionTitle}>Other Supporting Documents (Optional)</Text>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollWrapper}>
                            <TouchableOpacity 
                                style={styles.addOtherButtonCard}
                                onPress={() => setActiveSelector({ fieldName: 'otherDocs', mode: 'array' })}
                            >
                                <MaterialIcons name="note-add" size={24} color="#7F8C8D" />
                                <Text style={styles.addOtherText}>Add Photo</Text>
                            </TouchableOpacity>

                            {(currentFormValues.otherDocs || []).map((file: any, index: number) => (
                                <View key={index} style={styles.otherThumbnailWrapper}>
                                    <TouchableOpacity onPress={() => setLightboxUri(file.uri || null)}>
                                        <Image source={{ uri: file.uri }} style={styles.otherThumbnail} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.otherRemoveBadge} onPress={() => removeSupplementalDocIndex(index)}>
                                        <MaterialIcons name="close" size={14} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                }
            />

            {/* --- FIXED SUBMIT ACTION BOTTOM STRIP BAR --- */}
            <View style={styles.bottomDock}>
                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit(onSubmit)}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="cloud-upload" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>UPLOAD</Text>
                </TouchableOpacity>
            </View>

            {/* --- CAPTURE MODAL MEDIA SOURCE ACTIONS SELECTION SHEET --- */}
            <Modal visible={activeSelector !== null} transparent animationType="slide">
                <Pressable style={styles.modalOverlay} onPress={() => setActiveSelector(null)}>
                    <View style={styles.bottomSheetContainer}>
                        <Text style={styles.sheetTitle}>Choose Document Source</Text>
                        <View style={styles.sheetRow}>
                            <TouchableOpacity style={styles.sheetActionItem} onPress={() => triggerImagePicker('camera')}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                                    <MaterialIcons name="photo-camera" size={28} color="#009246" />
                                </View>
                                <Text style={styles.sheetActionText}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sheetActionItem} onPress={() => triggerImagePicker('gallery')}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                                    <MaterialIcons name="collections" size={28} color="#1976D2" />
                                </View>
                                <Text style={styles.sheetActionText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* --- LIGHTBOX PHOTO EXPANSION PREVIEW MODAL --- */}
            <Modal visible={lightboxUri !== null} transparent animationType="fade">
                <View style={styles.lightboxOverlay}>
                    <TouchableOpacity style={styles.lightboxCloseButton} onPress={() => setLightboxUri(null)}>
                        <MaterialIcons name="close" size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                    {lightboxUri && <Image source={{ uri: lightboxUri }} style={styles.fullScreenImage} resizeMode="contain" />}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default UploadAttachment;