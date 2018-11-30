const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// VALIDATE POST    
const validatePostInput = require('../../validation/post');

//  @route  Get api/posts
//  @desc   Get all posts
//  @access Public

router.get(
    '/', 
    ( request, response ) => {
        Post.find()
            .sort({
                date: -1
            })
            .then( posts => {
                response.json(posts)
            }).catch( e => {
                console.log(e);
            });
    }
);

//  @route  DELETE api/posts/:id
//  @desc   Delete a post by ID
//  @access Private
router.delete(
    '/:id', 
    passport.authenticate('jwt',  {
        session: false
    }), 
    ( request, response ) => {

        Profile
            .findOne({ user: request.user.id})
            .then( profile => {
                Post
                    .findById(request.params.id)
                    .then( post => {
                        // Check for post owner
                        if( post.user.toString() !== request.user.id ) {
                            return response.status(401).json({ 
                                notauthorized: "not authorized"
                            });
                        }

                        post.remove().then( () => {
                            response.json({ success: true })
                        });

                    })
                    .catch( e => {
                        console.log('post not found');
                    });
            });
    }
);


//  @route  Get api/posts/:id
//  @desc   Get a post by ID
//  @access Public
router.get(
    '/:id', 
    ( request, response ) => {
        Post
            .findById( request.params.id )
            .then( post => {
                response.json(post)
            }).catch( e => {
                console.log(e);
            });
    }
);

//  @route  Get api/posts
//  @desc   Create posts
//  @access Public

router.post(
    '/', 
    passport.authenticate('jwt', {
        session: false
    }), 
    ( request, response ) => {

        const { errors, isValid } = validatePostInput(request.body);

        // Check Validation
        if( !isValid ) {
            // If any errors, return 400
            return response.status(400).json(errors);
        }

        const newPost = new Post({
            text: request.body.text,
            name: request.body.name,
            avatar: request.body.avatar,
            user: request.user.id
        });

        newPost
            .save()
            .then( post => {
                return response.json(post);
            })
            .catch( e => {
                console.log( e );
            });
    }
);

//  @route  POST api/posts/like/:id
//  @desc   Like a post
//  @access Private
router.post(
    '/like/:id', 
    passport.authenticate('jwt',  {
        session: false
    }), 
    ( request, response ) => {

        Profile
            .findOne({ 
                user: request.user.id
            })
            .then( profile => {
                Post
                    .findById(request.params.id)
                    .then( post => {
                            
                        if( post.likes.filter( like => like.user.toString() === request.user.id ).length > 0 ) {

                            return response
                                    .status(400).json({ 
                                        alreadyliked: "user already liked this post"
                                    });
                        }

                        // Add user ID to likes array
                        post.likes.unshift({ user: request.user.id });

                        post.save().then( post => {
                            return response.json( post );
                        });
                    })
                    .catch( e => {
                        console.log('post not found');
                    });
            });
    }
);

//  @route  POST api/posts/unlike/:id
//  @desc   Unlike a post
//  @access Private
router.post(
    '/unlike/:id', 
    passport.authenticate('jwt',  {
        session: false
    }), 
    ( request, response ) => {

        Profile
            .findOne({ 
                user: request.user.id
            })
            .then( profile => {
                Post
                    .findById( request.params.id )
                    .then( post => {
                            
                        if( post.likes.filter( like => like.user.toString() === request.user.id ).length === 0 ) {

                            return response
                                    .status(400).json({ 
                                        notliked: "You have not yet liked"
                                    });
                        }

                        // Get Remove Index
                        const removeIndex = post.likes
                                                .map( item =>                   item.user.toString() )
                                                .indexOf(request.user.id);
                        // Splice out of array
                        post.likes.splice(removeIndex, 1);

                        // Save
                        post.save().then( post => response.json(post));
                            
                    })
                    .catch( e => {
                        console.log('post not found');
                    });
            });
    }
);

//  @route  POST api/posts/comment/:id
//  @desc   Add comment to a post
//  @access Private
router.post(
    '/comment/:id', 
    passport.authenticate('jwt', {
        session: false
    }), ( request, response ) => {
        
        const { errors, isValid } = validatePostInput(request.body);

        // Check Validation
        if( !isValid ) {
            // If any errors, return 400
            return response.status(400).json(errors);
        }
        
        Post
            .findById(request.params.id)
            .then( post => {

                const newComment = {
                    text: request.body.text,
                    name: request.body.name,
                    avatar: request.body.avatar,
                    user: request.user.id
                };

                // Add to comments array
                post.comments.unshift(newComment);
                
                // Save
                post
                    .save()
                    .then(post => {
                        return response.json(post)
                    })
                    .catch( e => {
                        response.status(404).json({
                            postnotfound: "no post found"
                        });
                    });
            });
    }
); 

//  @route  DELETE api/posts/comment/:id/:comment_id
//  @desc   Add comment to a post
//  @access Private
router.delete(
    '/comment/:id/:comment_id', 
    passport.authenticate('jwt', {
        session: false
    }), 
    ( request, response ) => {
    
        Post
            .findById(request.params.id)
            .then( post => {
            
                // Check to see if comment exists
                if( post.comments.filter( comment => {
                    return comment._id.toString() === request.params.comment_id;
                }).length === 0 ) {
                    return response.status(404).json({commentnotexists: "comment does not exist"});
                }

                // Get remove index
                const removeIndex = post.comments.map( item => {
                    item._id.toString()
                }).indexOf(request.params.comment_id);

                //  Splice comment out of array
                post.comments.splice(removeIndex, 1);
                post.save().then(post => {
                    return response.json(post);
                });
                
            });
    }
); 

module.exports = router;