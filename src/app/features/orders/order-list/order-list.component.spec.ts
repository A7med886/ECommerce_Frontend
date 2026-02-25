import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderList } from './order-list.component';

describe('OrderList', () => {
  let component: OrderList;
  let fixture: ComponentFixture<OrderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
