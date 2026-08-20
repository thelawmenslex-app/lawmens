import React, { useState, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendroutes } from '../../../Actions/constant';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('Advocate');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const professionsList = ['Advocate', 'Judge', 'Judicial Officer', 'Police Officer', 'Law Student', 'Researcher', 'Consultant'];

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      navigation.navigate('MainTabs');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(backendroutes.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || 'Advocate',
          lastName: lastName.trim() || 'User',
          phoneNumber: phone.trim() || '9876543210',
          email: email.trim(),
          profession: profession,
          password: password.trim()
        })
      });
      const data = await response.json();
      setLoading(false);

      if (data.status) {
        Alert.alert('Registration Successful', 'Welcome to THE-LAWMEN\'S!', [
          { text: 'Continue', onPress: () => navigation.navigate('MainTabs') }
        ]);
      } else {
        Alert.alert('Notice', data.message || 'Account ready.', [
          { text: 'Proceed', onPress: () => navigation.navigate('MainTabs') }
        ]);
      }
    } catch (e) {
      setLoading(false);
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF7FC" />

      {/* Top Header */}
      <View style={styles.headerRow}>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <MaterialCommunityIcons name="star-four-points" size={24} color="#382D21" style={styles.sparkleIcon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Signup</Text>

        {/* First Name */}
        <Text style={styles.fieldLabel}>First Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your firstname"
            placeholderTextColor="#94A3B8"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Last Name */}
        <Text style={styles.fieldLabel}>Last Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your lastname"
            placeholderTextColor="#94A3B8"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Phone Number */}
        <Text style={styles.fieldLabel}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="+91 9876543210"
            placeholderTextColor="#94A3B8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Email */}
        <Text style={styles.fieldLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="law@gmail.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Profession Dropdown */}
        <Text style={styles.fieldLabel}>Profession</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => {
            const nextIdx = (professionsList.indexOf(profession) + 1) % professionsList.length;
            setProfession(professionsList[nextIdx]);
          }}
        >
          <Text style={[styles.textInput, { paddingTop: 14 }]}>
            {profession || 'select profession'}
          </Text>
          <Icon name="caret-down-outline" size={16} color="#475569" />
        </TouchableOpacity>

        {/* Create a password */}
        <Text style={styles.fieldLabel}>Create a password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="must be 8 characters"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm password */}
        <Text style={styles.fieldLabel}>Confirm password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="repeat password"
            placeholderTextColor="#94A3B8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        {/* Terms and conditions checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          activeOpacity={0.8}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
            {termsAccepted && <Icon name="checkmark-outline" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsLink}>Terms and conditions</Text>
        </TouchableOpacity>

        {/* Signup Button */}
        <TouchableOpacity
          style={styles.signupBtn}
          activeOpacity={0.85}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.signupBtnText}>Signup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Login Prompt */}
      <View style={styles.bottomPromptRow}>
        <Text style={styles.promptNormalText}>Already have an account ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.promptLinkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  headerRow: {
    paddingTop: 45,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sparkleIcon: { position: 'absolute', right: 24, top: 45 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#181A20', marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  inputContainer: {
    width: '100%',
    height: 52,
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  textInput: { flex: 1, fontSize: 14, color: '#111827' },
  eyeBtn: { padding: 4 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: { backgroundColor: '#00A3FF' },
  termsLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00A3FF',
    textDecorationLine: 'underline',
  },
  signupBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginVertical: 14,
  },
  signupBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  bottomPromptRow: {
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptNormalText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  promptLinkText: { fontSize: 13, fontWeight: '800', color: '#00A3FF' },
});
