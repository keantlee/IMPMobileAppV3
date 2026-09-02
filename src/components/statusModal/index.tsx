import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { renderAlertPng } from '../../assets/icons';

export type StatusModalType = 'success' | 'error' | 'info' | 'warning';

export interface StatusModalConfig {
  visible: boolean;
  title: string;
  message: string;
  type: StatusModalType;
}

interface StatusModalProps {
  config: StatusModalConfig;
  // Label for the action button. Defaults to CONTINUE (success) / TRY AGAIN (error).
  confirmText?: string;
  onConfirm: () => void;
  onRequestClose?: () => void;
  // Confirmation mode: when true a Cancel button is shown alongside Confirm.
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  // Renders the confirm button in a destructive (red) style.
  destructive?: boolean;
}

/**
 * Shared status alert modal — the same custom feedback modal used on the Login,
 * Transaction (Review Cart) and Upload Attachments screens. Centralized here so
 * the Office Info Edit/Add forms share one consistent design.
 */
const StatusModal: React.FC<StatusModalProps> = ({
  config,
  confirmText,
  onConfirm,
  onRequestClose,
  showCancel = false,
  cancelText = 'CANCEL',
  onCancel,
  destructive = false,
}) => {
  const isSuccess = config.type === 'success';

  const buttonLabel =
    confirmText || (isSuccess ? 'CONTINUE' : 'TRY AGAIN');

  const confirmColor = destructive
    ? '#C62828'
    : isSuccess
    ? '#009246'
    : '#2C3E50';

  return (
    <Modal
      visible={config.visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose || onCancel || onConfirm}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            width: '100%',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
            elevation: 10,
          }}>
          <View style={{ marginBottom: 16 }}>{renderAlertPng(config.type)}</View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#2C3E50',
              marginTop: 12,
              marginBottom: 8,
              textAlign: 'center',
            }}>
            {config.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#7F8C8D',
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 20,
            }}>
            {config.message}
          </Text>
          {showCancel ? (
            <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#F1F3F5',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={onCancel}>
                <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 15 }}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: confirmColor,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={onConfirm}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: confirmColor,
                paddingVertical: 12,
                width: '100%',
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onConfirm}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                {buttonLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;
