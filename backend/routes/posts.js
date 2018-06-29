const express = require('express');

const multer = require('multer');

const Post = require('../models/post');


const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('mimetype is invalid !');
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images')
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split('').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }

});

router.post('', multer({
  storage: storage
}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename

  });
  post.save().then(postAdded => {
    res.status(201).json({
      message: 'post added success',
      post: {
        id: postAdded._id,
        title: postAdded.title,
        content: postAdded.content,
        imagePath: postAdded.imagePath
      }
    });
  });
})

router.put('/:id',  multer({
  storage: storage
}).single('image'),(req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  })
  console.log(post);

  Post.updateOne({
      _id: req.params.id
    }, post)
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'post edited succesfully"'
      });
    })
})

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'post not found'
      });
    }
  })
})

router.get('', (req, res, next) => {
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
  });
});

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({
      _id: req.params.id
    })
    .then(result => {
      res.status(200).json({
        message: 'post deleted'
      });
    })
})

module.exports = router;
