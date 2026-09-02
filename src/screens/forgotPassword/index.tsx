import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  forgotPasswordMutation,
  resetPasswordMutation,
} from '../../api/auth';
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
  resetPasswordSchema,
  ResetPasswordFormData,
} from '../../types/schemas/forgotPasswordSchema';
import StatusModal, { StatusModalConfig } from '../../components/statusModal';
import { styles } from './styles';

interface ForgotPasswordProps {
  navigation: any;
}

const ForgotPassword = ({ navigation }: ForgotPasswordProps) => {
  const requestMutation = forgotPasswordMutation();
  const resetMutation = resetPasswordMutation();

  // 'email' = request code step, 'reset' = enter code + set new password step.
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [statusModal, setStatusModal] = useState<StatusModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });
  // When true, dismissing a success modal returns to Login (used after reset).
  const [goBackOnClose, setGoBackOnClose] = useState(false);

  // ---- Step 1 form ----
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // ---- Step 2 form ----
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', new_password: '', confirm_password: '' },
  });

  const showError = (title: string, message: string) =>
    setStatusModal({ visible: true, title, message, type: 'error' });

  // Step 1: send the reset code.
  const onRequestCode = (data: ForgotPasswordFormData) => {
    requestMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setVerifiedEmail(data.email);
          setStep('reset');
        },
        onError: (error: Error) => showError('Request Failed', error.message),
      },
    );
  };

  // Resend the code while on step 2.
  const onResend = () => {
    if (!verifiedEmail) return;
    requestMutation.mutate(
      { email: verifiedEmail },
      {
        onSuccess: () =>
          setStatusModal({
            visible: true,
            title: 'Code Resent',
            message: 'A new 6-digit code has been sent to your email.',
            type: 'success',
          }),
        onError: (error: Error) => showError('Resend Failed', error.message),
      },
    );
  };

  // Step 2: verify code + set new password in one call.
  const onResetPassword = (data: ResetPasswordFormData) => {
    resetMutation.mutate(
      {
        email: verifiedEmail,
        otp: data.otp,
        new_password: data.new_password,
      },
      {
        onSuccess: serverData => {
          setGoBackOnClose(true);
          setStatusModal({
            visible: true,
            title: 'Password Reset',
            message:
              serverData.message ||
              'Your password has been reset successfully. You can now log in with your new password.',
            type: 'success',
          });
        },
        onError: (error: Error) => showError('Reset Failed', error.message),
      },
    );
  };

  const handleModalConfirm = () => {
    setStatusModal(prev => ({ ...prev, visible: false }));
    if (goBackOnClose) {
      setGoBackOnClose(false);
      navigation.goBack();
    }
  };

  const requesting = requestMutation.isPending;
  const resetting = resetMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#009246" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Brand banner */}
        <View style={styles.headerBanner}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (step === 'reset' ? setStep('email') : navigation.goBack())}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <MaterialIcons
              name={step === 'email' ? 'lock-reset' : 'mark-email-read'}
              size={70}
              color="#009246"
            />
          </View>
          <Text style={styles.bannerTitle}>Forgot Password</Text>
          <Text style={styles.bannerSubtitle}>
            {step === 'email' ? "We'll help you get back in" : 'Enter code & new password'}
          </Text>
        </View>

        {/* Step 1 — Request code */}
        {step === 'email' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reset your password</Text>
            <Text style={styles.cardSubtitle}>
              Enter the email associated with your account and we'll send you a 6-digit code to reset
              your password.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <Controller
                control={emailForm.control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputField,
                      emailForm.formState.errors.email ? styles.inputError : null,
                    ]}>
                    <MaterialIcons name="email" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="#B0B0B0"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}
              />
              {emailForm.formState.errors.email && (
                <Text style={styles.errorText}>{emailForm.formState.errors.email.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, requesting && styles.btnDisabled]}
              onPress={emailForm.handleSubmit(onRequestCode)}
              disabled={requesting}
              activeOpacity={0.85}>
              {requesting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>SEND RESET CODE</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={16} color="#009246" />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Enter code + set new password */}
        {step === 'reset' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter code & new password</Text>
            <Text style={styles.cardSubtitle}>
              We sent a 6-digit code to <Text style={styles.emailHighlight}>{verifiedEmail}</Text>.
              Enter it below and choose a new password.
            </Text>

            {/* OTP */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <Controller
                control={resetForm.control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputField,
                      resetForm.formState.errors.otp ? styles.inputError : null,
                    ]}>
                    <MaterialIcons name="pin" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="6-digit code"
                      placeholderTextColor="#B0B0B0"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                )}
              />
              {resetForm.formState.errors.otp && (
                <Text style={styles.errorText}>{resetForm.formState.errors.otp.message}</Text>
              )}
            </View>

            {/* New password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>New Password</Text>
              <Controller
                control={resetForm.control}
                name="new_password"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputField,
                      resetForm.formState.errors.new_password ? styles.inputError : null,
                    ]}>
                    <MaterialIcons name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#B0B0B0"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(p => !p)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialIcons
                        name={showPassword ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {resetForm.formState.errors.new_password && (
                <Text style={styles.errorText}>
                  {resetForm.formState.errors.new_password.message}
                </Text>
              )}
            </View>

            {/* Confirm password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Re-enter Password</Text>
              <Controller
                control={resetForm.control}
                name="confirm_password"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputField,
                      resetForm.formState.errors.confirm_password ? styles.inputError : null,
                    ]}>
                    <MaterialIcons name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#B0B0B0"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm(p => !p)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialIcons
                        name={showConfirm ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {resetForm.formState.errors.confirm_password && (
                <Text style={styles.errorText}>
                  {resetForm.formState.errors.confirm_password.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, resetting && styles.btnDisabled]}
              onPress={resetForm.handleSubmit(onResetPassword)}
              disabled={resetting}
              activeOpacity={0.85}>
              {resetting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>RESET PASSWORD</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={onResend}
              disabled={requesting}
              activeOpacity={0.7}>
              {requesting ? (
                <ActivityIndicator color="#009246" size="small" />
              ) : (
                <>
                  <MaterialIcons name="refresh" size={16} color="#009246" />
                  <Text style={styles.backToLoginText}>Resend Code</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <StatusModal
        config={statusModal}
        confirmText={statusModal.type === 'success' ? 'DONE' : 'TRY AGAIN'}
        onConfirm={handleModalConfirm}
      />
    </SafeAreaView>
  );
};

export default ForgotPassword;
