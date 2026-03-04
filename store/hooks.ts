import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

/** Typed dispatch hook — use instead of plain `useDispatch` */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** Typed selector hook — use instead of plain `useSelector` */
export const useAppSelector = useSelector.withTypes<RootState>()
