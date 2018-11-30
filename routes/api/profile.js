const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Load Profile Model
const Profile = require('../../models/Profile');

// Load User Profile
const User = require('../../models/User');

//  @route  Get api/profile/
//  @desc   Get Current users profile 
//  @access Private

router.get(
    '/', 
    passport.authenticate('jwt', {
        session: false
    }), 
    ( request, response ) => {

        const errors = {};

        Profile
            .findOne({
                user: request.user.id
            })
            .populate('user', ['name', 'avatar'])
            .then( (profile) => {

                if(!profile) {

                    errors.profile = "There is no profile for this user";
                    return response.status(404).json(errors);
                
                }

                response.json(profile);

            })
            .catch( (e) => {
                response.status(404).json(e);

            });
});

//  @route  Get api/profile/handle:handle
//  @desc   Get Profile by handle
//  @access Public

router.get(
    '/all', 
    ( request, response ) => {
        const errors = {};

        Profile
            .find()
            .populate('user', ['name', 'avatar'])
            .then( ( profiles ) => {
                if( !profiles ) {
                    errors.noprofile = "There are no profiles";
                    return response.status(404).json(errors);
                }

                response.json(profiles);

            })
            .catch( (e) => {
                return response.status(404).json({profile: "there are no profiles"});
            });
    }
);

//  @route  Get api/profile/handle:handle
//  @desc   Get Profile by handle
//  @access Public
router.get(
    '/handle/:handle', 
    (request, response ) => {

        const errors = {};

        Profile
            .findOne({
                handle: request.params.handle
            })
            .populate('user', ['name', 'avatar'])
            .then( profile => {
                if( !profile ) {
                    errors.noprofile = 'there is no profile for this user';
                    response.status(404).json(errors);
                }

                response.json(profile);

            })
            .catch( e => {
                return response.status(404).json(e);
            });
    }
);

//  @route  Get api/profile/user/:user_id
//  @desc   Get Profile by User ID
//  @access Public
router.get(
    '/user/:user_id', 
    (request, response ) => {

        const errors = {};

        Profile.findOne({
            _id: request.params.user_id
        })
        .populate('user', ['name', 'avatar'])
        .then( profile => {
            if( !profile ) {

                errors.noprofile = 'there is no profile for this user';
                response.status(404).json(errors);
            
            }

            response.json(profile);

        })
        .catch( e => {
            return response.status(404).json({
                profile: "there is no profile for this user"
            });
        });
    }
);

//  @route  POST api/profile/
//  @desc   Create users profile 
//  @access Private

router.post(
    '/', 
    passport.authenticate('jwt', {
        session: false
    }), 
    ( request, response ) => {
 
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

    Profile
        .findOne({
            user: request.user.id
        })
        .then( (profile) => {

            if( profile ) {
                // Update Profile
                Profile
                    .findOneAndUpdate({
                        user: request.user.id,
                    }, {
                        $set: profileFields
                    }, {
                        new: true
                    })
                    .then( (profile) => {
                        response.json(profile)
                    }).catch( e => {
                        console.log('error')
                    });
                
            } else {
                // Create Profile
            
                // Check if handle exists
                Profile
                    .findOne({

                        handle: profileFields.handle
                    
                    })
                    .then( (profile) => {
                    
                        if( profile ) {
                            errors.handle = "that handle already exists";
                            response.status(400).json(errors);
                        }

                        new Profile(profileFields)
                            .save()
                            .then( (profile) => {
                                return response.json(profile);
                            }).catch( e => {
                                console.log(e);
                            });
                    })
                    .catch( (e) => {
                        console.log(e);
                    });
                }
        })
        .catch( (e) => {
            console.log( 'this is an error from home post ',e );
        });

    }
);

//  @route  POST api/profile/experience
//  @desc   Add experience to Profile
//  @access Private

router.post(
    '/experience', 
    passport.authenticate('jwt', {
        session: false
    }), 
    ( request, response ) => {

        const { errors, isValid } = validateExperienceInput(request.body);

        if( !isValid ) {
            return response.status(400).json(errors);
        }

        Profile
            .findOne({
                user: request.user.id
            })
            .then( profile => {
                const newExp = {
                    title: request.body.title,
                    company: request.body.company,
                    location: request.body.location,
                    from: request.body.from,
                    to: request.body.to,
                    current: request.body.current,
                    description: request.body.description
                };

                // Add to experience array
                profile.experience.unshift(newExp);
                profile.save().then(profile => {
                    return response.json(profile);
                });
            })
            .catch( e => {
                console.log('this is an error from experience path ', e );
            });
    }
);

//  @route  POST api/profile/education
//  @desc   Add education to Profile
//  @access Private

router.post(
    '/education', 
    passport.authenticate('jwt', {
        session: false
    }), 
    (request, response) => {

        const { errors, isValid } = validateEducationInput(request.body);

        if( !isValid ) {
            return response.status(400).json(errors);
        }

        Profile
            .findOne({
                user: request.user.id
            })
            .then( profile => {

                const newEdu = {
                    school: request.body.school,
                    degree: request.body.degree,
                    fieldofstudy: request.body.fieldofstudy,
                    from: request.body.from,
                    to: request.body.to,
                    current: request.body.current,
                    description: request.body.description
                };

                // Add to experience array
                profile.education.unshift(newEdu);

                // Save
                profile.save().then( profile => {
                    return response.json( profile );
                });
                
            })
            .catch( e => {
                console.log( 'this is an error from education path ', e );
            });
});

//  @route  DELETE api/profile/experience/:exp_id
//  @desc   Delete experience from Profile
//  @access Private

router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', {
        session: false
    }),
    (request, response ) => {
        Profile.findOne({
            user: request.user.id
        })
        .then( profile => {
            const removeIndex = profile.experience
                .map( item => item.id )
                .indexOf( request.params.exp_id );

            // SPlice out of array

            profile.experience
                .splice( removeIndex, 1 );

            // Save 
            profile.save()
                .then( profile => {
                    return response.json(profile);
                });
        });
    }
);

//  @route  DELETE api/profile/education/:edu_id
//  @desc   Delete education from Profile
//  @access Private

router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', {
        session: false
    }),
    ( request, response ) => {
        Profile.findOne({
            user: request.user.id
        })
        .then( profile => {
            const removeIndex = profile.education
                .map( item => item.id )
                .indexOf( request.params.edu_id );

            // SPlice out of array

            profile.education
                .splice( removeIndex, 1 );

            // Save 
            profile.save()
                .then( profile => {
                    return response.json( profile );
                });
        });
    }
);

//  @route  DELETE api/profile
//  @desc   Delete user and profile
//  @access Private

router.delete(
    '/',
    passport.authenticate('jwt', {
        session: false
    }),
    ( request, response ) => {

        Profile.findOneAndRemove({
            user: request.user.id
        })
        .then( () => {
            User.findOneAndRemove({ _id: request.user.id })
            .then( () => {
                response.json({
                    success: true
                });
            })
            .catch( e => {
                console.log( e );
            });
        })
        .catch( e => {
            console.log( e );
        });
        
    }
);



module.exports = router;