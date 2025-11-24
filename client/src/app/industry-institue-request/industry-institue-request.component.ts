import { Component, inject } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { IndustryInstituteServiceApi } from '../services/industry-institue-api.service';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { IndInsRequestPopupComponent } from '../ind-ins-request-popup/ind-ins-request-popup.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-industry-institue-request',
  standalone: true,
  imports: [
    LoaderComponent, MatTableModule, CommonModule,
    MatIconModule
  ],
  templateUrl: './industry-institue-request.component.html',
  styleUrl: './industry-institue-request.component.scss'
})
export class IndustryInstitueRequestComponent {
  public apiError: string = '';
  public loading: boolean = true;
  public getIndustryInstituteDetails: any = []
  public limit: number = 1000;
  public offset: number = 0;
  public displayedColumns: any[] = [
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Website url', value: 'website' },
    { label: 'Address', value: 'address' },
    { label: 'Contact No', value: 'ph_no' },
    { label: 'Type', value: 'type' },
    { label: 'Status', value: 'status' },
  ];
  private modalService = inject(MatDialog)
  public searchText = '';

  constructor(
    private industryInstituteService: IndustryInstituteServiceApi,
  ) {
  }
  
  public async ngOnInit() {
    await this.getAllIndustryInstitute();
  }

  public async getAllIndustryInstitute() {
    this.loading = true;
    const filters: any = {}
    filters.q = this.searchText;
    filters.sort = 'created_at@ASC';
    filters.status = 'pending';
    await this.industryInstituteService.getAllIndustryInstitute(this.limit, this.offset, filters).then((res: any)=> {
      this.loading = false;
      this.getIndustryInstituteDetails = res.map((data: any)=> ({ ...data, address: `${data.city}, ${data.district}, ${data.state} - ${data.pincode}` }))
    }).catch((e)=> {
      this.loading = false;
      this.getIndustryInstituteDetails = [];
    })
  }

  public showpopup(rowData: any){   
    const modalRef = this.modalService.open(IndInsRequestPopupComponent, { autoFocus: false });
    modalRef.componentInstance.requestData = rowData;
    modalRef.componentInstance.isVerification = true;
    modalRef.afterOpened().subscribe(result => {
      console.log(`Dialog opened result: ${result}`, this.getIndustryInstituteDetails);
    });
    modalRef.afterClosed().subscribe(async result => {
      console.log(`Dialog closed result: ${result}`);
      await this.getAllIndustryInstitute();
    });
  }

  public setSearch(event: any) {
    this.searchText = event.target.value;   
  }

  public search(event: string) {
    if(event === 'close') this.searchText = '';
    this.getAllIndustryInstitute()
  }

}
