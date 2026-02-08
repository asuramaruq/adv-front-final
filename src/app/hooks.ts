/**
 * Pre-typed Redux hooks.
 * Always import from here instead of plain react-redux to get full type safety.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { AppRootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppRootState>();
