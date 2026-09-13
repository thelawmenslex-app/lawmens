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
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendroutes } from '../../../Actions/constant';
import { SubscriptionService } from '../../../Services/subscriptionService';

try {
  GoogleSignin.configure({
    webClientId: '988610679047-ki032ocej8oa2j30t2btj2avlp1h13rh.apps.googleusercontent.com',
    offlineAccess: false,
    forceCodeForRefreshToken: true,
  });
} catch (e) {
  console.log('GoogleSignin.configure error in signup:', e);
}

export default function SignupScreen({ navigation, route }) {
  const prefilled = route?.params || {};
  const [firstName, setFirstName] = useState(prefilled.prefilledFirstName || '');
  const [lastName, setLastName] = useState(prefilled.prefilledLastName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(prefilled.prefilledEmail || '');
  const [profession, setProfession] = useState('Advocate');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const professionsList = ['Advocate', 'Judge', 'Judicial Officer', 'Police Officer', 'Legal Fraternity', 'Researcher', 'Consultant'];

  const getPasswordStrength = (pass) => {
    if (!pass) {
      return {
        score: 0,
        checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
        label: 'Empty',
        color: '#94A3B8',
        widthPercent: '0%',
        isStrong: false
      };
    }

    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
    };

    let score = 0;
    if (checks.length) score += 1;
    if (checks.uppercase && checks.lowercase) score += 1;
    if (checks.number) score += 1;
    if (checks.special) score += 1;

    let label = 'Weak';
    let color = '#EF4444';
    let widthPercent = '25%';

    if (score === 1) {
      label = 'Weak (Needs uppercase, number & symbol)';
      color = '#EF4444';
      widthPercent = '25%';
    } else if (score === 2) {
      label = 'Fair (Add numbers or special symbols)';
      color = '#F59E0B';
      widthPercent = '50%';
    } else if (score === 3) {
      label = 'Good (Almost strong)';
      color = '#25AAE2';
      widthPercent = '75%';
    } else if (score === 4) {
      label = 'Strong Password ✓';
      color = '#10B981';
      widthPercent = '100%';
    }

    const isStrong = checks.length && checks.uppercase && checks.lowercase && checks.number && checks.special;
    return { score, checks, label, color, widthPercent, isStrong };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      
      const gUser = signInResult.data?.user || signInResult.user || {};
      const idToken = signInResult.data?.idToken || signInResult.idToken || '';
      const gEmail = gUser.email;

      if (!gEmail) {
        setLoading(false);
        Alert.alert('Google Sign-In', 'Could not retrieve email from selected Google account.');
        return;
      }

      const fName = gUser.givenName || (gUser.name ? gUser.name.split(' ')[0] : 'User');
      const lName = gUser.familyName || (gUser.name ? gUser.name.split(' ').slice(1).join(' ') : '');

      const response = await fetch(backendroutes.google, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: gEmail.trim().toLowerCase(),
          firstName: fName,
          lastName: lName,
          idToken: idToken
        })
      });

      const data = await response.json();
      setLoading(false);

      if (data.status && data.data && data.data.token) {
        const raw = data.data;
        const fullName = `${raw.firstName || fName} ${raw.lastName || lName}`.trim();
        const userObj = {
          _id: raw._id || '',
          firstName: raw.firstName || fName,
          lastName: raw.lastName || lName,
          name: fullName,
          email: raw.email || gEmail,
          phone: raw.phoneNumber || '',
          phoneNumber: raw.phoneNumber || '',
          profession: raw.profession || 'Advocate',
          role: raw.role || 'User',
          isPremium: Boolean(raw.isPremium),
          readingHistoryCount: 199,
          bookmarksCount: 0
        };

        await AsyncStorage.setItem('@authtoken', raw.token);
        if (userObj.isPremium) {
          await AsyncStorage.setItem('@is_subscribed', 'true');
        }
        await AsyncStorage.setItem('@userprofile', JSON.stringify(userObj));

        try {
          const subCheck = await SubscriptionService.getStatus();
          if (subCheck && subCheck.hasAccess === false) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TrialExpired' }],
            });
            return;
          }
        } catch (e) {}

        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert(
          'Google Registration Notice',
          data.message || 'Unable to register with Google. Please use standard registration.'
        );
      }
    } catch (error) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services is not available or needs updating.');
      } else {
        Alert.alert('Google Sign-In', error.message || 'Google Sign-In failed. Please try again.');
      }
    }
  };

  const handleSignup = async () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your First Name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit Phone Number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid Email Address');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a Password');
      return;
    }
    if (!passwordStrength.isStrong) {
      Alert.alert(
        'Strong Password Required',
        'For legal account security, your password must be Strong:\\n• At least 8 characters\\n• 1 Uppercase letter (A-Z)\\n• 1 Lowercase letter (a-z)\\n• 1 Number (0-9)\\n• 1 Special symbol (@#$%...)'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Terms & Conditions', 'Please accept the terms and conditions to continue');
      return;
    }

    setLoading(true);
    const userPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phone.trim(),
      email: email.trim(),
      profession: profession,
      password: password.trim()
    };

    try {
      // 1. Dispatch OTP to Email and WhatsApp Mobile Number
      const response = await fetch(backendroutes.otp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phoneNumber: phone.trim(),
          type: 'send'
        })
      });

      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (data && data.status === false) {
        const msg = data.message || 'Error occurred';
        if (msg.includes('already registered') || msg.includes('already exists')) {
          Alert.alert(
            'Already Registered',
            `${msg} Please log in to your account.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
            ]
          );
          return;
        }
      }

      // 2. Navigate to OTP screen
      navigation.navigate('Otp', {
        email: email.trim(),
        phone: phone.trim(),
        userPayload: userPayload,
        flow: 'signup'
      });
    } catch (e) {
      setLoading(false);
      navigation.navigate('Otp', {
        email: email.trim(),
        phone: phone.trim(),
        userPayload: userPayload,
        flow: 'signup'
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF7FC" />

      {/* Top Header */}
      <View style={styles.headerRow}>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <MaterialCommunityIcons name="scale-balance" size={26} color="#25AAE2" style={styles.sparkleIcon} />
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
        <Text style={styles.fieldLabel}>Phone Number (for WhatsApp OTP)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#94A3B8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Email */}
        <Text style={styles.fieldLabel}>Email Address (for Email OTP)</Text>
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
            placeholder="At least 8 chars (letters, numbers, symbols)"
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

        {/* PASSWORD STRENGTH PROGRESS BAR */}
        {password.length > 0 && (
          <View style={styles.strengthWrapper}>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthTitle}>Password Strength:</Text>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>

            {/* Continuous / Segmented Progress Bar */}
            <View style={styles.strengthBarBackground}>
              <View
                style={[
                  styles.strengthBarFill,
                  { width: passwordStrength.widthPercent, backgroundColor: passwordStrength.color }
                ]}
              />
            </View>

            {/* Requirement Checklist */}
            <View style={styles.rulesContainer}>
              <View style={styles.ruleItem}>
                <Icon
                  name={passwordStrength.checks.length ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={passwordStrength.checks.length ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.ruleText, passwordStrength.checks.length && styles.ruleTextValid]}>
                  8+ characters
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Icon
                  name={passwordStrength.checks.uppercase ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={passwordStrength.checks.uppercase ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.ruleText, passwordStrength.checks.uppercase && styles.ruleTextValid]}>
                  Uppercase (A-Z)
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Icon
                  name={passwordStrength.checks.number ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={passwordStrength.checks.number ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.ruleText, passwordStrength.checks.number && styles.ruleTextValid]}>
                  Number (0-9)
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Icon
                  name={passwordStrength.checks.special ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={passwordStrength.checks.special ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.ruleText, passwordStrength.checks.special && styles.ruleTextValid]}>
                  Special symbol (@#$...)
                </Text>
              </View>
            </View>
          </View>
        )}

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
        <View style={styles.termsRow}>
          <TouchableOpacity
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.8}
            style={{ paddingRight: 8, paddingVertical: 4 }}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
              {termsAccepted && <Icon name="checkmark-outline" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('TermsAndConditions')}
            activeOpacity={0.7}
            style={{ paddingVertical: 4 }}
          >
            <Text style={styles.termsLink}>Terms and conditions</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.signupBtnText}>Send Verification OTP →</Text>
          )}
        </TouchableOpacity>

        {/* Or Register With Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or Register With</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue with Google Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          activeOpacity={0.85}
          onPress={handleGoogleSignup}
          disabled={loading}
        >
          <FontAwesome name="google" size={18} color="#EA4335" />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
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
    color: '#25AAE2',
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
  strengthWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  strengthTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  strengthBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
    marginBottom: 4,
  },
  ruleText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  ruleTextValid: {
    color: '#10B981',
    fontWeight: '700',
  },
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
    borderColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: { backgroundColor: '#25AAE2' },
  termsLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#25AAE2',
    textDecorationLine: 'underline',
  },
  signupBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#25AAE2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginVertical: 14,
  },
  signupBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D8ECF7' },
  dividerText: { paddingHorizontal: 12, fontSize: 13, color: '#64748B', fontWeight: '600' },
  googleBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  bottomPromptRow: {
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptNormalText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  promptLinkText: { fontSize: 13, fontWeight: '800', color: '#25AAE2' },
});
