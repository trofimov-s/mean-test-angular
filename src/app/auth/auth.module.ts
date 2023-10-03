import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  imports: [CommonModule, MaterialModule, FormsModule, AuthRoutingModule],
  declarations: [LoginComponent, SignupComponent],
})
export class AuthModule {}
