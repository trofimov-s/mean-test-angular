import { NgModule } from '@angular/core';
import { CreatePostComponent } from './create-post/create-post.component';
import { PostListComponent } from './post-list/post-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [ReactiveFormsModule, MaterialModule, CommonModule, RouterModule],
  declarations: [CreatePostComponent, PostListComponent],
})
export class PostsModule {}
