import { Component, OnInit, forwardRef, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  years: { id: number; name: string }[] = [];
  months: { id: number; name: string }[] = [];
  days: { id: number; name: string }[] = [];

  selectedYear: number | string = new Date().getFullYear();
  selectedMonth: number | string = new Date().getMonth() + 1;
  selectedDay: number | string = new Date().getDate();

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  // Custom event emitter for date change
  @Output() dateChange = new EventEmitter<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initializeYears();
    this.initializeMonths();
    this.setDefaultDateToToday();
    this.initializeDays();
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    for (let year = 1900; year <= currentYear; year++) {
      this.years.push({ id: year, name: String(year) });
    }
  }

  initializeMonths() {
    this.months = [
      { id: 1, name: 'Январь' },
      { id: 2, name: 'Февраль' },
      { id: 3, name: 'Март' },
      { id: 4, name: 'Апрель' },
      { id: 5, name: 'Май' },
      { id: 6, name: 'Июнь' },
      { id: 7, name: 'Июль' },
      { id: 8, name: 'Август' },
      { id: 9, name: 'Сентябрь' },
      { id: 10, name: 'Октябрь' },
      { id: 11, name: 'Ноябрь' },
      { id: 12, name: 'Декабрь' },
    ];
  }

  setDefaultDateToToday() {
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedMonth = today.getMonth() + 1; // Months are 0-indexed in JavaScript
    this.selectedDay = today.getDate();
  }

  initializeDays() {
    this.days = [];
    if (this.selectedYear !== null && this.selectedMonth !== null) {
      const daysInMonth = new Date(+this.selectedYear, +this.selectedMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        this.days.push({ id: day, name: String(day) });
      }
    }
  }

  onYearChange() {
    this.checkAndResetDay(); // Reset day only if it's invalid for the new year and month
    this.initializeDays();
    this.emitDate();
  }

  onMonthChange() {
    this.checkAndResetDay(); // Reset day only if it's invalid for the new month
    this.initializeDays();
    this.emitDate();
  }

  onDayChange() {
    this.emitDate();
  }

  // Check if the selected day is valid for the current month and year
  checkAndResetDay() {
    const daysInMonth = new Date(+this.selectedYear, +this.selectedMonth + 1, 0).getDate();
    if (+this.selectedDay > daysInMonth) {
      console.log('day reseted');
      this.selectedDay = 1; // Reset to the first day if the selected day is invalid
    }
  }

  // Emit the selected date in 'YYYY-MM-DD' format
  emitDate() {
    const formattedDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(
      this.selectedDay
    ).padStart(2, '0')}`;
    this.onChange(formattedDate); // Notify Angular forms of the change
    this.dateChange.emit(formattedDate); // Notify parent component of the change
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      this.selectedYear = year;
      this.selectedMonth = month;
      this.selectedDay = day;

      // Check and reset the day if it's invalid for the new month and year
      this.checkAndResetDay();

      // Update the days dropdown based on the new year and month
      this.initializeDays();

      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}