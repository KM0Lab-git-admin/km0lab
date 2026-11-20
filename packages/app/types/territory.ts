export interface Town {
  id: string
  name: string
  postalCodes: string[]
  artUrl?: string | null
}

/** `towns` starts with the home town, then the rest in stable alphabetical order. */
export interface Territory {
  scopeId: string
  scopeName: string
  homeTownId: string
  towns: Town[]
}

export interface ScopedItem<T> {
  item: T
  town: Town
}

export interface ScopeListing<T> {
  home: ScopedItem<T>[]
  nearby: ScopedItem<T>[]
  failedTownIds: string[]
}
