export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Redirect old WordPress /product-category/:slug → /shop/:slug
  const categoryMatch = path.match(/^\/product-category\/([^/]+)\/?$/)
  if (categoryMatch) {
    return sendRedirect(event, `/shop/${categoryMatch[1]}`, 301)
  }

  // Remove trailing slashes (except root / and /admin, /api — nginx owns
  // trailing-slash handling there via `location /admin {}` / `location /api {}`;
  // stripping it here would fight nginx's own redirect and loop forever)
  const ownedByNginx = path === '/admin' || path.startsWith('/admin/') || path === '/api' || path.startsWith('/api/')
  if (path !== '/' && path.endsWith('/') && !ownedByNginx) {
    return sendRedirect(event, path.slice(0, -1) + url.search, 301)
  }
})
