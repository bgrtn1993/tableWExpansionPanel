import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  Input,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  columnOption,
  panelOption,
  PaginationType,
  SortState,
} from './panel.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { SkeletonDirective } from './skeleton.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgClass, NgComponentOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    NgClass,
    NgComponentOutlet,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatPaginatorModule,
    SkeletonDirective,
    MatMenuModule,
    ReactiveFormsModule,
    FormsModule,
    MatTooltip,
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  @ViewChild('dodoAccordion') dodoAccordion!: MatAccordion;
  // eslint-disable-next-line
  @Input() data: any[] = [];
  @Input() dataOption?: panelOption;
  @Input() html: string = ``;
  // eslint-disable-next-line
  @Input() component!: Component | any;
  @Input() paginationInfo!: PaginationType;
  @Input() loading: WritableSignal<boolean> = signal(false);

  protected readonly fb = inject(FormBuilder);

  // eslint-disable-next-line
  cloneData: any[] | undefined = [];
  currentSortColumn: string = '';
  // eslint-disable-next-line
  sortStates: any = {};
  sortState = SortState;
  height = '36.75px';
  pageSize = 20;
  pageIndex = 1;
  pageLength = 1;
  headersForm = this.fb.group({
    header: new FormArray([]),
  });

  // eslint-disable-next-line
  dataValues: WritableSignal<any[] | undefined> = signal([]);
  width = signal(window.innerWidth);
  arraySkeletonLoader: WritableSignal<number[]> = signal([]);

  ngOnChanges() {
    this.clone();
    this.dataValues.set(this.data);
    if (!this.currentSortColumn) {
      this.dataOption?.columnDefs?.forEach((x) => {
        if (x.field) {
          this.sortStates = { ...this.sortStates, [x.field]: 0 };
          (this.headersForm.get('header') as FormArray).push(
            new FormControl(''),
          );
        }
      });
    }

    if (this.paginationInfo) {
      this.pageLength = this.paginationInfo.totalItemCount;
      this.pageIndex = this.paginationInfo.currentPage;
      this.pageSize = this.paginationInfo.itemsPerPage;
    }
  }

  clone() {
    this.cloneData = this.cloneType(this.data);
  }

  // eslint-disable-next-line
  getHtml(data: any, cell: columnOption) {
    if (cell?.html) {
      return data ? cell.html(data! || '') : '';
    }
    return ``;
  }

  // eslint-disable-next-line
  getField(data: any, cell: columnOption) {
    if (cell?.format) {
      return data ? cell.format(data! || '') : '';
    }

    return data?.[cell?.field || ''] || '';
  }

  setSortState(sortCriteria: string, sortState: SortState) {
    this.sortStates[this.currentSortColumn] = SortState.NoSort;
    this.sortStates[sortCriteria] = sortState;
    this.currentSortColumn = sortCriteria;
  }
  // eslint-disable-next-line
  actionTrigger(data: any = {}, cell: any = {}) {
    cell.action(data, cell);
  }

  // eslint-disable-next-line
  headerTrigger(header: any = {}, sortNumber: number = 0, headerName = '') {
    header.headerAction({ ...header, sortNumber, headerName });
  }

  searchTrigger(i: number) {
    const item = this.dataOption?.columnDefs?.find(
      (item, index) => index === i,
    );
    const inputSearch = (this.headersForm.get('header') as FormArray)?.value[i];
    this.headerTrigger(item, 0, inputSearch);
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  pageEvent(event: PageEvent) {
    this.arraySkeletonLoader.set(
      this.pageItemsCalc(event.pageIndex, event.length, event.pageSize),
    );

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageLength = event.length;
    // @ts-ignore
    this.dataOption?.pageEvent(event);
  }

  nextSortState(sortCriteria: string) {
    const sortState = this.sortStates[sortCriteria];
    let nSort;
    let dataHas;
    let counter = 0;
    this.dataOption?.columnDefs?.forEach((x: columnOption) => {
      if (x.headerName) {
        counter++;
      }
      if (x.field === sortCriteria) {
        dataHas = { ...x, index: counter };
      }
    });
    switch (sortState) {
      case SortState.NoSort:
        this.setSortState(sortCriteria, SortState.DecreasingSort);
        if (!dataHas) {
          nSort = this.data?.sort((x, y) =>
            this.alphaNumSort(x?.[sortCriteria], y?.[sortCriteria]),
          );
        }

        dataHas = {
          // eslint-disable-next-line
          ...(dataHas as any),
          isAscending: SortState.IncreasingSort,
        };
        break;
      case SortState.IncreasingSort:
        if (!dataHas) {
          nSort = this.cloneData;
        }
        this.setSortState(sortCriteria, SortState.NoSort);

        dataHas = {
          // eslint-disable-next-line
          ...(dataHas as any),
          isAscending: SortState.NoSort,
        };
        break;
      case SortState.DecreasingSort:
        this.setSortState(sortCriteria, SortState.IncreasingSort);
        if (!dataHas) {
          nSort = this.data?.sort((x, y) =>
            this.alphaNumSort(y?.[sortCriteria], x?.[sortCriteria]),
          );
        }
        dataHas = {
          // eslint-disable-next-line
          ...(dataHas as any),
          isAscending: SortState.DecreasingSort,
        };
        break;
    }
    if (nSort) {
      this.dataValues.set(nSort);
    } else if (dataHas) {
      this.headerTrigger(dataHas, sortState);
    }
  }

  alphaNumSort = (a: string, b: string): number => {
    const nA = this.isNumber(a) ? a : a.trim();
    const nB = this.isNumber(b) ? b : b.trim();
    let comparison = 0;

    if (nA > nB) {
      comparison = 1;
    } else if (nA < nB) {
      comparison = -1;
    }

    return comparison;
  };

  pageItemsCalc(pageIndex: number, pageLength: number, pageSize: number) {
    const pageItems: number[] = [];
    const skeletonItemsCalc = (x: number) => {
      const items: number[] = [];
      for (let i = 0; i < x; i++) {
        items.push(i);
      }
      return items;
    };
    if (pageLength <= pageSize) {
      pageItems.push(...skeletonItemsCalc(pageLength));
    } else {
      const calcPageItem = pageLength - pageSize * pageIndex;
      const itemsCount =
        pageIndex === 0
          ? pageSize
          : calcPageItem >= pageSize
            ? pageSize
            : calcPageItem;
      pageItems.push(...skeletonItemsCalc(itemsCount));
    }
    return pageItems;
  }

  cloneType<T>(any: T): T {
    return JSON.parse(JSON.stringify(any));
  }

  isNumber = (n: any) => {
    // eslint-disable-next-line no-restricted-globals
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  };

  @HostListener('window:resize', ['$event'])
  onresize() {
    this.width.set(window.innerWidth);
  }
}
