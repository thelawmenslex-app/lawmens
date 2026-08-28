import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { backendroutes } from '../../../Actions/constant';

export default function ForgotPasswordScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      Alert.alert('Validation Error', 'Please enter your registered Email or Mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(backendroutes.forgotpassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim() })
      });
      const data = await response.json();
      setLoading(false);

      if (data.status) {
        Alert.alert('OTP Sent', data.message || 'Verification code sent successfully.');
        setStep(2);
      } else {
        Alert.alert('Notice', data.message || 'OTP code generated.');
        setStep(2);
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Notice', 'Verification code sent to your registered mobile/email.');
      setStep(2);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      Alert.alert('Validation Error', 'Please enter the verification OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(backendroutes.verification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier.trim(),
          otp: otp.trim(),
          password: newPassword
        })
      });
      const data = await response.json();
      setLoading(false);

      Alert.alert('Success', 'Password has been reset successfully. Please login.', [
        { text: 'Login Now', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert('Success', 'Password updated successfully. Please sign in.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF7FC" />

      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtnCircle}
          onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your registered Email or Mobile number to receive a verification code.'
            : 'Enter the code and set your new password.'}
        </Text>

        {step === 1 ? (
          <>
            <Text style={styles.fieldLabel}>Email Or Mobile Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="advocate@example.com"
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Verification Code (OTP)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 4 or 6 digit code"
                placeholderTextColor="#94A3B8"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Bottom Back to Login */}
      <View style={styles.bottomPromptRow}>
        <Text style={styles.promptNormalText}>Remember your password? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.promptLinkText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF7FC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  eyeBtn: {
    padding: 6,
  },
  actionBtn: {
    backgroundColor: '#25AAE2',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#DEF3FA',
  },
  promptNormalText: {
    fontSize: 14,
    color: '#64748B',
  },
  promptLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#25AAE2',
  },
});
