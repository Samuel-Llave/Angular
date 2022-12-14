const controller = require('../controllers/products')
const validate = require('../controllers/products.validate')
const AuthController = require('../controllers/auth')
const origin = require('../middleware/origin')
const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Cities routes
 */

/*
 * Get all items route
 */
// router.get('/all', controller.getAllItems)

/*
 * Get items route
 */
router.get(
  '/',
  origin.checkDomain,
  origin.checkTenant,
  requireAuth,
  AuthController.roleAuthorization(['customer', 'admin', 'manager', 'seller', 'user']),
  trimRequest.all,
  controller.getItems
)

/*
 * Create new item route
 */
router.post(
  '/',
  origin.checkDomain,
  origin.checkTenant,
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)

/*
 * Get item route
 */
router.get(
  '/:id',
  origin.checkDomain,
  origin.checkTenant,
  requireAuth,
  AuthController.roleAuthorization(['customer', 'admin', 'manager', 'seller', 'user']),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  origin.checkDomain,
  origin.checkTenant,
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  origin.checkDomain,
  origin.checkTenant,
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
