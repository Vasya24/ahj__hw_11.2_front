/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { ajax } from 'rxjs/ajax';
import {
  pluck, map, switchMap, catchError,
} from 'rxjs/operators';
import {
  zip, interval, of,
} from 'rxjs';

export default class LatestPostsWidget {
  constructor() {
    this.container = document.querySelector('.container');
    this.url = 'https://rxjs-2.herokuapp.com';
  }

  getPostsWithComments() {
    interval(10000).pipe(
      switchMap(() => ajax.getJSON(`${this.url}posts/latest`)
        .pipe(
          pluck('data'),
          map((data) => JSON.parse(data)),
          catchError((err) => of([])),
          switchMap((posts) => zip(...posts.map(
            (post) => ajax.getJSON(`${this.url}posts/${post.id}/comments/latest`)
              .pipe(
                pluck('data'),
                map((data) => JSON.parse(data)),
                catchError((err) => of([])),
                map((comments) => ({ ...post, comments })),
              ),
          ))),
        )),
    ).subscribe((posts) => {
      this.container.innerHTML = '';
      posts.forEach((post) => this.drawPost(post));
    });
  }

  drawPost(data) {
    const postBox = document.createElement('div');
    postBox.className = 'post-box';
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `
      <div class="post-header">
        <div class="avatar"><img class="avatar-image" src="${data.avatar}"></div>
        <div class="post-info">
          <div class="author">${data.author}</div>
          <div class="date">${this.formatDate(data.created)}</div>
        </div>
      </div>
      <div class="post-content"><img class="content-image" src="${data.image}"></div>
    `;
    const comments = document.createElement('div');
    comments.className = 'comments';
    comments.innerHTML = '<h1>Latest comments</h1>';
    data.comments.forEach((el) => {
      const comment = document.createElement('div');
      comment.className = 'comment';
      comment.innerHTML = `
        <div class="comment-avatar"><img class="comment-avatar-image" src="${el.avatar}"></div>
        <div class="comment-body">
          <div class="comment-header">
          <span class="comment-author">${el.author}</span><span class="comment-date">${this.formatDate(el.created)}</span>
          </div>
          <div class="comment-content">${el.content}</div>
        </div>
      `;
      comments.appendChild(comment);
    });
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'load-button';
    button.innerText = 'Load More';
    comments.appendChild(button);
    postBox.appendChild(post);
    postBox.appendChild(comments);
    this.container.appendChild(postBox);
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear().toString().slice(2);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes} ${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
  }
}
