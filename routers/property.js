const express = require('express');
const router = express.Router();
const {getAllProperties,
     getPropertyById, 
     createNewProperty, 
     updateProperty,
     deleteProperty} = require('../controllers/property');
const isAuthenticated = require('../middlewares/auth');

router.get('/' , isAuthenticated , getAllProperties);
router.get('/:id' , isAuthenticated , getPropertyById);
router.post('/createProperty' , isAuthenticated , createNewProperty);
router.put('/update/:id', isAuthenticated , updateProperty);
router.delete('/:id' , isAuthenticated , deleteProperty);

module.exports = router;