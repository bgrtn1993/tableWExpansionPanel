import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { panelOption } from './panel/panel.model';
import { PageEvent } from '@angular/material/paginator';
import { PanelComponent } from './panel/panel.component';
import { TestDetailComponent } from './test-detail/test-detail.component';
import { data } from './test-detail/mock.data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tunaPanel';

  protected readonly testDetailComponent = TestDetailComponent;
  protected readonly data = data;

  panelOption: panelOption = {
    hideToggle: false,
    hidePanelDetail: false,
    pageEvent: (event: PageEvent) => {
      console.log(event);
    },
    columnDefs: [
      {
        headerName: 'Test Name',
        hide: false,
        field: 'Name',
        headerType: 'search',
        headerAction: (x) => {
          console.log(x);
        },
        headerStyle: 'width:120px',
        cellStyle: 'width:120px',
        cellClass: 'text-black',
      },
      {
        headerName: 'Test Title',
        hide: false,
        field: 'title',
        headerType: 'search',
        toolTip:true,
        headerAction: (x) => {
          console.log(x);
        },
        headerStyle: 'min-width:140px; width:200px',
        headerClass: 'd-flex justify-content-center align-items-center gap-0',
        cellStyle: 'min-width:140px; width:200px;',
        cellClass: 'd-flex justify-content-center',
        html: (x) => {
          return `<span class="justify-content-center text-black fs-8 text-uppercase">${x.title}<span class="text-black-50 text-lowercase"> m/w/d</span></span>`;
        },
      },
      {
        headerName: 'Date',
        hide: false,
        field: 'date',
        headerType: 'sorting',
        headerAction: (x) => {
          console.log(x);
        },
        headerStyle: 'min-width:80px; width:200px',
        headerClass: 'd-flex justify-content-center align-items-center gap-0',
        cellStyle: 'min-width:80px; width:200px',
        cellClass: 'bg-danger text-white',
        format: (x) => {
          return x?.['date']?.replace('-', ' - ') || '';
        },
      },
    ],
  };
}
