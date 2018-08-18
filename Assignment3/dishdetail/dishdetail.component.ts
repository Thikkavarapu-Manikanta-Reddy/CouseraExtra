import { Component, OnInit,ViewChild} from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

dishIds: number[];
  prev: number;
  next: number;

   dish: Dish;

  @ViewChild('fform') feedbackFormDirective;

   feedbackForm: FormGroup;
  feedback: Comment;
  formErrors = {
    'author': '',
    'comment': ''
  };

 validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'First Name must be at least 2 characters long.',
      'maxlength':     'FirstName cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 2 characters long.'
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,private fb: FormBuilder) { this.createForm();}

   ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(+params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }


   createForm(): void {
   this.feedbackForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(2)] ],
    });
   this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

 onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

onSubmit() {
 const comment = this.feedbackForm.value;
    comment.date = new Date().toISOString();
    this.dish.comments.push(comment);
    this.feedbackForm.reset({
      rating: 5,
      comment: '',
      author: ''
    });
    this.feedbackFormDirective.resetForm({rating: 5});
  }


  setPrevNext(dishId: number) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

}
