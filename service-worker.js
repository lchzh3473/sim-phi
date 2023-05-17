self.addEventListener('install', function() {});
self.addEventListener('fetch', (event) => {
  /**@type {Request} */
  const request = event.request;
  // Let the browser do its default thing
  // for non-GET requests.
  if (request.method !== 'GET') return;
  if (request.url.includes('music.163.com')) return;
  // Prevent the default, and handle the request ourselves.
  event.respondWith(qwq(event));
});
async function qwq(event) {
  /**@type {Request} */
  const request = event.request;
  // Try to get the response from a cache.
  const cache = await caches.open('qwq');
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // If we found a match in the cache, return it, but also
    // update the entry in the cache in the background.
    event.waitUntil(cache.add(request).catch(() => {}));
    return cachedResponse;
  } else {
    // If we didn't find a match in the cache, use the network.
    const response = await fetch(request).catch(function() {
      return new Response('', { status: 521, statusText: 'Web Server Is Down' });
    });
    const reg = /unpkg|data|jsdelivr|baomitu|googleapis|loli|res\.phi\.zone/;
    if (response.ok && reg.test(request.url)) event.waitUntil(cache.put(request, response.clone()));
    return response;
  }
}