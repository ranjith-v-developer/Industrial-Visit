import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { downloadBase64CSV, getRandomRGBColor } from '../../config/config';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import * as htmlToImage from 'html-to-image';
import { CommonService } from '../services/common.service';
import { isEmpty, startCase, uniq, uniqueId } from "lodash";

Chart.register(...registerables, ChartDataLabels);

interface filterDataIF {
  field: string,
  condition: string,
  value: string,
  from?: string,
  to?: string,
  [key: string]: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSelectModule, FormsModule],
})

export class DashboardComponent implements OnInit {

  constructor(
      private commonService: CommonService
    ) {}
  
  public statics: any[] = [];
  public clickedMenuId: string = '';
  public filterData: filterDataIF[] = [];
  public fields = [
    { name: 'Year', value: 'year' },
    { name: 'Month', value: 'month' }
  ]
  public conditions = [
    { name: 'Is', value: 'is' },
    { name: 'Is Not', value: 'not' },
    { name: 'Last n', value: 'last' },
    { name: 'Between', value: 'between' },
  ]
  public loading: boolean = true;
  
  resolveData = async () => {
    this.loading = true;
    await this.commonService.dashboardAPI(this.filterData).then((data: any) => {
      Object.entries(data).forEach(([key, value]) => {
        const typedValue = value as Record<string, any>;          
        if (['ivCountBasedYear', 'instituteAppliedCountBasedYear'].includes(key)) {
          const title = key === 'ivCountBasedYear' ? "Industrial Visits Count" : "Institute Applied Count"
          if (!isEmpty(value)) {
            this.statics.push({
              data: {
                id: uniqueId(),
                type: 'pie',
                title: title,
                labels: uniq(Object.keys(typedValue['data'])),
                values: [
                  {
                    label: 'Year',
                    data: Object.keys(typedValue['data']).map((key) => typedValue['data'][key])
                  }
                ],
              },
              downloadUrl: typedValue['downloadUrl'],
              title
            }); 
          }
        }
        if (['visitorsCountBasedYear', 'individualInsCountBasedYear', 'individualDeptCountBasedYear', 'individualIndCountBasedYear'].includes(key)) {
          let title = "";
          switch (key) {
            case 'visitorsCountBasedYear':
              title = 'Visitors Count'
              break;
            case 'individualInsCountBasedYear':
              title = 'Individual Institute name Count'
              break;
            case 'individualIndCountBasedYear':
              title = 'Individual Industrial name Count'
              break;
            case 'individualDeptCountBasedYear':
              title = 'Department Count'
              break;
            default:
              break;
          }
          if (!isEmpty(Object.values(typedValue['data']))) {
            this.statics.push({
              data: {
                id: uniqueId(),
                type: 'bar',
                title: title,
                labels: uniq(Object.values(typedValue['data']).flatMap((d: any) => Object.keys(d))),
                values: Object.keys(typedValue['data']).map((k: any)=> {
                  return {
                    label: startCase(k),
                    data: Object.values(typedValue['data'][k]),
                    ...k === 'attend' && { bgColor: Object.values(typedValue['data'][k]).map(() => 'rgb(100, 247, 100)') },
                    ...k === 'notAttend' && { bgColor: Object.values(typedValue['data'][k]).map(() => 'rgb(255, 90, 90)') }
                  }
                }),
              },
              downloadUrl: typedValue['downloadUrl'],
              title
            });
          } 
        }        
      })
    }).catch((e) => console.error(e));

    setTimeout(() => {
      this.chartVizualization()
    }, 0);
  }

  async ngOnInit(): Promise<void> {
    await this.resolveData();
  }

  getChartConfig = (chartData: any): any => {
    return {
      type: chartData.type,
      data: {
        labels: chartData.labels,
        datasets: chartData.values.map((d: any) => {
          return {
            label: d.label,
            data: d.data,
            backgroundColor: d.bgColor ? d.bgColor : d.data.map(() => getRandomRGBColor('light')),
            // borderWidth: 1
          }
        })
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: chartData.title
          },
          legend: {
            display: true
          },
          datalabels: {
            formatter: (value: any, context: any) => {
              if (chartData.type === 'pie') {
                return `${context.chart.data.labels[
                  context.dataIndex
                ]}-${value}`
              }
              return value
            }
          }
        }
      }
    };
  };

  clickMenu = (chartId: string) => {
    this.clickedMenuId = chartId !== this.clickedMenuId ? chartId : '';
  }

  downloadFile = (url: string, title: string) => {
    downloadBase64CSV(url.split(',')[1], `${title}.csv`);
  }

  downloadImage = (id: string, format: 'jpeg' | 'png' | 'svg') => {
    const getId = document.getElementById(id);
    if (getId !== null) {
      const options = {
        backgroundColor: 'white',
        style: { color: 'black' }
      };
  
      let promise;
  
      if (format === 'jpeg') {
        promise = htmlToImage.toJpeg(getId, options);
      } else if (format === 'png') {
        promise = htmlToImage.toPng(getId, options);
      } else if (format === 'svg') {
        promise = htmlToImage.toSvg(getId, options);
      } else {
        console.error('Invalid format selected');
        return;
      }
  
      promise.then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${id}.${format}`;
        link.href = dataUrl;
        link.click();
      }).catch(error => {
        console.error('Image download failed:', error);
      });
    }
  };
  
  chartVizualization() {
    this.statics.map(({ data }) => {
      const chartElement = document.getElementById(data.id) as HTMLCanvasElement;

      if (chartElement) {
        return new Chart(chartElement, this.getChartConfig(data));
      } else {
        console.error('Chart element not found:', data.id);
        return null;
      }
    }).filter((chart: any) => chart !== null);
  }

  addFilter() {
    this.filterData.push({
      field: '',
      condition: '',
      value: ''
    })
  }

  fieldSelection(event: any, index: number) {
    this.filterData[index] = {
      ...this.filterData[index],
      field: event.value,
    }
  }

  conditionSelection(event: any, index: number) {
    this.filterData[index] = {
      ...this.filterData[index],
      condition: event.value,
    }
  }

  onInputChange(event: any, condition: string, index: number, field = '') {
    if (['last', 'is'].includes(condition)) {
      this.filterData[index].value = event.target.value;
    }
  
    if (condition === 'between' && ['from', 'to'].includes(field)) {
      this.filterData[index][field] = event.target.value;
      this.filterData[index].value = `${(this.filterData[index].from && this.filterData[index].to) ? '' : `${this.filterData[index].from}-${this.filterData[index].to}`}`;
    }
  }
  
  clearAllFilter() {
    this.filterData = [];
    this.statics = [];
    this.resolveData()
  }

  clearFilter(idx: number) {
    this.filterData.splice(idx, 1);
    this.resolveData()
  }

  applyFilter() {
    this.statics = [];
    this.resolveData();
  }
}

