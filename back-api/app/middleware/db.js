const {
  buildSuccObject,
  buildErrObject,
  itemNotFound
} = require('../middleware/utils')

/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  return sortBy
}

/**
 * Hack for mongoose-paginate, removes 'id' from results
 * @param {Object} result - result object
 */
const cleanPaginationID = (result) => {
  result.docs.map((element) => delete element.id)
  return result
}

/**
 * Builds initial options for query
 * @param {Object} query - query object
 */
const listInitOptions = async (req) => {
  return new Promise((resolve) => {
    const order = req.query.order || -1
    const sort = req.query.sort || 'createdAt'
    const sortBy = buildSort(sort, order)
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 15
    const options = {
      sort: sortBy,
      lean: true,
      page,
      limit
    }
    resolve(options)
  })
}

module.exports = {
  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    return new Promise((resolve, reject) => {
      try {
        if (
          typeof query.filter !== 'undefined' &&
          typeof query.fields !== 'undefined'
        ) {
          const data = {
            $or: []
          }
          const array = []
          // Takes fields param and builds an array by splitting with ','
          const arrayFields = query.fields.split(',')
          // Adds SQL Like %word% with regex
          arrayFields.map((item) => {
            array.push({
              [item]: {
                $regex: new RegExp(query.filter, 'i')
              }
            })
          })
          // Puts array result in data
          data.$or = array
          resolve(data)
        } else {
          resolve({})
        }
      } catch (err) {
        console.log(err.message)
        reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getItems(req, model, query) {
    const options = await listInitOptions(req)
    const tenant = req.clientAccount;
    return new Promise((resolve, reject) => {
      model.byTenant(tenant).paginate(query, options, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(cleanPaginationID(items))
      })
    })
  },

  /**
   * Gets item from database by id
   * @param {string} id - item id
   * @param model
   * @param tenant
   */
  async getItem(id, model, tenant = null) {
    return new Promise((resolve, reject) => {
      model.byTenant(tenant).findById(id, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
    })
  },

  /**
   * Creates a new item in database
   * @param {Object} req - request object
   * @param model
   * @param tenant
   */
  async createItem(req, model, tenant = null) {
    return new Promise((resolve, reject) => {
      model.byTenant(tenant)
        .create(req, (err, item) => {
          if (err) {
            reject(buildErrObject(422, err.message))
          }
          resolve(item)
        })
    })
  },

  /**
   * Updates an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItem(id, model, req, tenant = null) {
    return new Promise((resolve, reject) => {
      model
        .byTenant(tenant)
        .findByIdAndUpdate(
          id,
          req,
          {
            new: true,
            runValidators: true
          },
          (err, item) => {
            itemNotFound(err, item, reject, 'NOT_FOUND')
            resolve(item)
          }
        )
    })
  },

  /**
   * Deletes an item from database by id
   * @param {string} id - id of item
   * @param model
   * @param tenant
   */
  async deleteItem(id, model, tenant = null) {
    return new Promise((resolve, reject) => {
      model
        .byTenant(tenant)
        .findByIdAndRemove(id, (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(buildSuccObject('DELETED'))
        })
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param model
   * @param aggregate
   * @param tenant
   */
  async getItemsAggregate(req, model, aggregate, tenant = null) {
    const options = await listInitOptions(req)
    return new Promise((resolve, reject) => {
      model.byTenant(tenant).aggregatePaginate(aggregate, options, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(cleanPaginationID(items))
      })
    })
  }
}
