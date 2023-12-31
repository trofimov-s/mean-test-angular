import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  isLoading?: boolean;

  constructor(private authService: AuthService) {}

  submit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password).subscribe(null, (err) => {
      this.isLoading = false;
    });
  }
}
