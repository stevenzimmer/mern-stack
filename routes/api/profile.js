const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');

// Load Profile Model
const Profile = require('../../models/Profile');

// Load User Profile
const User = require('../../models/User');

//  @route  Get api/profile/test
//  @desc   Tests profile route
//  @access Public
// router.get('/test', (request, response) => {

//     return response.json({
//         message: 'profile works'
//     });

// });

//  @route  Get api/profile/
//  @desc   Get Current users profile 
//  @access Private

router.get('/', passport.authenticate('jwt', {
    session: false
}), ( request, response ) => {

    const errors = {};

    Profile.findOne({
        user: request.user.id
    })
    .populate('user', ['name', 'avatar'])
    .then( (profile) => {

        if(!profile) {

            errors.profile = "There is no profile for this user";
            return response.status(404).json(errors);
        
        }

        response.json(profile);

    }).catch( (e) => {
        
        response.status(404).json(e);

    });
});

//  @route  POST api/profile/
//  @desc   Create users profile 
//  @access Private

router.post('/', passport.authenticate('jwt', {
    session: false
}), ( request, response ) => {

    // 
    const { errors, isValid } = validateProfileInput(request.body);

    // Check Validation
    if( !isValid ) {
        // Return any errors with 400
        return response.status(400).json(errors);
    }
    
    // Get Fields
    const profileFields = {
        // Avatar, name, email
        user: request.user.id
    };

    if(request.body.handle) {
        profileFields.handle = request.body.handle;
    }

    if(request.body.company) {
        profileFields.company = request.body.company;
    }

    if(request.body.website) {
        profileFields.website = request.body.website;
    }

    if(request.body.location) {
        profileFields.location = request.body.location;
    }

    if(request.body.bio) {
        profileFields.bio = request.body.bio;
    }

    if(request.body.status) {
        profileFields.status = request.body.status;
    }

    if(request.body.githubusername) {
        profileFields.githubusername = request.body.githubusername;
    }

    // Skills - split into array

    if( typeof request.body.skills !== 'undefined' ) {
        profileFields.skills = request.body.skills.split(',');
    }

    // Social
    profileFields.social = {};

    if(request.body.youtube) {
        profileFields.social.youtube = request.body.youtube;
    }

    if(request.body.twitter) {
        profileFields.social.twitter = request.body.twitter;
    }

    if(request.body.facebook) {
        profileFields.social.facebook = request.body.facebook;
    }

    if(request.body.linkedin) {
        profileFields.social.linkedin = request.body.linkedin;
    }

    if(request.body.instagram) {
        profileFields.social.instagram = request.body.instagram;
    }

    Profile.findOne({
        user: request.user.id
    })
    .then( (profile) => {

        if( profile ) {
            // Update Profile
            Profile.findOneAndUpdate({
                user: request.user.id,
            }, {
                $set: profileFields
            }, {
                new: true
            }).then( (profile) => {
                response.json(profile)
            });
            
        } else {
            // Create Profile
           
            // Check if handle exists
            Profile.findOne({

                handle: profileFields.handle
            
            }).then( (profile) => {
            
                if(profile) {
                    errors.handle = "that handle already exists";
                    response.status(400).json(errors);
                }

                new Profile(profileFields).save().then( (profile) => {
                    return response.json(profile);
                })
            }).catch( (e) => {
                console.log(e);
            });
        }
    })

    
});

module.exports = router;