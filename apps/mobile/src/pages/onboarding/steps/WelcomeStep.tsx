/**
 * @fileoverview Welcome carousel — 4 slides shown before the onboarding questionnaire.
 * Covers the "Começar", "Navegar com você", "Entenda e cuide de você" and
 * "Tudo que você precisa" introduction screens.
 *
 * @module pages/onboarding/steps/WelcomeStep
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ViewToken,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { BRAND } from '@/shared/constants/brand-colors.const';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { Button } from '@/shared/ui/Button';

// ─── Slide Data ───────────────────────────────────────────────────────────────

/**
 * Configuration for a single welcome carousel slide.
 */
interface WelcomeSlide {
  /** Unique identifier for list key extraction. */
  id: string;
  /** Background color of the illustration (top) area. */
  topColor: string;
  /** Background color of the content (bottom) panel. */
  bottomColor: string;
  /** Primary heading text. */
  title: string;
  /** Optional supporting description text. */
  description: string | null;
  /**
   * When true, renders the first-slide layout:
   * dark header with "Boas-vindas ao anicca" and a full-width CTA button.
   */
  isHero: boolean;
  /**
   * Accessible label for the illustration placeholder area.
   * Replace this with the real asset once illustrations are ready.
   */
  imagePlaceholderLabel: string;
}

/** @internal */
const SLIDES: WelcomeSlide[] = [
  {
    id:                   'comecar',
    topColor:             BRAND.PRIMARY.DEFAULT,
    bottomColor:          BRAND.BG.LIGHT,
    title:                'Boas-vindas ao\nanicca',
    description:          null,
    isHero:               true,
    imagePlaceholderLabel:'Ani com ícones de funcionalidades',
  },
  {
    id:                   'navegar',
    topColor:             BRAND.BG.LIGHT,
    bottomColor:          BRAND.PRIMARY.DEFAULT,
    title:                'Navegando com você',
    description:          'Ani é seu companheiro digital para organizar o tratamento, explicar laudos e ter suporte contínuo, via WhatsApp, Web e App.',
    isHero:               false,
    imagePlaceholderLabel:'Pessoa com gato Ani no ombro',
  },
  {
    id:                   'entenda',
    topColor:             BRAND.BG.LIGHT,
    bottomColor:          BRAND.AUX.PURPLE,
    title:                'Entenda e cuide de você',
    description:          'Registre seus sintomas e emoções. Acompanhe seu bem-estar e compartilhe informações com sua equipe médica.',
    isHero:               false,
    imagePlaceholderLabel:'Ani segurando uma flor',
  },
  {
    id:                   'tudo',
    topColor:             BRAND.BG.LIGHT,
    bottomColor:          BRAND.AUX.GREEN,
    title:                'Tudo que você precisa,\nem um só lugar',
    description:          'Acesse seus direitos, guarde documentos importantes e receba orientações personalizadas.',
    isHero:               false,
    imagePlaceholderLabel:'Ani com ícones de whatsapp e documentos',
  },
];

// ─── Wave Divider ─────────────────────────────────────────────────────────────

/**
 * Organic wave SVG that transitions between the illustration area and the
 * colored content panel, replicating the design's curved separator.
 */
function WaveDivider({ color, width, direction = 'right' }: { color: string; width: number, direction?: 'right' | 'left' }) {
  const H = 80;
  // If direction is 'right', the wave rises towards the right side.
  // If direction is 'left', the wave rises towards the left side.
  const pathData = direction === 'right'
    ? `M0,${H} L0,40 Q${width * 0.4},80 ${width},0 L${width},${H} Z`
    : `M0,0 Q${width * 0.6},80 ${width},40 L${width},${H} L0,${H} Z`;

  return (
    <Svg
      width={width}
      height={H}
      viewBox={`0 0 ${width} ${H}`}
      preserveAspectRatio="none"
      style={{ marginTop: -1 }}
    >
      <Path d={pathData} fill={color} />
    </Svg>
  );
}

// ─── Dots Indicator ───────────────────────────────────────────────────────────

/** Three-dot pagination indicator shown on slides 2–4. */
function DotsIndicator({ active }: { active: number }) {
  return (
    <View style={dotStyles.container}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i === active ? dotStyles.dotActive : dotStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    28,
  },
  dot: {
    height:          8,
    borderRadius:    4,
    marginHorizontal: 4,
  },
  dotActive: {
    width:           20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  dotInactive: {
    width:           8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});

// ─── Illustration Placeholder ─────────────────────────────────────────────────

/**
 * Temporary illustration placeholder — swap `source` prop with the real image
 * once the design assets are available.
 *
 * @param label - Accessible description forwarded to `accessibilityLabel`.
 * @param bgColor - Circular background color.
 * @param size - Diameter in logical pixels.
 */
function IllustrationPlaceholder({
  label,
  bgColor,
  size,
}: {
  label: string;
  bgColor: string;
  size: number;
}) {
  return (
    <View
      style={{
        width:           size,
        height:          size,
        borderRadius:    size / 2,
        backgroundColor: bgColor,
        alignItems:      'center',
        justifyContent:  'center',
        borderWidth:     2,
        borderColor:     'rgba(64,50,41,0.08)',
        borderStyle:     'dashed',
      }}
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      <Text style={{ fontSize: 52 }}>🐱</Text>
      <Text
        numberOfLines={2}
        style={{
          fontSize:          11,
          color:             BRAND.PRIMARY[400],
          textAlign:         'center',
          marginTop:         8,
          paddingHorizontal: 16,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Hero Slide (slide 1) ─────────────────────────────────────────────────────

function HeroSlide({
  slide,
  width,
  onStart,
  onSignIn,
  insets,
}: {
  slide:    WelcomeSlide;
  width:    number;
  onStart:  () => void;
  onSignIn: () => void;
  insets:   { top: number; bottom: number };
}) {
  return (
    <View style={[heroStyles.root, { width }]}>
      {/* ── Dark brand header ── */}
      <View
        style={[heroStyles.header, { paddingTop: insets.top + 36 }]}
      >
        <Text style={heroStyles.greeting}>Boas-vindas ao</Text>
        <Text style={heroStyles.brandName}>anicca</Text>
      </View>

      {/* ── Wave from dark → light (U-shape curve) ── */}
      <View style={{ backgroundColor: BRAND.BG.LIGHT }}>
        <Svg
          width={width}
          height={64}
          viewBox={`0 0 ${width} 64`}
          preserveAspectRatio="none"
          style={{ marginTop: -1 }}
        >
          <Path
            d={`M0,0 Q${width * 0.5},64 ${width},0 Z`}
            fill={BRAND.PRIMARY.DEFAULT}
          />
        </Svg>
      </View>

      {/* ── Illustration ── */}
      <View style={[heroStyles.illustrationArea, { backgroundColor: BRAND.BG.LIGHT }]}>
        <IllustrationPlaceholder
          label={slide.imagePlaceholderLabel}
          bgColor={BRAND.SECONDARY[100]}
          size={width * 0.62}
        />
      </View>

      {/* ── CTA ── */}
      <View
        style={[
          heroStyles.ctaArea,
          {
            backgroundColor: BRAND.BG.LIGHT,
            paddingBottom:   insets.bottom + 28,
          },
        ]}
      >
        <Button
          variant="secondary"
          size="lg"
          onPress={onStart}
          accessibilityLabel="Iniciar jornada no Anicca"
          style={{ width: '100%', marginBottom: 16 }}
        >
          Iniciar  →
        </Button>

        <TouchableOpacity
          onPress={onSignIn}
          activeOpacity={0.7}
          style={heroStyles.signInRow}
          accessibilityRole="button"
          accessibilityLabel="Entrar em conta existente"
        >
          <Text style={heroStyles.signInText}>Already have an account?  </Text>
          <Text style={heroStyles.signInLink}>Sign In.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    backgroundColor:   BRAND.PRIMARY.DEFAULT,
    paddingHorizontal: 28,
    paddingBottom:     24,
  },
  greeting: {
    fontFamily:  'Nunito_400Regular',
    fontSize:    22,
    color:       'rgba(255,255,255,0.80)',
    marginBottom: 2,
  },
  brandName: {
    fontFamily:    'Nunito_800ExtraBold',
    fontSize:      52,
    color:         '#FFFFFF',
    letterSpacing: -1,
    lineHeight:    56,
  },
  illustrationArea: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  ctaArea: {
    paddingHorizontal: 28,
    alignItems:        'center',
  },
  signInRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  signInText: {
    fontFamily: 'Nunito_400Regular',
    fontSize:   14,
    color:      BRAND.PRIMARY[400],
  },
  signInLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize:   14,
    color:      BRAND.SECONDARY.DEFAULT,
  },
});

// ─── Feature Slide (slides 2–4) ───────────────────────────────────────────────

function FeatureSlide({
  slide,
  width,
  activeIndex,
  onNext,
  insets,
}: {
  slide:       WelcomeSlide;
  width:       number;
  activeIndex: number;
  onNext:      () => void;
  insets:      { bottom: number };
}) {
  return (
    <View style={[featStyles.root, { width }]}>
      {/* ── Illustration area (light bg) ── */}
      <View style={[featStyles.topArea, { backgroundColor: slide.topColor }]}>
        <IllustrationPlaceholder
          label={slide.imagePlaceholderLabel}
          bgColor={BRAND.SECONDARY[100]}
          size={width * 0.6}
        />
      </View>

      {/* ── Organic wave transition ── */}
      <WaveDivider color={slide.bottomColor} width={width} direction={slide.id === 'tudo' ? 'left' : 'right'} />

      {/* ── Content panel ── */}
      <View
        style={[
          featStyles.bottomPanel,
          {
            backgroundColor: slide.bottomColor,
            paddingBottom:   insets.bottom + 32,
            marginTop:       -2,
          },
        ]}
      >
        <Text style={featStyles.title}>{slide.title}</Text>
        {slide.description !== null && (
          <Text style={featStyles.description}>{slide.description}</Text>
        )}

        <DotsIndicator active={activeIndex} />

        <Button
          variant="secondary"
          size="icon"
          onPress={onNext}
          accessibilityLabel="Próximo slide"
        >
          →
        </Button>
      </View>
    </View>
  );
}

const featStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topArea: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'flex-end',
    paddingBottom:  4,
  },
  bottomPanel: {
    alignItems:        'center',
    paddingHorizontal: 32,
    paddingTop:        28,
  },
  title: {
    fontFamily:   'Nunito_800ExtraBold',
    fontSize:     26,
    color:        '#FFFFFF',
    textAlign:    'center',
    marginBottom: 16,
    lineHeight:   34,
  },
  description: {
    fontFamily:   'Nunito_400Regular',
    fontSize:     16,
    color:        'rgba(255,255,255,0.85)',
    textAlign:    'center',
    lineHeight:   24,
    marginBottom: 28,
  },
});

// ─── WelcomeStep (exported) ────────────────────────────────────────────────────

/**
 * Four-slide welcome carousel shown before the 7-step onboarding questionnaire.
 *
 * @remarks
 * Uses a horizontal `FlatList` with `pagingEnabled` for native swipe behaviour.
 * After the last slide the arrow navigates to `(onboarding)/step-2-profile`.
 *
 * @returns The welcome carousel screen.
 */
export function WelcomeStep() {
  const router           = useRouter();
  const insets           = useSafeAreaInsets();
  const { width }        = useResponsive();
  const flatListRef      = useRef<FlatList<WelcomeSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (index < SLIDES.length) {
        flatListRef.current?.scrollToIndex({ index, animated: true });
      } else {
        router.push('/(onboarding)/step-2-profile');
      }
    },
    [router],
  );

  const handleStart  = useCallback(() => goToSlide(1), [goToSlide]);
  const handleSignIn = useCallback(() => router.push('/(auth)/login'), [router]);
  const handleNext   = useCallback(() => goToSlide(activeIndex + 1), [activeIndex, goToSlide]);

  const renderItem = useCallback(
    ({ item }: { item: WelcomeSlide }) => {
      if (item.isHero) {
        return (
          <HeroSlide
            slide={item}
            width={width}
            onStart={handleStart}
            onSignIn={handleSignIn}
            insets={insets}
          />
        );
      }
      return (
        <FeatureSlide
          slide={item}
          width={width}
          activeIndex={activeIndex}
          onNext={handleNext}
          insets={insets}
        />
      );
    },
    [width, handleStart, handleSignIn, handleNext, activeIndex, insets],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={SLIDES}
      keyExtractor={(s) => s.id}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
    />
  );
}
