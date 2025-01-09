import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  years: { id: number, name: string }[] = [];
  months: { id: number, name: string }[] = [];
  days: { id: number, name: string }[] = [];

  selectedYear: number = new Date().getFullYear()
  selectedMonth: number = new Date().getMonth() + 1
  selectedDay: number = new Date().getDate()

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
      { id: 12, name: 'Декабрь' }   
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
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        this.days.push({ id: day, name: String(day) });
      }
    }
  }

  onYearChange() {
    this.selectedDay = 1; // Reset day if year changes
    this.initializeDays();
  }

  onMonthChange() {
    this.selectedDay = 1; // Reset day if month changes
    this.initializeDays();
  }

  onDayChange() {
    console.log(`Selected Date: ${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`);
  }
}