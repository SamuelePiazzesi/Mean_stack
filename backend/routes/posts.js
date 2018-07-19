const express = require('express');
const multer = require('multer');

const PostsController = require('../controllers/posts');
const checkAuthMiddle = require('../middlewares/check-auth');


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



router.post('', checkAuthMiddle, multer({
  storage: storage
}).single('image'), PostsController.createPost)

router.put('/:id',  checkAuthMiddle, multer({
  storage: storage
}).single('image'), PostsController.updatePost )

router.get('/:id', PostsController.getPost )

router.get('', PostsController.getPosts);

router.delete('/:id', checkAuthMiddle, PostsController.deletePost)


module.exports = router;
