import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationCenterComponent } from './notification-center.component';

describe('NotificationCenter', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
