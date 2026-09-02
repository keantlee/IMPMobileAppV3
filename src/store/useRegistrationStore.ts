import { create } from 'zustand';
import { Intervention } from '../api/registration';

/**
 * Client state for the New Merchant Registration flow. Caches the intervention
 * (program) list so the registration screen can reuse it without re-fetching.
 */
interface RegistrationState {
  interventions: Intervention[];
  setInterventions: (interventions: Intervention[]) => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationState>(set => ({
  interventions: [],
  setInterventions: interventions => set({ interventions }),
  reset: () => set({ interventions: [] }),
}));
