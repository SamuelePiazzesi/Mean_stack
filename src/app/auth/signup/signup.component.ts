import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';



@Component({
  templateUrl: './signup.component.html',
  selector: 'app-signup',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  isLoading = false;


  onSignup(form: NgForm) {
    console.log(form.value);
  }
}
