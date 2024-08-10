import { PageEvent } from '@angular/material/paginator';

export interface panelOption<TData = any> {
  hideToggle?: boolean;
  hidePanelDetail?: boolean;
  alwaysCloseDetail?: boolean;
  columnDefs: columnOption<TData>[] | null;
  pageEvent?: (x: PageEvent) => void;
}

export interface columnOption<TData = any> {
  headerName?: string;
  field?: string;
  width?: string;
  height?: string;
  hide?: boolean;
  cellClass?: string;
  cellStyle?: string;
  headerClass?: string;
  headerStyle?: string;
  toolTip?:boolean;
  headerType?: 'sorting' | 'dropDown' | 'search' | 'default';
  headerAction?: (
    x: string | number | [key: string] | TData | undefined,
  ) => string | number | void | undefined;
  html?: (
    x: string | number | TData | [key: string] | undefined,
  ) => string | number;
  format?: (
    x: string | number | TData | [key: string] | undefined,
  ) => string | number;
  action?: (
    x: string | number | [key: string] | TData | undefined,
  ) => string | number | void | undefined;
}

export type PaginationType = {
  currentPage: number;
  itemsPerPage: number;
  totalItemCount: number;
  totalPage: number;
};

export enum SortState {
  NoSort = 0,
  IncreasingSort = 1,
  DecreasingSort = 2,
}
