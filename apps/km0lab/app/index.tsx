import { Button, Text } from '@km0lab/ui'
import { SafeAreaView, View } from 'react-native'


export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <Text className="text-3xl font-sans-medium text-foreground">
          km0lab
        </Text>
        <Text className="text-base text-muted-foreground">
          Monorepo listo. Expo + NativeWind + @km0lab/ui funcionando.
        </Text>
        <Button
          variant="primary"
          size="default"
          onPress={() => {
            console.log('Button pressed')
          }}
        >
          <Text>Probar @km0lab/ui</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
