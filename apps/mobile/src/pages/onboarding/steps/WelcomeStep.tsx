/**
 * @fileoverview Welcome carousel — 3 onboarding slides shown before the questionnaire.
 * Mirrors the exact Card + Mascot dynamic of the Login screen!
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
  FlatList,
  StyleSheet,
  ViewToken,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { GradientButton } from '@/shared/ui/GradientButton';
interface WelcomeSlide {
  id: string;
  topBg: string;
  cardColor: string;
  title: string;
  titleColor: string;
  description: string;
  descColor: string;
  image: ImageSourcePropType;
  imageStyle: { width: number; height: number; bottom: number; left?: number };
  dotActive: string;
  dotInactive: string;
}
const SLIDES: WelcomeSlide[] = [
  {
    id: 'navegar',
    topBg: '#FF9A5C', // Orange
    cardColor: '#403229', // Dark Brown
    title: 'Navegando com você',
    titleColor: '#FFFFFF',
    description: 'Ani é o seu companheiro digital.\nEstamos aqui para organizar o seu tratamento,\nexplicar laudos e te dar suporte contínuo\nvia WhatsApp e App.',
    descColor: '#FFFFFF',
    image: require('../../../../assets/images/onboarding/ani-navigating.png'),
    imageStyle: { width: 620, height: 360, bottom: -75 }, // Navigating is wider
    dotActive: '#A68D7E',
    dotInactive: 'rgba(166, 141, 126, 0.2)',
  },
  {
    id: 'entenda',
    topBg: '#FFD45C', // Yellow
    cardColor: '#F0E9E5', // Light Cream
    title: 'Entenda e cuide de você',
    titleColor: '#403229',
    description: 'Registre seus sintomas e emoções diariamente.\nAcompanhe a evolução do seu bem-estar e\ncompartilhe informações valiosas\ncom a sua equipe médica.',
    descColor: '#403229',
    image: require('../../../../assets/images/onboarding/ani-care.png'),
    imageStyle: { width: 280, height: 280, bottom: -35 }, // Care is roughly square
    dotActive: '#FF9A5C',
    dotInactive: 'rgba(255, 154, 92, 0.2)',
  },
  {
    id: 'tudo',
    topBg: '#FF9A5C', // Orange
    cardColor: '#403229', // Dark Brown
    title: 'Tudo que você precisa,\nem um só lugar',
    titleColor: '#FFFFFF',
    description: 'Acesse os seus direitos facilmente,\nguarde documentos com segurança\ne receba orientações personalizadas\npara a sua rotina.',
    descColor: '#FFFFFF',
    image: require('../../../../assets/images/onboarding/ani-omnichannel.png'),
    imageStyle: { width: 360, height: 360, bottom: -40 },
    dotActive: '#A68D7E',
    dotInactive: 'rgba(166, 141, 126, 0.2)',
  },
];
function LineIndicator({ active, dotActive, dotInactive }: { active: number, dotActive: string, dotInactive: string }) {
  return (
    <View style={lineStyles.container}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[
            lineStyles.line,
            { backgroundColor: i === active ? dotActive : dotInactive }
          ]}
        />
      ))}
    </View>
  );
}
const lineStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  line: {
    height: 4,
    width: 48,
    borderRadius: 2,
  },
});
function FeatureSlide({
  slide,
  width,
  height,
  activeIndex,
  onNext,
  insets,
}: {
  slide: WelcomeSlide;
  width: number;
  height: number;
  activeIndex: number;
  onNext: () => void;
  insets: { bottom: number; top: number };
}) {
  return (
    <View style={[{ width, height }]}>
      
      {/* 1. Background Fill */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: slide.topBg }]} />
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        
        {/* Spacer to push card to bottom */}
        <View style={{ flex: 1, minHeight: 40 }} />
        <View 
          style={[featStyles.mascotAnchor, Platform.OS === 'web' ? { pointerEvents: 'none' } as any : undefined]} 
          pointerEvents={Platform.OS === 'web' ? undefined : 'none'}
        >
          <Image source={slide.image} style={[featStyles.mascotImage, slide.imageStyle]} resizeMode="contain" />
        </View>
        {/* 3. The Solid Card */}
        <View
          style={[
            featStyles.card,
            {
              backgroundColor: slide.cardColor,
              paddingBottom: Math.max(insets.bottom, 30), // 30px distance requested!
            },
          ]}
        >
          <LineIndicator active={activeIndex} dotActive={slide.dotActive} dotInactive={slide.dotInactive} />
          {/* Wrapper to center text vertically in the available space */}
          <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
            <Text style={[featStyles.title, { color: slide.titleColor }]}>{slide.title}</Text>
            
            <Text style={[featStyles.description, { color: slide.descColor }]}>
              {slide.description}
            </Text>
          </View>
          <GradientButton
            title="Continuar"
            onPress={onNext}
            colors={['#FF9A5C', '#E87A3E']}
            style={{ width: '100%', borderRadius: 24 }}
          />
        </View>
      </View>
    </View>
  );
}
const featStyles = StyleSheet.create({
  card: {
    height: '48%', // Reduced from 60% to eliminate huge empty gaps
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  mascotAnchor: {
    alignItems: 'center',
    width: '100%',
    height: 0,
    zIndex: 20,
    elevation: 20,
    overflow: 'visible',
  },
  mascotImage: {
    position: 'absolute',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
  },
  description: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
});
export function WelcomeStep() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useResponsive();
  const flatListRef = useRef<FlatList<WelcomeSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
        setActiveIndex(viewableItems[0].index!);
      }
    },
    [],
  );
  const goToSlide = useCallback(
    (index: number) => {
      if (index < SLIDES.length) {
        flatListRef.current?.scrollToIndex({ index, animated: true });
      } else {
        router.push('/(onboarding)/step-1-profile');
      }
    },
    [router],
  );
  const handleNext = useCallback(() => goToSlide(activeIndex + 1), [activeIndex, goToSlide]);
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login'); // Fallback in case of direct web refresh
    }
  }, [router]);
  const renderItem = useCallback(
    ({ item }: { item: WelcomeSlide }) => {
      return (
        <FeatureSlide
          slide={item}
          width={width}
          height={height}
          activeIndex={activeIndex}
          onNext={handleNext}
          insets={insets}
        />
      );
    },
    [width, height, handleNext, activeIndex, insets],
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#FF9A5C' }}>
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
      <TouchableOpacity 
        onPress={handleBack}
        style={{
          position: 'absolute',
          top: insets.top + 16,
          left: 24,
          padding: 12,
          zIndex: 30,
          elevation: 30,
        }}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}