import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingupComponent } from './ringup.component';

describe('RingupComponent', () => {
  let component: RingupComponent;
  let fixture: ComponentFixture<RingupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RingupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RingupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
