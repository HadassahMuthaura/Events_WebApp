import { create } from 'zustand'

export const useEventStore = create((set) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    search: '',
    upcoming: true,
  },

  setEvents: (events) => set({ events }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  clearFilters: () => set({ 
    filters: { category: null, search: '', upcoming: true } 
  }),
}))
