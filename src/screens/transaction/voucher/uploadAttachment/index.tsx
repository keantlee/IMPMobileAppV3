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
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary, Asset, PhotoQuality } from 'react-native-image-picker';

import { AttachmentSchema, AttachmentFormData, AttachmentInputData } from '../../../../types/schemas/AttachmentSchema';
import ScreenNames from '../../../../navigation/screenNames';
import { styles } from './styles';
import { UploadAttachments } from '../../../../@types/attachment';
import { converImageToBase64 } from '../../../../utils/convert_base64/imageBase64';
import { saveAttachmentMutation } from '../../../../api/transaction';

import { getTransactionHistoryMutation, getTransactionDetailsMutation } from '../../../../api/transaction';

interface TransactionRouteParams {
  // uploadAttachments: UploadAttachments;
  voucherId:        string;
  rsbsaNo:          string;
  referenceNo:      string;
  transactionId:    string;
  supplierId:       string;
  shortname:        string;
  prevRouteName:    'TransactionDetailScreen' | 'TransactionHistoryScreen' | 'UploadConfirmationScreen' | string;
}

interface FormFieldType {
    key: keyof Omit<AttachmentFormData, 'otherDocs'>;
    label: string;
}

const attachmetFormData: FormFieldType[] = [
    { key: 'beneficiary', label: 'Beneficiary with Commodity' },
    { key: 'frontID',     label: 'Front Valid ID' },
    { key: 'backID',      label: 'Back Valid ID' },
    { key: 'receipt',     label: 'Receipt' },
];

const UploadAttachment = () => {
    const navigation = useNavigation<any>();
    const route      = useRoute<any>();

    console.log("[UPLOAD ATTACHMENT SCREEN] Incoming route: ", route);

    const routeParams           = (route.params || {}) as TransactionRouteParams;
    const { 
        voucherId, 
        rsbsaNo, 
        referenceNo, 
        transactionId, 
        supplierId, 
        shortname, 
        prevRouteName 
    } = (route.params || {}) as TransactionRouteParams;

    console.log("[UPLOAD ATTACHMENT SCREEN] route params: ", routeParams);
    // console.log("[UPLOAD ATTACHMENT SCREEN] uploadAttachments: ", uploadAttachments);

    const attachmentMutation = saveAttachmentMutation(navigation);

    const transactionMutation   = getTransactionHistoryMutation(); 
    const detailsMutation       = getTransactionDetailsMutation();

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success'
    });

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AttachmentInputData>({ 
        resolver: zodResolver(AttachmentSchema),
        defaultValues: {
            beneficiary:    null,
            frontID:        null,
            backID:         null,
            receipt:        null,
            otherDocs:      [],
        }
    });

    const currentFormValues = watch();

    const [activeSelector, setActiveSelector] = useState<{ fieldName: keyof AttachmentFormData; mode: 'fixed' | 'array' } | null>(null);
    const [lightboxUri, setLightboxUri] = useState<string | null>(null);

    const triggerImagePicker = async (source: 'camera' | 'gallery') => {
        if (!activeSelector) return;

        const options = {
            mediaType: 'photo' as const,
            quality: 0.75 as PhotoQuality,
            maxWidth: 1200,
            maxHeight: 1200,
            selectionLimit: 1,
            includeBase64: false,
        };

        const result = source === 'camera' 
            ? await launchCamera(options) 
            : await launchImageLibrary(options);

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

    useEffect(() => {
        if (attachmentMutation.isError) {
            setAlertConfig({
                visible: true,
                title: 'Failed to Upload',
                message: attachmentMutation.error?.message || 'An unexpected error occurred during uploading processing. Please try again.', 
                type: 'error'
            });
        }
    }, [attachmentMutation.isError, attachmentMutation.error]);

    useEffect(() => {
        if (attachmentMutation.isSuccess && attachmentMutation.data) {
            setAlertConfig({
                visible: true,
                title: 'Success!',
                message: attachmentMutation.data.message || 'Verification materials saved successfully.',
                type: 'success'
            });
        }
    }, [attachmentMutation.isSuccess, attachmentMutation.data]);

    // Handle dismissing custom modal completely and clearing stale mutation variables
    const handleCloseAlertModal = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        
        if (alertConfig.type === 'success') {
            reset();
            attachmentMutation.reset();
            navigation.navigate(ScreenNames.BOTTOM_TABS.HOME);
        } else {
            attachmentMutation.reset(); // Allows user to retry submitting cleanly
        }
    };

    const onSubmit = async (data: AttachmentFormData) => {
        let isMounted = true; 

        try {
            const beneficiaryPayload    = await converImageToBase64(data.beneficiary);
            const frontIDPayload        = await converImageToBase64(data.frontID);
            const backIDPayload         = await converImageToBase64(data.backID);
            const receiptPayload        = await converImageToBase64(data.receipt);
            const otherDocsPayload      = await Promise.all(
                data.otherDocs.map(file => converImageToBase64(file))
            );

            if (!isMounted) return; // Break routine execution if component unmounted midway

            const attachmentParams = {
                beneficiary: {
                    ...beneficiaryPayload, 
                    name: 'Beneficiary with Commodity' 
                },
                frontID: {
                    ...frontIDPayload,
                    name: 'Front Valid ID'
                },
                backID: {
                    ...backIDPayload,
                    name: 'Back Valid ID'
                },
                receipt: {
                    ...receiptPayload,
                    name: 'Receipt'
                },
                otherDocs: {
                    ...otherDocsPayload,
                    name: 'Other documents'
                },
                rsbsa_no:       rsbsaNo,
                reference_no:   referenceNo,
                supplier_id:    supplierId,
                transaction_id: transactionId,
                voucher_id:     voucherId,
                shortname:      shortname,
                prevRouteName:  prevRouteName
            };

            attachmentMutation.mutate({ attachmentParams });
        } catch (error) {
            if (isMounted) {
                Alert.alert("Upload Failed", "An error occurred while compiling your images.");
            }
        }

        return () => { isMounted = false; };
    };

    const handleSyncAndGoBack = useCallback(() => {
        reset();
        attachmentMutation.reset();

        console.log("[UPLOAD ATTACHMENT - GO BACK] routing back with target reference name string: ", prevRouteName);

        // Condition routing
        if (prevRouteName === 'TransactionDetailScreen') {
            const params = {
                transactionId:  transactionId,
                referenceNo:    referenceNo,
                supplierId:     supplierId,
                status:         'Pending'
            };

            console.log('[UPLOAD ATTACHMENT] Go Back to Transacion Details Screen: ', params);
            
            detailsMutation.mutate({
                transaction_id:  transactionId,
                reference_no:    referenceNo,
                supplier_id:     supplierId,
                status:          'Pending',
                navigation:      navigation
            });
        } else if (prevRouteName === 'TransactionHistoryScreen') {
            const params = {
                supplierId:supplierId,
            };

            console.log('[UPLOAD ATTACHMENT] Go Back to Transacion History Screen: ', params);

            navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_HISTORY, {
                supplierId: supplierId,
            })
        } else if (prevRouteName === 'UploadConfirmationScreen') {
            navigation.navigate(ScreenNames.TRANSACTION_STACK.UPLOAD_CONFIRMATION_SCREEN, {
                transactionId:  transactionId,
                referenceNo:    referenceNo,
                voucherId:      voucherId,
                rsbsaNo:        rsbsaNo,
                shortname:      shortname
            })
        } else {
            navigation.navigate(ScreenNames.BOTTOM_TABS.HOME);
        }
    }, [navigation, reset, prevRouteName, transactionId, referenceNo, supplierId]);

    useEffect(() => {
        const hardwareBackAction = () => {
            handleSyncAndGoBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", hardwareBackAction);
        return () => backHandler.remove();
    }, [handleSyncAndGoBack]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleSyncAndGoBack} activeOpacity={0.7}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Upload Attachments</Text>
            <View style={styles.backPlaceholder} />
        </View>
    );

    const renderRequiredAttachments = ({ item }: { item: FormFieldType }) => {
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
                                {value ? "✓ Ready to submit" : "No selected attachment"}
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
                                disabled={attachmentMutation.isPending}
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
                data={attachmetFormData}
                renderItem={renderRequiredAttachments}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.scrollContainer}
                ListFooterComponent={
                    <View style={{ marginTop: 16 }}>
                        <Text style={styles.sectionTitle}>Other Supporting Documents (Optional)</Text>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollWrapper}>
                            <TouchableOpacity 
                                style={styles.addOtherButtonCard}
                                onPress={() => setActiveSelector({ fieldName: 'otherDocs', mode: 'array' })}
                                disabled={attachmentMutation.isPending}
                            >
                                <MaterialIcons name="note-add" size={24} color="#7F8C8D" />
                                <Text style={styles.addOtherText}>Add Photo</Text>
                            </TouchableOpacity>

                            {(currentFormValues.otherDocs || []).map((file, index: number) => (
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

            <View style={styles.bottomDock}>
                <TouchableOpacity 
                    style={[styles.submitButton, attachmentMutation.isPending && { backgroundColor: '#A2D9B7' }]}
                    onPress={handleSubmit(onSubmit)}
                    activeOpacity={0.8}
                    disabled={attachmentMutation.isPending}
                >
                    {attachmentMutation.isPending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <MaterialIcons name="cloud-upload" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>UPLOAD</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <Modal visible={alertConfig.visible} transparent animationType="fade">
                <View style={styles.lightboxOverlay}>
                    <View style={{ backgroundColor: '#FFF', padding: 24, borderRadius: 12, width: '80%', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: alertConfig.type === 'success' ? '#009246' : '#D9383A' }}>
                            {alertConfig.title}
                        </Text>
                        <Text style={{ textAlign: 'center', marginBottom: 16, color: '#333' }}>{alertConfig.message}</Text>
                        <TouchableOpacity 
                            style={{ backgroundColor: alertConfig.type === 'success' ? '#009246' : '#D9383A', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6 }}
                            onPress={handleCloseAlertModal}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '600' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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