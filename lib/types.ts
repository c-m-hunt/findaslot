export interface Slot {
  date: string;
  slots: SlotTime[];
}

export interface SlotTime {
  time: string;
  available: boolean;
}