const express = require('express');

const multer = require('multer');

const Post = require('../models/post');
const checkAuthMiddle = require('../middlewares/check-auth');



exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
    username: req.body.username

  });
  post.save().then(postAdded => {
    res.status(201).json({
      message: 'post added success',
      post: {
        id: postAdded._id,
        title: postAdded.title,
        content: postAdded.content,
        imagePath: postAdded.imagePath,
        username: postAdded.username
      }
    });
  })
  .catch(error => {
    res.status(500).json({message: 'ATTENZIONE: impossibile creare il Post'})
  })
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId,
    username: req.body.username
  })


  Post.updateOne({
      _id: req.params.id,
      creator: req.userData.userId
    }, post)
    .then((result) => {
     if (result.nModified > 0) {
      res.status(201).json({
        message: 'post edited succesfully"'
      });
     } else {
      res.status(401).json({
        message: 'non sei l\'utente creatore del post'
      });
     }

    })
    .catch(error => {
      res.status(500).json({message:'Non è possibile aggiornare il post'})
    })
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'post not found'
      });
    }
  })
  .catch(error => {
    res.status(500).json({message: 'Impossibile trovare il post'})
  })
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPost;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
  .then(docs => {
    fetchedPost = docs;
    return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: 'posts feched',
      posts: fetchedPost,
      maxPosts: count
    });
  })
  .catch(error => {
    res.status(500).json({message: 'Impossibile caricare i Post'})
  })
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    })
    .then(result => {
      if (result.n > 0) {
        res.status(201).json({
          message: 'post edited succesfully"'
        });
       } else {
        res.status(401).json({
          message: 'non sei l\'utente creatore del post'
        });
       }
    })
    .catch(error => {
      res.status(500).json({message: 'Impossibile eliminare il post'})
    })
};
