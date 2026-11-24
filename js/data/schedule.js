// Day index: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
export const OPENING_HOURS = {
  1: { label: 'Lunes', text: '09:15–15:00 y 17:00–21:00', ranges: [['09:15', '15:00'], ['17:00', '21:00']] },
  2: { label: 'Martes', text: '09:15–15:00 y 17:00–21:00', ranges: [['09:15', '15:00'], ['17:00', '21:00']] },
  3: { label: 'Miércoles', text: '09:15–15:00 y 17:00–21:00', ranges: [['09:15', '15:00'], ['17:00', '21:00']] },
  4: { label: 'Jueves', text: '09:15–15:00 y 17:00–21:00', ranges: [['09:15', '15:00'], ['17:00', '21:00']] },
  5: { label: 'Viernes', text: '09:15–21:00', ranges: [['09:15', '21:00']] },
  6: { label: 'Sábado', text: '10:00–21:00', ranges: [['10:00', '21:00']] },
  0: { label: 'Domingo', text: '11:00–20:00', ranges: [['11:00', '20:00']] }
};

export const DISPLAY_HOURS_ORDER = [1, 2, 3, 4, 5, 6, 0];
