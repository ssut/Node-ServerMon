var nameFilter = {};
nameFilter.text = nameFilter.prototype = function(text) {
	text = new String(text).replace(/--/g, '');
	
	while(substr(text, 0, 1) == '-') text = substr(text, 1);
	while(substr(text, -1) == '-') text = substr(text, 0, -1);
	
	return text;
};

nameFilter.regex = nameFilter.prototype = function(text) {
	var regex = /-([a-zA-Z0-9-_\/]+)-/;
	
	if(text.match(regex) == null)
		return null;
	else
		return regex.exec(text)[0];
};

nameFilter.removeBlankInArray = nameFilter.prototype = function(arr) {
	return arr.filter(function(t) {
		return t == '' ? false : true;
	});
};

nameFilter.calcBytes = nameFilter.prototype = function(arr) {
	var newArr = [];
	
	arr.forEach(function(value) {
		var lastChar = substr(value, -1),
			d = parseInt(value);
		
		if(lastChar == 'B') d = parseInt(value);
		else if(lastChar == 'k') d = parseInt(value) * 1024;
		else if(lastChar == 'M') d = parseInt(value) * 1024 * 1024;
		else if(lastChar == 'G') d = parseInt(value) * 1024 * 1024 * 1024;
		else if(lastChar == 'T') d = parseInt(value) * 1024 * 1024 * 1024 * 1024;
		
		newArr.push(d);
	});
	
	return newArr;
};
