//Current cache
var cacheName = 'chache1'; 

//Files to cache
var cacheFiles = [
	'/',
	'./index.html',
  	'./restaurant.html',
    './js',
	'./css',
	'./img',
	'./data'	
];

self.addEventListener('install', function(e) {
    console.log('ServiceWorker installed');

    e.waitUntil(
		//Open cache and add files to cache
	    caches.open(cacheName).then(function(cache) {
			console.log('ServiceWorker caching cache');
			return cache.addAll(cacheFiles);
	    })
	);
});


self.addEventListener('activate', function(e) {
    console.log('ServiceWorker activated');

    e.waitUntil(
		//Get cache keys and delete cached file that was saved under a previous cache name(if there is)
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {
				if (thisCacheName !== cacheName) {
					console.log('ServiceWorker removing cached files from cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	); 
});


self.addEventListener('fetch', function(e) {
	console.log('ServiceWorker fetch', e.request.url);

	e.respondWith(
		//Checks in cache for the req
		caches.match(e.request)
			.then(function(response) {
				//If req is in cache - return it
				if ( response ) {
					console.log("ServiceWorker found in cache", e.request.url, response);
					return response;
				}

				//If there is no req in cache - fetch it and cache
				var requestClone = e.request.clone();
				return fetch(requestClone)
					.then(function(response) {
						if ( !response ) {
							console.log("ServiceWorker got no response from fetch ")
							return response;
						}

						var responseClone = response.clone();

						caches.open(cacheName).then(function(cache) {
							cache.put(e.request, responseClone);
							console.log('ServiceWorker cached new data', e.request.url);
							return response;
				        }); 

					})
					.catch(function(err) {
						console.log('Error fetching and caching new data', err);
					});
			}) 
	); 
});