
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateEditUser } from './create-edit-user';
import { UserService } from '../../services/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('CreateEditUser (Frontend Unit Test)', () => {
  let component: CreateEditUser;
  let fixture: ComponentFixture<CreateEditUser>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', ['getUserByCorreo', 'createUser', 'updateUser']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateEditUser, FormsModule, CommonModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: Router, useValue: rSpy },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => null }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
