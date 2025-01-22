import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import type { StoreType, StoreDispatch } from "@/store"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useStoreDispatch: () => StoreDispatch = useDispatch
export const useStoreSelector: TypedUseSelectorHook<StoreType> = useSelector
