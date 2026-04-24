import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
  Text,
} from '@km0lab/ui'
import { SafeAreaView, ScrollView, View } from 'react-native'

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text className="text-3xl font-sans-medium text-foreground">
            km0lab
          </Text>
          <Text className="text-base text-muted-foreground">
            Expo + NativeWind + @km0lab/ui (lote de primitivas).
          </Text>
        </View>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Tarjeta de ejemplo</CardTitle>
            <CardDescription>
              Card, Badge, Progress y Alert exportados desde el paquete
              compartido.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="default">
                <Text>Default</Text>
              </Badge>
              <Badge variant="secondary">
                <Text>Secondary</Text>
              </Badge>
              <Badge variant="outline">
                <Text>Outline</Text>
              </Badge>
            </View>
            <View className="gap-2">
              <Text className="text-muted-foreground text-sm">Progreso</Text>
              <Progress value={45} />
            </View>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="default"
              onPress={() => {
                console.log('Button pressed')
              }}
            >
              <Text>Acción</Text>
            </Button>
          </CardFooter>
        </Card>

        <Alert variant="default">
          <AlertTitle>Alerta</AlertTitle>
          <AlertDescription>
            Componente Alert sin icono (tokens semánticos en bordes y texto).
          </AlertDescription>
        </Alert>
      </ScrollView>
    </SafeAreaView>
  )
}
