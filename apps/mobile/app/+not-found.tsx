import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View className="flex-1 items-center justify-center bg-surface-dark p-8">
        <Text className="text-4xl mb-4">🐱</Text>
        <Text className="text-white font-bold text-xl mb-2 text-center font-nunito">
          Hmm, não encontrei essa tela
        </Text>
        <Text className="text-neutral-400 text-center mb-8 font-nunito">
          Parece que você se perdeu. Não se preocupe, vou te levar de volta!
        </Text>
        <Link href="/(tabs)/hub" className="text-primary-400 font-semibold text-base">
          Voltar ao Início
        </Link>
      </View>
    </>
  );
}
