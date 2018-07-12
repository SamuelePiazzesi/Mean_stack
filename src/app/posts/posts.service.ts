import { AuthService } from './../auth/auth.service';

import { HttpClient } from '@angular/common/http';
import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();


  getPostUpdated() {
    return this.postsUpdated.asObservable();
  }

  getPosts(postPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string, posts: any, maxPosts: number  }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(
        map(postData => {
        return {
          posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator,
            username: post.username
          };
        }),
      maxPosts: postData.maxPosts
    };
      }))
      .subscribe(transformedPostsData => {
        console.log(transformedPostsData);
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next(
          {posts: [...this.posts],
            postCount: transformedPostsData.maxPosts});
      });
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string,
       creator: string, username: string}>('http://localhost:3000/api/posts/' + id);
  }

  addPost(post: Post, image: File) {
    const postData = new FormData();

    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', image, post.title);
    postData.append('username', post.username);
    this.http.post<{message: String, post: Post}>('http://localhost:3000/api/posts', postData )
    .subscribe((responseData) => {
        this.router.navigate(['/']);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string, username: string) {
      let post: Post | FormData;
      if (typeof(image) === 'object') {
        post = new FormData();
        post.append('id', id);
        post.append('title', title);
        post.append('content', content);
        post.append('image', image, title);
      } else {
        post = {id: id, title: title, content: content, imagePath: image, creator: null, username: null};
      }
      this.http.put('http://localhost:3000/api/posts/' + id, post)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postId);
    }
}
