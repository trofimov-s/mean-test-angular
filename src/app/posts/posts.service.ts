import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class PostsService {
  private _posts$ = new BehaviorSubject<Post[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  get posts$(): Observable<Post[]> {
    return this._posts$;
  }

  get total$(): Observable<number> {
    return this._total$;
  }

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postPerPage: number, currentPage: number): void {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    this.http
      .get<{
        message: string;
        posts: (Omit<Post, 'id'> & { _id: string })[];
        total: number;
      }>(environment.apiUrl + 'posts' + queryParams)
      .pipe(
        map((resp): { message: string; posts: Post[]; total: number } => ({
          ...resp,
          posts: resp.posts.map((post) => ({ ...post, id: post._id })),
        }))
      )
      .subscribe(({ posts, total }) => {
        this._total$.next(total);
        this._posts$.next(posts);
      });
  }

  addPost(title: string, content: string, image: File): void {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image, title);

    this.http
      .post<{ message: string; post: Post }>(
        environment.apiUrl + 'posts',
        formData
      )
      .subscribe(({ post }) => {
        const posts = this._posts$.getValue();
        this._posts$.next(posts ? [...posts, post] : [post]);

        this.router.navigate(['/']);
      });
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(environment.apiUrl + 'posts/' + id);
  }

  deletePost(id: string) {
    return this.http
      .delete<{ message: string }>(environment.apiUrl + 'posts/' + id)
      .pipe(
        tap(() => {
          const posts = this._posts$.getValue();
          this._posts$.next(posts.filter((post) => post.id !== id));
        })
      );
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string
  ): void {
    let formData;
    if (typeof image === 'object') {
      formData = new FormData();
      formData.append('id', id);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('image', image, title);
    } else {
      formData = { id, title, content, imagePath: image };
    }

    this.http
      .patch<{ message: string; post: Post }>(
        environment.apiUrl + 'posts/' + id,
        formData
      )
      .subscribe(({ post }) => {
        const updatedPosts: Post[] = this._posts$
          .getValue()
          .map((exPost) => (post.id !== id ? exPost : post));

        this._posts$.next(updatedPosts);
        this.router.navigate(['/']);
      });
  }
}
