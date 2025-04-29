import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  copy(string: string) {
    navigator.clipboard
      .writeText(string)
      .then(() => {
        console.log('Text copied to clipboard:', string);
      })
      .catch((err) => {
        console.error('Error copying text: ', err);
      });
  }
}
