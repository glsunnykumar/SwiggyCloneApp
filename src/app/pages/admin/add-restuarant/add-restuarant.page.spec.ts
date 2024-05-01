import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRestuarantPage } from './add-restuarant.page';

describe('AddRestuarantPage', () => {
  let component: AddRestuarantPage;
  let fixture: ComponentFixture<AddRestuarantPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddRestuarantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
