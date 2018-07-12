import { PostsService } from './../posts.service';
import { Post } from './../post.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent, MatSnackBar } from '@angular/material';
import { AuthService } from '../../auth/auth.service';



@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss']
})
export class PostsListComponent implements OnInit, OnDestroy {

  listedPosts: Post[] = [
    // {title: 'post 1', content: 'this is the first post'},
    // {title: 'post 2', content: 'this is the second post'},
    // {title: 'post 3', content: 'this is the third post'},
  ];
  isLoading = false;
  isUserAuthenticated = false;
  isUsername = false;
  userId: string;
  username: string;

  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  private postsSub: Subscription;
  private userAuthSubscription: Subscription;


  constructor(public userSnackBar: MatSnackBar, private postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.username = this.authService.getUserName();
    this.postsSub = this.postsService.getPostUpdated().subscribe(( postData: {posts: Post[], postCount: number}) => {
      this.totalPosts = postData.postCount;
      this.isLoading = false;
        this.listedPosts = postData.posts;
    });
    this.isUserAuthenticated = this.authService.getisAuthenticated();
    this.isUsername = this.authService.getIsUserName();
    if (this.isUsername) {
     setTimeout(() => {
        this.userSnackBar.open(`hello ${this.username}`, 'undo', {
          duration: 4000
        });
     });
    }
    console.log(this.isUsername);
    this.userAuthSubscription = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isUserAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId) {
    if (this.listedPosts.length === 1) { // checks if this is the last post on the site
    this.currentPage -= 1;
    }
    this.isLoading = true;
    this.postsService.deletePost(postId)
    .subscribe(() => {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
    }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.userAuthSubscription.unsubscribe();
    this.isUsername = false;
  }


}
