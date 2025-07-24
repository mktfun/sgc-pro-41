
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { ClientFormData } from '@/schemas/clientSchema';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PersonalDataTabProps {
  form: UseFormReturn<ClientFormData>;
}

function CalendarCaption({ 
  displayMonth, 
  onMonthChange 
}: { 
  displayMonth: Date;
  onMonthChange: (month: Date) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = 1920; i <= currentYear; i++) {
    years.push(i);
  }

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="flex justify-center items-center space-x-2 mb-4">
      <Select
        value={String(displayMonth.getMonth())}
        onValueChange={(value) => {
          const newDate = new Date(displayMonth);
          newDate.setMonth(Number(value));
          onMonthChange(newDate);
        }}
      >
        <SelectTrigger className="w-[120px] bg-slate-900/50 border-slate-700">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, i) => (
            <SelectItem key={month} value={String(i)}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(displayMonth.getFullYear())}
        onValueChange={(value) => {
          const newDate = new Date(displayMonth);
          newDate.setFullYear(Number(value));
          onMonthChange(newDate);
        }}
      >
        <SelectTrigger className="w-[100px] bg-slate-900/50 border-slate-700">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.reverse().map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PersonalDataTab({ form }: PersonalDataTabProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Dados Pessoais</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nome Completo *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome completo"
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cpfCnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">CPF/CNPJ</FormLabel>
              <FormControl>
                <MaskedInput
                  {...field}
                  mask={field.value && field.value.replace(/\D/g, '').length > 11 ? '99.999.999/9999-99' : '999.999.999-99'}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-white">Data de Nascimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-black/20 border-white/20 text-white hover:bg-black/30",
                        !field.value && "text-white/50"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd/MM/yyyy")
                      ) : (
                        <span>Selecione a data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(day: Date | undefined) => {
                      // Se o usuário limpou a data, a gente limpa também.
                      if (!day) {
                        field.onChange('');
                        return;
                      }

                      // --- AQUI COMEÇA O EXORCISMO ANTI-FUSO HORÁRIO ---

                      // 1. O 'day' que recebemos aqui é uma data local (Ex: 11/07/2025 00:00:00 GMT-0300)
                      // 2. Pegamos o offset do fuso horário do navegador em minutos. 
                      //    Para o Brasil (-3h), isso retornará 180.
                      const timezoneOffsetInMinutes = day.getTimezoneOffset();

                      // 3. Criamos uma nova data, somando o offset em milissegundos.
                      //    Isso efetivamente "cancela" o fuso horário, ajustando a data para 
                      //    o dia correto às 00:00:00 no fuso UTC.
                      const correctedDate = new Date(day.getTime() + (timezoneOffsetInMinutes * 60000));

                      // 4. Salvamos no nosso estado a data JÁ CORRIGIDA no formato ISO.
                      field.onChange(format(correctedDate, 'yyyy-MM-dd'));

                      // --- FIM DO EXORCISMO ---
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                    components={{
                      Caption: ({ displayMonth }) => (
                        <CalendarCaption 
                          displayMonth={displayMonth} 
                          onMonthChange={setCalendarMonth} 
                        />
                      ),
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Estado Civil</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full h-10 px-3 py-2 border border-white/20 bg-black/20 rounded-md text-sm text-white"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Profissão</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Engenheiro, Médico..."
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
