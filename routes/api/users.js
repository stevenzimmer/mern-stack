const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const router = express.Router();
const jwt = require('jsonwebtoken');

const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');

// Load User Model
const User = require('../../models/User');


//  @route  Get api/users/test
//  @desc   Tests users route
//  @access Public
router.get('/test', (request, response) => {

    return response.json({
        message: 'Users works'
    });

});

//  @route  Get api/users/register
//  @desc   Register User
//  @access Public
router.post('/register', (request, response) => {

        const { errors, isValid } = validateRegisterInput( request.body );

        // Check validation
        if ( !isValid ) {
            return response.status(400).json(errors);
        }

        User.findOne({
            email: request.body.email
        }).then( ( user ) => {

            if( user ) {
                errors.email = "email already exists";
                return response.status(400).json(errors);
            } else {

                const avatar = gravatar.url( request.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });

                const newUser = new User({
                    name: request.body.name,
                    email: request.body.email,
                    avatar,
                    password: request.body.password
                });

                bcrypt.genSalt(10, (error, salt) => {

                    bcrypt.hash( newUser.password, salt, ( error, hash ) => {
                    
                        if( error ) {
                            console.log(error);
                        }

                        newUser.password = hash;
                        
                        newUser.save().then( ( user ) => {
                        
                            response.json( user );
                        
                        }).catch( (e) => {
                        
                            console.log(e);
                        
                        });
                        
                    });
                });
            }
        });
});

// Validate login
const validateLoginInput = require('../../validation/login');


//  @route  Get api/users/login
//  @desc   login User / Returning Token
//  @access Public
router.post('/login', ( request, response ) => {

    const { errors, isValid } = validateLoginInput( request.body );

    // Check validation
    if ( !isValid ) {
        return response.status(400).json(errors);
    }

    const email     = request.body.email;
    const password  = request.body.password;

    // Find User by email
    User.findOne({
        email
    }).then( ( user ) => {

        console.log( 'user ', user );

        // Check for user
        if( !user ) {
            errors.email = "user not found";
            return response.status(404).json(errors);
        }

        // Check Password
        bcrypt.compare( password, user.password )
            .then( ( isMatch ) => {

                if( isMatch ) {

                    // User Matched

                    // 
                    const payload = {
                        id: user._id,
                        name: user.name,
                        avatar: user.avatar
                    }

                    // Sign Token
                    jwt.sign( 
                        payload, 
                        keys.secretKey, 
                        {
                            expiresIn: 3600
                        }, 
                        (err, token) => {
                            if(!err) {

                                response.json({
                                    success: true,
                                    token: "Bearer " + token
                                });

                            }
                        }
                    );
                    
                } else {
                    
                    errors.password = "password incorrect";
                    response.status(400).json(errors);
                
                }
            }).catch( (e) => {

                console.log('this is a catch ', e);
            
            });
    }).catch( (e) => {

        console.log( 'this is another catch ', e);

    });
});

//  @route  Get api/users/current
//  @desc   Return current user
//  @access Private
router.get('/current', 
    passport.authenticate('jwt', {
        session: false
    }), 
    ( request, response ) => {
        response.json({
            id: request.user.id,
            name: request.user.name,
            email: request.user.email
        });
    }
);

module.exports = router;