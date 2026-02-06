import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import promptTemplates from '../data/promptTemplates';
import { useStoryContext } from '../context/StoryContext';
import { createStory } from '../services/storyService';

// ── Preload image assets to prevent loading delay ──
const UPLOAD_ICON = require('../../assets/images/imageicon.png');

// ── 4-pointed sparkle star (two thin crossed bars) ──
function Sparkle({ style, size = 7, color = '#C4B5FD' }) {
  const arm = Math.max(1.5, size * 0.2);
  return (
    <View style={[styles.sparkleBase, { width: size, height: size }, style]}>
      <View style={{
        position: 'absolute',
        left: (size - arm) / 2,
        top: 0,
        width: arm,
        height: size,
        borderRadius: arm / 2,
        backgroundColor: color,
      }} />
      <View style={{
        position: 'absolute',
        left: 0,
        top: (size - arm) / 2,
        width: size,
        height: arm,
        borderRadius: arm / 2,
        backgroundColor: color,
      }} />
    </View>
  );
}

export default function CreateScreen({ navigation }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const { addStory } = useStoryContext();

  // ── Modal animation refs ──
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const modalInputRef = useRef(null);

  const openPromptModal = () => {
    // Reset animation values to starting position
    overlayOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardScale.setValue(0.96);

    // Open modal first
    setIsPromptModalOpen(true);

    // Start animations after modal has a chance to render
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
      ]).start();

      // Focus after animations start
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 100);
    });
  };

  const closePromptModal = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
    ]).start(() => {
      setIsPromptModalOpen(false);
    });
  };

  // Reset animation values when modal closes
  useEffect(() => {
    if (!isPromptModalOpen) {
      overlayOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.96);
    }
  }, [isPromptModalOpen]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Please allow photo library access to continue.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const rollPrompt = () => {
    let next = prompt;
    while (next === prompt && promptTemplates.length > 1) {
      next = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
    }
    setPrompt(next);
  };

  const removePhoto = () => {
    setPhotoUri(null);
  };

  const handleCreate = async () => {
    if (!photoUri || !prompt.trim()) return;
    setIsLoading(true);
    try {
      const story = await createStory(photoUri, prompt);
      await addStory(story);
      setPhotoUri(null);
      setPrompt('');
      navigation.navigate('StoryDetail', { storyId: story.id });
    } catch (e) {
      console.error(e);
      alert('Failed to create story. Please try again.');
    }
    setIsLoading(false);
  };

  // ── Loading ──────────────────────────────────────────
  if (isLoading) {
    return (
      <LinearGradient colors={colors.mainBg} style={styles.container}>
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Sparkle style={{ top: 110, right: 52 }} size={8}  color="rgba(196,181,253,0.2)" />
          <Sparkle style={{ top: 360, left: 38 }} size={6}  color="rgba(251,191,36,0.18)" />
          <Sparkle style={{ bottom: 220, right: 68 }} size={5} color="rgba(255,255,255,0.13)" />
        </View>

        <View style={styles.loadingWrapper}>
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.loadingTitle}>Creating Magic…</Text>
          <Text style={styles.loadingSubtext}>Weaving a story just for you</Text>
        </View>
      </LinearGradient>
    );
  }

  // ── Main screen ──────────────────────────────────────
  return (
    <LinearGradient colors={colors.mainBg} style={styles.container}>
      {/* Background sparkles */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {!photoUri ? (
          <>
            <Sparkle style={{ top: 78,  right: 44 }}  size={11} color="rgba(255,255,255,0.16)" />
            <Sparkle style={{ top: 170, left: 30 }}   size={6}  color="rgba(196,181,253,0.32)" />
            <Sparkle style={{ top: 310, right: 88 }}  size={8}  color="rgba(251,191,36,0.28)" />
            <Sparkle style={{ top: 490, left: 52 }}   size={5}  color="rgba(255,255,255,0.14)" />
            <Sparkle style={{ bottom: 230, right: 32 }} size={7} color="rgba(196,181,253,0.24)" />
            <Sparkle style={{ bottom: 155, left: 68 }} size={4} color="rgba(251,191,36,0.22)" />
          </>
        ) : (
          <>
            <Sparkle style={{ top: 78,  right: 44 }}  size={9}  color="rgba(255,255,255,0.14)" />
            <Sparkle style={{ top: 220, left: 26 }}   size={5}  color="rgba(196,181,253,0.28)" />
            <Sparkle style={{ bottom: 140, right: 42 }} size={6} color="rgba(251,191,36,0.22)" />
            <Sparkle style={{ bottom: 260, left: 55 }} size={4} color="rgba(255,255,255,0.12)" />
          </>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Create a Story</Text>
      </View>

      {!photoUri ? (
        /* ── No photo: upload card + prompt display ── */
        <View style={styles.centerWrapper}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.uploadCardOuter}>
            <LinearGradient
              colors={['rgba(139,92,246,0.28)', 'rgba(167,139,250,0.22)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadCard}
            >
              <Sparkle style={{ top: 20,  right: 26 }}  size={9} color="rgba(196,181,253,0.5)" />
              <Sparkle style={{ top: 68,  left: 22 }}   size={5} color="rgba(255,255,255,0.3)" />
              <Sparkle style={{ bottom: 40, left: 44 }} size={7} color="rgba(196,181,253,0.4)" />
              <Sparkle style={{ bottom: 20, right: 60 }} size={4} color="rgba(251,191,36,0.4)" />

              <Image
                source={UPLOAD_ICON}
                style={styles.uploadIcon}
              />

              <Text style={styles.uploadTitle}>Add your child's photo</Text>
              <Text style={styles.uploadSubtext}>Photos are deleted after creating the story. Make your child the main character!</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Prompt display — tap opens modal */}
          <LinearGradient
            colors={['rgba(167,139,250,0.15)', 'rgba(139,92,246,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.inputCard, { marginTop: 28 }]}
          >
            <TouchableOpacity style={styles.inputTouchArea} onPress={openPromptModal} activeOpacity={0.7}>
              <Text style={[styles.inputText, !prompt && styles.inputPlaceholder]} numberOfLines={2}>
                {prompt || 'What kind of story?'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.diceBtn} onPress={rollPrompt} activeOpacity={0.7}>
              <Text style={styles.diceEmoji}>🎲</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        /* ── Photo selected ── */
        <>
          <View style={styles.contentArea}>
            <TouchableOpacity style={styles.photoTouchable} onPress={pickImage} activeOpacity={0.9}>
              <View style={styles.photoGlow}>
                <View style={styles.photoFrame}>
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                  <TouchableOpacity style={styles.deleteBadge} onPress={removePhoto} activeOpacity={0.7}>
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBadge} onPress={pickImage} activeOpacity={0.7}>
                    <Ionicons name="create" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {/* Prompt display — tap opens modal */}
            <LinearGradient
              colors={['rgba(167,139,250,0.15)', 'rgba(139,92,246,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.inputCard}
            >
              <TouchableOpacity style={styles.inputTouchArea} onPress={openPromptModal} activeOpacity={0.7}>
                <Text style={[styles.inputText, !prompt && styles.inputPlaceholder]} numberOfLines={2}>
                  {prompt || 'What kind of story?'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.diceBtn} onPress={rollPrompt} activeOpacity={0.7}>
                <Text style={styles.diceEmoji}>🎲</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Create button pinned bottom */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.createBtn, !prompt.trim() && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!prompt.trim()}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={prompt.trim() ? ['#FBBF24', '#F59E0B'] : ['#3A3550', '#4A4560']}
                style={styles.createBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.createBtnText}>Create Story ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Prompt Modal ── */}
      <Modal
        visible={isPromptModalOpen}
        transparent
        animationType="none"
        onRequestClose={closePromptModal}
      >
        {/* Outer touchable = backdrop dismiss */}
        <TouchableOpacity
          style={styles.modalFill}
          onPress={closePromptModal}
          activeOpacity={1}
        >
          {/* Dark backdrop */}
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.modalBackdrop, { opacity: overlayOpacity }]} />

          {/* Cancel / Done bar */}
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={closePromptModal} style={styles.modalNavBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closePromptModal} style={styles.modalNavBtn}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Keyboard-aware positioned card */}
          <KeyboardAvoidingView
            style={styles.modalKAV}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? -40 : 0}
          >
            {/* Inner touchable stops backdrop dismiss when card is tapped */}
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalCardWrapper}>
              <Animated.View style={[styles.modalCard, {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }],
              }]}>
                <LinearGradient
                  colors={['#3B2667', '#2D1B69']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalCardGradient}
                >
                  <TextInput
                    ref={modalInputRef}
                    style={styles.modalInput}
                    placeholder="What kind of story?"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                    maxLength={200}
                    scrollEnabled
                  />
                  <TouchableOpacity style={styles.modalDiceBtn} onPress={rollPrompt} activeOpacity={0.7}>
                    <LinearGradient
                      colors={['#A78BFA', '#8B5CF6']}
                      style={styles.modalDiceBtnInner}
                    >
                      <Text style={styles.diceEmoji}>🎲</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── sparkle base ──────────────────────────────────
  sparkleBase: {
    position: 'absolute',
  },

  // ── Title ─────────────────────────────────────────
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 68,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 36,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },

  // ── No-photo: upload card ─────────────────────────
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  uploadCardOuter: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
  },
  uploadCard: {
    borderRadius: 52,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.4)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 10,
  },
  uploadIcon: {
    width: 100,
    height: 100,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  uploadTitle: {
    fontSize: 24,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  uploadSubtext: {
    fontSize: 16,
    fontFamily: 'Rounded-Semibold',
    color: 'rgba(255,255,255,0.75)',
  },

  // ── Photo-selected layout ─────────────────────────
  contentArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  photoTouchable: { marginBottom: 28 },
  photoGlow: {
    padding: 5,
    borderRadius: 28,
    backgroundColor: 'rgba(139,92,246,0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  photoFrame: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  photo: { width: 220, height: 275 },
  deleteBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  editBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Prompt input (display / tap-to-open) ──────────
  inputCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 38,
    paddingHorizontal: 20,
    paddingVertical: 26,
    borderWidth: 3,
    borderColor: 'rgba(167,139,250,0.3)',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  inputTouchArea: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 18,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  inputPlaceholder: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'Rounded-Semibold',
  },
  diceBtn: {
    marginLeft: 12,
    width: 45,
    height: 45,
    borderRadius: 26,
    backgroundColor: 'rgba(167,139,250,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  diceEmoji: { fontSize: 26 },

  // ── Create button ─────────────────────────────────
  bottomBar: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 16,
  },
  createBtn: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  createBtnDisabled: {
    shadowOpacity: 0.15,
  },
  createBtnInner: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: 22,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Prompt Modal ──────────────────────────────────
  modalFill: {
    flex: 1,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 12,
    zIndex: 1,
  },
  modalNavBtn: {
    padding: 8,
  },
  modalCancelText: {
    fontSize: 17,
    fontFamily: 'Rounded-Semibold',
    color: 'rgba(255,255,255,0.7)',
  },
  modalDoneText: {
    fontSize: 17,
    fontFamily: 'Rounded-Black',
    color: '#A78BFA',
  },
  modalKAV: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 28,
  },
  modalCardWrapper: {
    width: '100%',
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.5)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 14,
  },
  modalCardGradient: {
    padding: 32,
    paddingBottom: 96,
  },
  modalInput: {
    fontSize: 24,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
    lineHeight: 36,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  modalDiceBtn: {
    position: 'absolute',
    bottom: 24,
    right: 26,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  modalDiceBtnInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Loading ───────────────────────────────────────
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBubble: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(30,17,69,0.75)',
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  loadingTitle: {
    fontSize: 26,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
  },
  loadingSubtext: {
    fontSize: 15,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});
