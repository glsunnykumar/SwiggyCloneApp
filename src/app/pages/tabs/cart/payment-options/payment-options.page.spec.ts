import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentOptionsPage } from './payment-options.page';

describe('PaymentOptionsPage', () => {
  let component: PaymentOptionsPage;
  let fixture: ComponentFixture<PaymentOptionsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PaymentOptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
