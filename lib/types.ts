export interface Slot {
  date: string;
  slots: {
    time: string;
    available: boolean;
  }[];
}
