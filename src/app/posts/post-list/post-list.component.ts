import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Observable } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  totalPosts$!: Observable<number>;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];
  currentPage = 1;
  isAuth$!: Observable<boolean>;
  userId$!: Observable<string>;

  constructor(private postsService: PostsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuth$ = this.authService.getAuthStatusListener();
    this.totalPosts$ = this.postsService.total$;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.posts$ = this.postsService.posts$;
    this.userId$ = this.authService.userId$;
  }

  deletePost(id: string): void {
    this.postsService
      .deletePost(id)
      .subscribe(() =>
        this.postsService.getPosts(this.postsPerPage, this.currentPage)
      );
  }

  onChangePage(pageData: PageEvent): void {
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}
