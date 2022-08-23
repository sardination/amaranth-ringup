import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditingProductListComponent } from './editing-product-list.component';

describe('EditingProductListComponent', () => {
  let component: EditingProductListComponent;
  let fixture: ComponentFixture<EditingProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditingProductListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditingProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
