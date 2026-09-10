/**
 * Utilidades para el cálculo inteligente de fechas y turnos de entrega
 * para Rosanfer Florería (Cusco, Perú - Zona horaria America/Lima UTC-5).
 * 
 * Reglas de negocio artesanal:
 * - Turno Mañana: 09:00 a 13:00
 * - Turno Tarde: 14:00 a 19:00
 * - Todo arreglo se elabora a mano con flores frescas bajo pedido.
 * - Si se pide a partir de las 09:00 hrs para "Hoy", ya no se permite el turno mañana (está en curso o pasado).
 * - Si se pide a partir de las 14:00 hrs (durante o después del turno tarde), se desactiva "Hoy", 
 *   ya que elaborar y entregar el mismo día es inviable. Se programa para "Mañana" en adelante.
 */

export const SLOT_MORNING = 'Mañana (09:00 - 13:00)';
export const SLOT_AFTERNOON = 'Tarde (14:00 - 19:00)';
export const SLOT_ALL_DAY = 'Todo el día (09:00 - 19:00)';

export const ALL_DELIVERY_SLOTS = [
  SLOT_MORNING,
  SLOT_AFTERNOON,
  SLOT_ALL_DAY,
];

export interface PeruTimeData {
  /** Objeto Date ajustado al horario local de Cusco/Perú */
  peruDate: Date;
  /** Hora actual (0 - 23) en Cusco */
  currentHour: number;
  /** Minuto actual (0 - 59) en Cusco */
  currentMinute: number;
  /** Hora formateada en texto amigable, ej: "10:15 am" */
  formattedTime: string;
  /** Fecha de hoy en formato YYYY-MM-DD */
  todayDateStr: string;
  /** Fecha de mañana en formato YYYY-MM-DD */
  tomorrowDateStr: string;
  /** Si todavía es posible aceptar pedidos para entregar HOY */
  isSameDayAllowed: boolean;
  /** Si para HOY está disponible el turno Mañana */
  isMorningSlotAllowedToday: boolean;
  /** Si para HOY está disponible el turno Tarde */
  isAfternoonSlotAllowedToday: boolean;
  /** Lista de turnos válidos si el cliente elige HOY */
  availableSlotsToday: string[];
  /** Mensaje explicativo sobre los horarios de taller para el cliente */
  noticeMessage: string;
}

/**
 * Obtiene la fecha y hora oficial de Perú (America/Lima) independientemente de la zona del navegador del cliente
 */
export function getPeruTime(): PeruTimeData {
  const now = new Date();
  
  // Extraer componentes según la zona horaria de Perú
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const map: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== 'literal') {
        map[p.type] = parseInt(p.value, 10);
      }
    }
    if (map.year && map.month && map.day && map.hour !== undefined) {
      year = map.year;
      month = map.month;
      day = map.day;
      hour = map.hour;
      minute = map.minute || 0;
    }
  } catch (e) {
    console.warn('Fallback a hora local por fallo en Intl:', e);
  }

  // Generar strings YYYY-MM-DD con padStart
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayDateStr = `${year}-${pad(month)}-${pad(day)}`;

  // Calcular mañana
  const peruDateObj = new Date(year, month - 1, day, hour, minute);
  const tomorrowObj = new Date(peruDateObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowDateStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;

  // Formato 12 horas am/pm
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedTime = `${displayHour}:${pad(minute)} ${period}`;

  // REGLAS DEL TALLER FLORAL:
  // - A partir de las 09:00 hrs, el turno mañana (09:00 - 13:00) ya no se puede programar para hoy.
  // - A partir de las 14:00 hrs, ningún pedido para hoy se puede aceptar (cerrado el mismo día).
  const isMorningSlotAllowedToday = hour < 9;
  const isAfternoonSlotAllowedToday = hour < 14;
  const isSameDayAllowed = isAfternoonSlotAllowedToday;

  const availableSlotsToday: string[] = [];
  if (isMorningSlotAllowedToday) {
    availableSlotsToday.push(SLOT_MORNING);
  }
  if (isAfternoonSlotAllowedToday) {
    availableSlotsToday.push(SLOT_AFTERNOON);
  }

  let noticeMessage = '';
  if (!isSameDayAllowed) {
    noticeMessage =
      'Pedidos para hoy cerrados por tiempo de elaboración artesanal. Próxima entrega disponible: Mañana.';
  } else if (!isMorningSlotAllowedToday) {
    noticeMessage =
      'Para entregas hoy, despachamos en el turno Tarde (14:00 - 19:00) para garantizar la confección fresca de tu arreglo.';
  } else {
    noticeMessage =
      'Taller floral abierto. Puedes elegir turno Mañana (09:00 - 13:00) o Tarde (14:00 - 19:00) para hoy.';
  }

  return {
    peruDate: peruDateObj,
    currentHour: hour,
    currentMinute: minute,
    formattedTime,
    todayDateStr,
    tomorrowDateStr,
    isSameDayAllowed,
    isMorningSlotAllowedToday,
    isAfternoonSlotAllowedToday,
    availableSlotsToday,
    noticeMessage,
  };
}

/**
 * Retorna la lista de turnos permitidos según la opción de fecha seleccionada
 */
export function getAvailableSlots(
  dateOption: 'today' | 'tomorrow' | 'custom',
  selectedDateStr: string,
  timeData: PeruTimeData
): string[] {
  const isToday =
    dateOption === 'today' ||
    (dateOption === 'custom' && selectedDateStr === timeData.todayDateStr);

  if (isToday) {
    return timeData.availableSlotsToday;
  }

  // Para mañana o cualquier fecha futura, todos los turnos están disponibles
  return ALL_DELIVERY_SLOTS;
}
