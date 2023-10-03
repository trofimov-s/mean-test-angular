import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Post } from '../post.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute } from '@angular/router';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePostComponent implements OnInit {
  private isEditMode!: boolean;
  private postId!: string;
  isLoading!: boolean;
  form!: FormGroup;
  imagePreview?: string;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      content: new FormControl(null, [Validators.required]),
      image: new FormControl(null, [Validators.required], [mimeType]),
    });

    const id = this.route.snapshot.paramMap.get('postId');

    if (id) {
      this.isEditMode = true;
      this.postId = id;
      this.postsService.getPostById(id).subscribe((post) => {
        this.form.setValue({ title: post.title, content: post.content, image: post.imagePath });
        this.cdr.detectChanges();
      });
    }
  }

  pickedImg(e: Event): void {
    const file = (e.target as HTMLInputElement).files![0];

    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cdr.detectChanges();
    }

    reader.readAsDataURL(file);
  }

  savePost() {
    if (this.form.invalid) {
      return;
    }

    const { title, content, image } = this.form.value;
    this.isLoading = true;

    if (this.isEditMode) {
      this.postsService.updatePost(this.postId, title, content, image);
    } else {
      this.postsService.addPost(title, content, image);
    }

    this.form.reset();
  }
}
