import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationComponent } from './notification.component';

describe('Notification', () => {
  let component: Notification;
  let fixture: ComponentFixture<Notification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Notification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
