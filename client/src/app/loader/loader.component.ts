import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';

export enum LoaderType  {
  FANCY = 'fancy',
  SPINNER_SMALL = 'spinner-small',
  SPINNER_BIG = 'spinner-big'
}
@Component({
  standalone: true, 
  imports: [CommonModule],
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() public id: string = 'global';
  @Input() public type: string =  LoaderType.SPINNER_BIG;
  @Input() public show: boolean =  false; 

  constructor() {}

}
