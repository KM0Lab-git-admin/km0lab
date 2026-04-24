import { SafeAreaView, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-3xl font-semibold text-content">km0lab</Text>
        <Text className="text-base text-content-muted">
          Monorepo listo. Expo + NativeWind funcionando.
        </Text>
      </View>
    </SafeAreaView>
  )
}
