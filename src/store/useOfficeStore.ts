import { create } from 'zustand';
import { OfficeListItem, OfficeDetail } from '../api/office';

/**
 * Client state for the Office Info feature. Holds the fetched office list, the
 * derived role (main vs branch), and the office currently selected for editing
 * so the Edit form screen can prefill without re-fetching the list.
 */
interface OfficeState {
  role: 'main' | 'branch' | null;
  offices: OfficeListItem[];
  // The office currently being edited (list row) — used to seed the Edit form.
  selectedOffice: OfficeListItem | null;
  // Full detail loaded for the selected office (edit prefill payload).
  selectedDetail: OfficeDetail | null;

  setRole: (role: 'main' | 'branch' | null) => void;
  setOffices: (offices: OfficeListItem[]) => void;
  setSelectedOffice: (office: OfficeListItem | null) => void;
  setSelectedDetail: (detail: OfficeDetail | null) => void;
  reset: () => void;
}

export const useOfficeStore = create<OfficeState>(set => ({
  role: null,
  offices: [],
  selectedOffice: null,
  selectedDetail: null,

  setRole: role => set({ role }),
  setOffices: offices => set({ offices }),
  setSelectedOffice: office => set({ selectedOffice: office }),
  setSelectedDetail: detail => set({ selectedDetail: detail }),
  reset: () =>
    set({
      role: null,
      offices: [],
      selectedOffice: null,
      selectedDetail: null,
    }),
}));
