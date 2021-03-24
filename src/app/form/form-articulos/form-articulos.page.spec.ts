import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FormArticulosPage } from './form-articulos.page';

describe('FormArticulosPage', () => {
  let component: FormArticulosPage;
  let fixture: ComponentFixture<FormArticulosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormArticulosPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormArticulosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
