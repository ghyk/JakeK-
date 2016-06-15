import Ember from 'ember';


var PhotoCollection = Ember.ArrayProxy.extend(Ember.SortableMixin, {
		sortProperties: ['title'],
		sortAscending: true,
		content: [],
});

export default Ember.Controller.extend ({
	photos: PhotoCollection.create(),
	searchField: '',
	tagList: ['hi','papajohn'],

	filteredPhotos: function () {
		var filter = this.get('searchField');
		var rx = new RegExp(filter, 'gi');
		var photos = this.get('photos');

		return photos.filter(function(photo){
			return photo.get('title').match(rx) || photo.get('username').match(rx);
		});
	}.property('photos.@each','searchField'),
	init: function(){
	this._super.apply(this, arguments);
	var apiKey = '828f7dd0ab21e6018c8da457ff4b1e4e';
	var host = 'https://api.flickr.com/services/rest/';
	var method = "flickr.tags.getHotList";
	var requestURL = host + "?method="+method + "&api_key="+apiKey+"&count=75&format=json&nojsoncallback=1";
	var t = this;
	Ember.$.getJSON(requestURL, function(data){
		//callback for successfully completed requests
		console.log(data);
		data.hottags.tag.map(function(tag) {
			t.get('tagList').pushObject(tag._content);
		});
	});
},
	actions: {
		search: function () {
				this.get('photos').content.clear();
				this.store.unloadAll('photo');
				this.send('getPhotos',this.get('tagSearchField'));

		},
		clicktag: function(tag){
			this.set('tagSearchField', tag);
			this.get('photos').content.clear();
			this.store.unloadAll('photo');
			this.send('getPhotos',tag);
		},
		
getPhotos: function(tag){
	var apiKey = '828f7dd0ab21e6018c8da457ff4b1e4e';
	var host = 'https://api.flickr.com/services/rest/';
	var method = "flickr.tags.getClusterPhotos";
	var requestURL = host + "?method="+method + "&api_key="+apiKey+"&tag="+tag+"&format=json&nojsoncallback=1";
	var photos = this.get('photos');
	var t = this;
	Ember.$.getJSON(requestURL, function(data){
		
		console.log(data);
		data.photos.photo.map(function(photo) {
			var newPhotoItem = t.store.createRecord('photo',{
				title: photo.title,
				username: photo.username,
				//flickr extra data
				owner: photo.owner,
				//flickr url data
				id: photo.id,
				farm: photo.farm,
				secret: photo.secret,
				server: photo.server,
			});
			photos.pushObject(newPhotoItem);
				});
			});
		}
	}
});