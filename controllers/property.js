const Property = require('../models/propertyModels');

const getAllProperties = async (req , res) => {
    try {
        const page = 1; // can be taken as query parameter or in req.body from the frontend
        const limit = 10; // Number of documents per page
    
        const offset = (page - 1) * limit;
    
        // Query roles with pagination
        const properties = await Property.findAndCountAll({
          limit: limit,
          offset: offset
        });
    
        const totalPages = Math.ceil(properties.count / limit);

        return res.status(200).json({
            status: true,
            content: {
              meta: {
                total: properties.count,
                pages: totalPages,
                page: page
              },
              data: properties
            }
          });
         
    } catch (error) {
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    }
}

const  getPropertyById = async (req , res) => {
    try {
        const property = await Property.findOne({where : {id : req.params.id}});
        if(!property) return res.status(500).json({
            "status" : false,
            "error" : `No property Found with id : ${req.params.id}`
        })
        return res.status(200).json({
            status: true,
            content: {
              data: property
            }
          });
    } catch (error) {
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    }
}

const createNewProperty = async (req , res) => {
    try {
        const loggedUser = req.user;
        const {location, rooms , cost} = req.body; // property status would be available eventually since user is creating it

        const existingProperty = await Property.findOne({where : {location , rooms , cost , owner : loggedUser.id , property_status : 'available'}});
      if(existingProperty) return res.status(400).json({
        "status": false,
        "errors": [
          {
            "message": "Property already exists",
            "code": "RESOURCE_EXISTS"
          }
        ]
      })
        
       if(loggedUser.role !== 'property_owner'){
        return res.status(400).json({
            "status": false,
            "errors": [
              {
                "message": "Only Property Owners can create a new Property",
                "code": "AUTHORIZATION_FAILED"
              }
            ]
          })
       }

        const newProperty = await Property.create({
            location,
            rooms,
            cost,
            owner : loggedUser.id,
            property_status : 'available'
        })

        return res.status(200).json({
            "status": true,
            "content": {
              "data": {
                "id": newProperty.id,
                "location": newProperty.location,
                "rooms": newProperty.rooms,
                "cost": newProperty.cost,
                "owner" : newProperty.owner,
                "property_status" : newProperty.property_status
              }
            }
          })

    } catch (error) {
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    }
}

const updateProperty= async (req , res) => {
    try {
        const {location , rooms , cost, property_status} = req.body;

        let property = await Property.findOne({where : {id : req.params.id}});
        if(!property) return res.status(500).json({
            "status" : false,
            "error" : `No property Found with id : ${req.params.id}`
        }) 

        const loggedUser = req.user;
        if(loggedUser.role !== 'property_owner' || property.dataValues.owner !== loggedUser.id)  return res.status(400).json({
            "status": false,
            "errors": [
              {
                "message": "Only Property Owners can update their Property",
                "code": "AUTHORIZATION_FAILED"
              }
            ]
          })

        property = await Property.update({
            location : location,
            rooms : rooms, 
            cost : cost,
            property_status : property_status
        }, {where : {id : req.params.id}})

        return res.status(200).json({
            "status": true,
            "message" : "Updated Successfully",
            "property" : property
          })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    }
}

const deleteProperty = async (req , res) => {
    try {
      const property_id = req.params.id;
      let property = await Property.findOne({where : {id : property_id}});
      const loggedUser = req.user;
      
      if(loggedUser.role !== 'property_owner' || property.dataValues.owner !== loggedUser.id)  return res.status(400).json({
        "status": false,
        "errors": [
          {
            "message": "Only Property Owners can delete their Property",
            "code": "AUTHORIZATION_FAILED"
          }
        ]
      })
      
      await property.destroy();

      return res.status(200).json({
        "status": true,
        "message" : "Deleted Successfully",
      })

    } catch (error) {
        return res.status(500).json({
            "status" : false,
            "error" : error.message
        })
    }
}

module.exports = {
    getAllProperties,
    getPropertyById,
    createNewProperty,
    updateProperty,
    deleteProperty
}