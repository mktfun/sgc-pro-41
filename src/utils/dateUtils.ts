
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Parse the date in the local timezone to avoid timezone shifts
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('pt-BR');
}

export function isDateInRange(dateString: string, days: number): boolean {
  if (!dateString) return false;
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays >= 0;
}

export function getDaysUntil(dateString: string): number {
  if (!dateString) return 0;
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isToday(dateString: string): boolean {
  if (!dateString) return false;
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}

export function addMonths(dateString: string, months: number): string {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + months);
  
  return date.toISOString().split('T')[0];
}

export function addYears(dateString: string, years: number): string {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setFullYear(date.getFullYear() + years);
  
  return date.toISOString().split('T')[0];
}

// 🆕 FUNÇÃO ESPECÍFICA PARA ANIVERSÁRIOS DE HOJE
export function isBirthdayToday(birthDateString: string): boolean {
  if (!birthDateString) return false;
  
  const [year, month, day] = birthDateString.split('-').map(Number);
  const today = new Date();
  
  return today.getMonth() === (month - 1) && today.getDate() === day;
}

export function isBirthdayThisWeek(birthDateString: string): boolean {
  if (!birthDateString) return false;
  
  const [year, month, day] = birthDateString.split('-').map(Number);
  const today = new Date();
  const birthDate = new Date(today.getFullYear(), month - 1, day);
  
  // Calculate start and end of current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return birthDate >= startOfWeek && birthDate <= endOfWeek;
}

// 🆕 FUNÇÕES AUXILIARES OTIMIZADAS PARA O DASHBOARD
export function isWithinDays(dateString: string, days: number): boolean {
  if (!dateString) return false;
  
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  
  // Set both dates to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function isInMonth(dateString: string, monthsFromNow: number = 0): boolean {
  if (!dateString) return false;
  
  const targetDate = new Date(dateString);
  const referenceDate = new Date();
  referenceDate.setMonth(referenceDate.getMonth() + monthsFromNow);
  
  return targetDate.getMonth() === referenceDate.getMonth() && 
         targetDate.getFullYear() === referenceDate.getFullYear();
}
