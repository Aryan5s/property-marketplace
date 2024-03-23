require('dotenv').config();
const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {validateName , validateEmail , validatePassword, validateMobile} = require('../utils/validator');

const signup = async (req , res) => {
    try {
        const {name , email , password, mobile, role} = req.body;

        const existingUser =  await User.findOne({ where: { email } });
        if(existingUser) {
            const errors = [
                {
                  "param": "email",
                  "message": "User with this email address already exists.",
                  "code": "RESOURCE_EXISTS"
                }
              ]
              return res.status(400).json({
                "status" : false,
                "errors" : errors
              })
        }

        if (!validateName(name)) {
            return res
              .status(400).json({
                "status" : false,
                "errors" : [
                    {"param" : "name" ,  "message": "Name should be at least 2 characters.",
                    "code": "INVALID_INPUT"}
                ]
              })
          }
      
          if (!validateEmail(email)) {
            return res
            .status(400).json({
              "status" : false,
              "errors" : [
                  {"param" : "email" ,  "message": "Invalid Email",
                  "code": "INVALID_INPUT"}
              ]
            })
          }
      
          if (!validatePassword(password)) {
            return res
              .status(400).json({
                "status" : false,
                "errors" : [
                    {"param" : "password" ,  "message": "Password do not match the criteria",
                    "code": "INVALID_INPUT"}
                ]
              })
          }

          if (!validateMobile(mobile)) {
            return res
              .status(400).json({
                "status" : false,
                "errors" : [
                    {"param" : "mobile" ,
                    "message": "Mobile Number not valid",
                    "code": "INVALID_INPUT"}
                ]
              })
          }

          if (role !== 'property_owner' && role !== 'buyer') {
            return res.status(400).json({
                "status": false,
                "errors": [
                  {
                    "param": "role",
                    "message": "Invalid role. Valid roles are 'property_owner' or 'buyer'.",
                    "code": "INVALID_INPUT"
                  }
                ]
              });
          }

          const hashedPassword = await bcrypt.hash(password, (saltOrRounds = 10)); //* hashes the password with a salt, generated with the specified number of rounds

          const userDetails = {
            name,
            email,
            password: hashedPassword,
            mobile,
            role
          };
      
          const newUser = await User.create(userDetails);
          const payload = { user: { id: newUser.id } };
          const bearerToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: 360000,
          });
      
          res.cookie("t", bearerToken, { expire: new Date() + 9999 });

          return res.status(200).json({
            "status" : true,
            "content" : {
                "data" : {
                  "id" : newUser.id,
                  "name" : newUser.name,
                  "email" : newUser.email,
                  "created_at" : newUser.created_at
                }
            },
            "meta" : {
                "access_token" : bearerToken
            }
          })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    } 
}

const signin = async (req , res) => {
 try {
    const {email , password} = req.body;

    if (!validateEmail(email)) {
        return res
        .status(400).json({
          "status" : false,
          "errors" : [
              {"param" : "email" ,
              "message": "Please provide a valid email address.",
              "code": "INVALID_INPUT"}
          ]
        })
      }
  
      if (!validatePassword(password)) {
        return res
          .status(400).json({
            "status" : false,
            "errors" : [
                {
                    "param": "password",
                    "message": "Please provide a valid password according to the criteria",
                    "code": "INVALID_INPUT"
                  }
            ]
          })
      }

      const existingUser =  await User.findOne({ where: { email } });
      if(!existingUser){
       
            return res.status(404).json({
                status: 'false',
                message: 'User not found'
            });
        
      }

       const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );

      if(!isPasswordCorrect){
       return res.status(500).json({
        "status" : false,
        "errors": [
            {
              "param": "password",
              "message": "The credentials you provided are invalid.",
              "code": "INVALID_CREDENTIALS"
            }
          ]
       })
      }

      const payload = { user: { id: existingUser.id } };
      const bearerToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: 360000,
      });
  
      res.cookie("t", bearerToken, { expire: new Date() + 9999 });
  
      return res.status(200).json({
        "status" : true,
        "content" : {
            "data" : {
              "id" : existingUser.id,
              "name" : existingUser.name,
              "email" : existingUser.email,
              "created_at" : existingUser.created_at
            }
        },
        "meta" : {
            "access_token" : bearerToken
        }
      })
 } catch (error) {
    return res.status(500).json({
        "status" : false,
        "error" : error.message
    })
 }
}

const logout = async(req , res) => {
    try {
        res.status(200)
        .clearCookie("t", {
            httpOnly: true,
            sameSite: 'None',
            maxAge: 0
        }).json({
            status: 'success',
            message: 'User logged out'
        });
    } catch (error) {
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    }
}

module.exports = {signup , signin , logout};