import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarCancelacion } from './confirmar-cancelacion';

describe('ConfirmarCancelacion', () => {
  let component: ConfirmarCancelacion;
  let fixture: ComponentFixture<ConfirmarCancelacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarCancelacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarCancelacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
