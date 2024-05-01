import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Item } from 'src/app/models/item.model';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent  implements OnInit {

  @Input() item :Item;
  @Input() index;
  @Output() add :EventEmitter<Item>=new EventEmitter();
  @Output() minus :EventEmitter<Item>=new EventEmitter();

  fallbackImage ='assests/img/1.jpg';
  constructor() { }

  ngOnInit() {}

  quantityMinus(){
  this.minus.emit(this.item);
  }

  quantityPlus(){
   this.add.emit(this.item);
  }

}
