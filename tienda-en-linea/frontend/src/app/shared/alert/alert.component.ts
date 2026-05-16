import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter} from '@angular/core';
@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  imports: [ CommonModule]
})
export class AlertComponent {
  @Input() message!: string;
  @Input() type: 'success' | 'error' = 'success';

  @Output() close = new EventEmitter<void>();

  closeAlert() {
    this.close.emit();
  }
}
