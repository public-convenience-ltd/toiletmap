var _ = require('lodash')

module.exports = function (opts) {
  var defaults = opts || {}
  return function * (next) {
    var links
    var ctx = this
    // Apply pagination settings to the context
    this.paginate = {options: _.merge(defaults, _.pick(this.query, 'page', 'perPage', 'offset'))}
    yield next
    // Discover if the response has been paginated
    if (this.paginate.next || this.paginate.prev) {
      links = _.pick(this.paginate, 'current', 'first', 'last', 'prev', 'next')
      links = _.map(links, function (page, rel) {
        if (page) {
          return _.template(
            '<${protocol}://${host}${path}?page=${page}&perPage=${perPage}&offset=${offset}>; rel="${rel}"',
            {
              protocol: ctx.request.protocol,
              host: ctx.request.host,
              path: ctx.request.path,
              page: page,
              perPage: ctx.paginate.options.perPage,
              offset: ctx.paginate.options.offset,
              rel: rel
            }
          )
        }
      })
      ctx.response.set('Link', _.compact(links).join(','))
      ctx.response.set('Total-Count', this.paginate.count)
    }

    if (this.paginate) {
      ctx.response.set('Total-Count', this.paginate.count || 0)
    }
  }
}
