import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

SplashScreen.preventAutoHideAsync()

const screenOptions = { headerShown: false }

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    AntiqueOliveLight: require('../assets/fonts/Antique-Olive-Std-Light_3866.ttf'),
    AntiqueOliveRoman: require('../assets/fonts/Antique-Olive-Std-Roman_3869.ttf'),
    AntiqueOliveItalic: require('../assets/fonts/Antique-Olive-Std-Italic_3865.ttf'),
    AntiqueOliveCompact: require('../assets/fonts/Antique-Olive-Std-Compact_3864.ttf'),
    AntiqueOliveBold: require('../assets/fonts/Antique-Olive-Std-Bold_3863.ttf'),
    AntiqueOliveBlack: require('../assets/fonts/Antique-Olive-Std-Black_3861.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={screenOptions} />
    </>
  )
}
