import { AuthService } from './../../auth/auth.service';
import { Subscription } from 'rxjs';
import { Post } from './../post.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  private mode = 'create';
  private postId: string;
  private username: string;
  isLoading = false;
  post: Post;
  form: FormGroup;
  imagePreview: string;
  private authStatusSub: Subscription;

  constructor(private postsService: PostsService, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
    .subscribe(authStatus => {
      this.isLoading = false;
    });
    this.username = this.authService.getUserName();
    this.form = new FormGroup({
        'title': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)] }),
        'content': new FormControl(null, {validators: [Validators.required]}),
        'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = { id: postData._id, title: postData.title,
             content: postData.content, imagePath: postData.imagePath, creator: postData.creator, username: postData.username };
          this.form.setValue({'title': this.post.title, 'content': this.post.content, 'image': this.post.imagePath});
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    const post: Post = {
      id: null,
      title: this.form.value.title,
      content: this.form.value.content,
      imagePath: this.form.value.image,
      creator: null,
      username: this.username
    };
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(post, this.form.value.image);
    } else {
      this.postsService.updatePost( this.postId,
        this.username,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
      );
    }
    this.form.reset();

  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({'image': file});
    this.form.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);

  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }


}
