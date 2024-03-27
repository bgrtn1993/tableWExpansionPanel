import {
  Component,
  inject,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
export type TimeSheetModel = {
  id: string;
  Id: string;
  Title: string;
  Date: string;
  berId: string;
  FullName: string;
  companyId: string;
  companyName: string;
  totalWorkHours: number;
  totalAmount: number;
  isAllAccepted: boolean;
  TimeSheetItems: TimeSheetItem[];
};
export type TimeSheetItem = {
  ItemStartDate: string;
  ItemStartTime: string;
  ItemEndDate: string;
  ItemEndTime: string;
  ItemBreakTimeMin: number;
  ItemBreakTimeMinute?: string;
  ItemTotalTime: number;
  ItemHourlyWage: number;
  ItemTotalWage: number;
  isCompanyAccepted: boolean;
};
@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [
    MatDivider,
    ReactiveFormsModule,
    NgClass,
    DatePipe,
    CurrencyPipe,
    MatFormField,
    CdkTextareaAutosize,
    MatInput,
    MatProgressSpinner,
    MatIcon,
  ],
  templateUrl: './test-detail.component.html',
  styleUrl: './test-detail.component.scss',
})
export class TestDetailComponent implements OnInit {
  @Input() data!: any;

  protected readonly fb = inject(FormBuilder);

  timeSheetData: WritableSignal<TimeSheetModel | null> = signal(null);
  editRows: WritableSignal<number[]> = signal([]);
  errorRows: WritableSignal<number[]> = signal([]);
  loading = signal(true);
  maxLength = signal(0);
  sendButtonDisable = signal(true);

  timeSheetForm = this.fb.group({
    startTime: new FormArray([]),
    endTime: new FormArray([]),
    breakTime: new FormArray([]),
    textMessage: new FormControl(''),
  });

  ngOnInit() {
    if (this.data) {
      this.setTimeSheet(this.data);
      this.loading.set(false);
    }
  }

  setTimeSheet(timeSheetData: any) {
    let counter = 0;
    const today = new Date();
    const nTimeItems =
      timeSheetData?.TimeSheetItems.map((sheet: any) => {
        if (today <= new Date(sheet.ItemEndDate)) {
          counter++;
        }
        return {
          ...sheet,
          ItemBreakTimeMinute: this.convertNumToHourMin(sheet.ItemBreakTimeMin),
        };
      }) || [];
    if (counter === 0) {
      this.sendButtonDisable.set(false);
    }
    const newTimeSheet = { ...timeSheetData, TimeSheetItems: nTimeItems };
    this.timeSheetData.set(newTimeSheet);
    this.timeSheetData()?.TimeSheetItems.forEach((sheet) => {
      (this.timeSheetForm.get('startTime') as FormArray).push(
        new FormControl(sheet.ItemStartTime),
      );
      (this.timeSheetForm.get('endTime') as FormArray).push(
        new FormControl(sheet.ItemEndTime),
      );
      (this.timeSheetForm.get('breakTime') as FormArray).push(
        new FormControl(sheet.ItemBreakTimeMinute),
      );
    });
  }

  onEdit(index: number) {
    const timeSheetItems = this.timeSheetData()?.TimeSheetItems || [];
    if (timeSheetItems) {
      const timeDate = new Date(timeSheetItems?.[index]?.ItemStartDate);
      const date = new Date();
      const today = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      if (today > timeDate) {
        const items = this.editRows();
        if (!items.includes(index)) {
          this.editRows.set([...items, index]);
        }
      } else {
        const errorItems = this.errorRows();
        this.errorRows.set([...errorItems, index]);
      }
    }
  }

  onRemove(index: number) {
    const items = this.editRows();
    const nItems = items.filter((x) => x !== index);
    this.editRows.set(nItems);
  }

  // updateTimeSheets() {
  //   const reqTimes = [];
  //   this.timeSheetData()?.TimeSheetItems.forEach((item, index) => {
  //     const startTime = this.timeSheetForm.get('startTime')?.value[index];
  //     const endTime = this.timeSheetForm.get('endTime')?.value[index];
  //
  //     const startTimeMin = this.convertHourMinToNum(startTime || '');
  //     const endTimeMin = this.convertHourMinToNum(endTime || '');
  //     const breakTimeMin =
  //       this.convertHourMinToNum(
  //         this.timeSheetForm.get('breakTime')?.value[index] || '',
  //       ) || 0;
  //     const calcWorkTime = endTimeMin - startTimeMin - breakTimeMin;
  //
  //     const nRows = this.errorRows().filter((x) => x !== index);
  //
  //     if (calcWorkTime <= 180) {
  //       this.errorRows.set([...nRows, index]);
  //     } else if (calcWorkTime > 600) {
  //       this.errorRows.set([...nRows, index]);
  //     } else if (calcWorkTime) {
  //       this.errorRows.set(nRows);
  //     }
  //     const startItem = this.editRows().includes(index)
  //       ? startTime || '08:00'
  //       : item.ItemStartTime;
  //     const endItem = this.editRows().includes(index)
  //       ? endTime || '18:00'
  //       : item.ItemEndTime;
  //     if (
  //       (startItem !== item.ItemStartTime ||
  //         endItem !== item.ItemEndTime ||
  //         breakTimeMin !== item.ItemBreakTimeMin) &&
  //       calcWorkTime
  //     ) {
  //       reqTimes.push({
  //         itemStartTime: startItem || '',
  //         itemEndTime: endItem || '',
  //         itemBreakTimeMin: breakTimeMin,
  //         itemEndDate: item.ItemEndDate,
  //         itemStartDate: item.ItemStartDate,
  //       });
  //     }
  //   });
  //
  //   if (reqTimes.length > 0) {
  //     return {
  //       Id: this.data.Id,
  //       berId: this.data.berId,
  //       timeSheetItems: reqTimes,
  //     } ;
  //   }
  //
  //   return null;
  // }

  sendMessage() {
    if (this.timeSheetForm.get('textMessage')?.value) {
      return {
        TimeSheetsId: this.data.id,
        berId: this.data.berId,
        companyId: this.data.companyId,
        messageFromIsber: true,
        message: this.timeSheetForm.get('textMessage')?.value,
      };
    }
    return null;
  }

  // sendItems() {
  //   const updateTimes = this.updateTimeSheets();
  //   const addMessage = this.sendMessage();
  //
  // }

  errorMessage(item: any, index: number) {
    const startTimeMin = this.convertHourMinToNum(
      this.timeSheetForm.get('startTime')?.value[index] || '',
    );
    const endTimeMin = this.convertHourMinToNum(
      this.timeSheetForm.get('endTime')?.value[index] || '',
    );
    const breakTimeMin =
      this.convertHourMinToNum(
        this.timeSheetForm.get('breakTime')?.value[index] || '',
      ) || 0;
    const workingMin = endTimeMin - startTimeMin - breakTimeMin;
    if (workingMin <= 180) {
      return 'Bitte beachten Sie dass ein Arbeitstag mindestens 3 Arbeitsstunden beinhalten muss, um einen  posten zu können';
    } else if (workingMin > 600) {
      return 'Leider entspricht Ihre Eingabe nicht den gesetzlichen Bestimmungen des (ArbZG). Die Arbeitszeiten der Arbeitnehmer dürfen nicht überschritten werden';
    }
    const timeDate = new Date(item?.ItemStartDate);
    const tDate = new Date();
    const today = new Date(
      tDate.getFullYear(),
      tDate.getMonth(),
      tDate.getDate(),
    );
    if (today <= timeDate) {
      return 'Das Bearbeiten und Verwalten von Arbeitszeiten für diesen Tag steht noch nicht zur Verfügung';
    }

    return null;
  }
  convert2digit(num: number) {
    return Number(num) * 10 > 99 ? String(num) : `0${num}`;
  }
  convertNumToHourMin(num: number): string {
    const hour = Math.floor(num / 60);
    const min = num % 60;
    return `${this.convert2digit(hour)}:${this.convert2digit(min)}` || '';
  }
  convertHourMinToNum(time: string): number {
    const splitItem = String(time).split(':');
    return Number(splitItem[0]) * 60 + Number(splitItem[1]);
  }
  calcLength(event: Event) {
    this.maxLength.set((event.target as HTMLInputElement)?.value.length || 0);
  }
}
