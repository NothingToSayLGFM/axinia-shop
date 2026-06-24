export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Redirect old WordPress /product-category/:slug → /shop/:slug
  const categoryMatch = path.match(/^\/product-category\/([^/]+)\/?$/)
  if (categoryMatch) {
    return sendRedirect(event, `/shop/${categoryMatch[1]}`, 301)
  }

  // Remove trailing slashes (except root /)
  if (path !== '/' && path.endsWith('/')) {
    return sendRedirect(event, path.slice(0, -1) + url.search, 301)
  }
})
