//
const staticCacheName = 'site-static-v3'
const dynamicCacheName = 'site-dynamic-v1'

const assets = [
	'./',
	'./index.html',
	'./js/app.js',
	'./js/ui.js',
	'./js/materialize.min.js',
	'./css/styles.css',
	'./css/materialize.min.css',
	'./img/dish.png',
	'./img/logo.png',
	'./pages/fallback.html'
]
//limit
const limitCacheSize = (cacheName, numberOfAllowedFiles) => {
	caches.open(cacheName).then(cache => {
		cache.keys().then(keys => {
			if(keys.length > numberOfAllowedFiles) {
				cache.delete(keys[0]).then(limitCacheSize(cacheName, numberOfAllowedFiles))
			}
		})
	})
}

// install service worker
self.addEventListener('install', event => {
	//console.log('service worker has been installed');

	event.waitUntil(
		caches.open(staticCacheName).then(cache => {
			//console.log('cahing all assets');
			cache.addAll(assets)
		})
	)
})

// activate service worker
self.addEventListener('activate', event => {
	console.log('service worker has been activated');
	event.waitUntil(
		caches.keys().then(keys => {
			//returns promise array and deletes old versions of caches
			return Promise.all(keys
				.filter(key => key !== staticCacheName && key !== dynamicCacheName)
				.map(key => caches.delete(key)))
		})
		)
		return
	})

// fetch 
self.addEventListener("fetch", (event) => {
	limitCacheSize(dynamicCacheName, 2);
  
	if (!(event.request.url.indexOf("http") === 0)) return;
	event.respondWith(
	  caches
		.match(event.request)
		.then((cacheRes) => {
		  return (
			cacheRes ||
			fetch(event.request).then((fetchRes) => {
			  return caches.open(dynamicCacheName).then((cache) => {
				cache.put(event.request.url, fetchRes.clone())
				limitCacheSize(dynamicCacheName, 2)
				return fetchRes
			  });
			})
		  );
		})
		.catch(() => {
			if(event.request.url.indexOf('.html') > -1) {
				return caches.match('pages/fallback.html')
			}
		}
	)
)})




