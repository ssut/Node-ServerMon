var fs = require('fs'),
	vm = require('vm'),
	io = require('socket.io'),
	winston = require('winston'),
	spawn = require('child_process').spawn;

var argv = require('optimist')
			.default('port', 5567).alias('p', 'port').describe('p', 'Socket.io listen port (default 5567)')
			.boolean('debug', false).alias('d', 'debug').describe('d', 'Debug mode (default false)')
			.argv;

winston.loggers.add('logger', {
	console: {
		level: 'silly',
		colorize: 'true',
		label: 'logger'
	}
});

var logger = winston.loggers.get('logger');
global.logger = logger;

var include = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

try {
	var io = io.listen(parseInt(argv.port));
	io.set('log level', 0);
	logger.info('Socket.io server running (port ' + argv.port + ')');
} catch (Exception) {
	logger.info('Cannot start Socket.io server. The port(' + argv.port + ') has been opened another application.');
	process.exit();
};

include(__dirname + '/function.js');
include(__dirname + '/php.js');

var com = spawn('dstat', ['-c', '-d', '-n', '-m', '-f', '--nocolor']); // CPU, DISK, NETWORK AND FULL-LOG
var headerGroup = [];
var subGroup = [];

com.stdout.on('data', function(data) {
	var content = new Buffer(data).toString('utf8', 0, data.length);
	var contentn = content.split('\n');
	var result = {};
	
	if(headerGroup.length == 0) {
		var hGroup = contentn[0].split(' ');
		hGroup.forEach(function(text) {
			headerGroup.push(nameFilter.text(nameFilter.regex(text)));
		});
		
		var sGroup = contentn[1].split(/\:|\|/);
		sGroup.forEach(function(text0) {
			var itemGroup = text0.split(' '),
				tmpGroup = [];
			
			itemGroup.forEach(function(text1) {
				if(text1 != '') tmpGroup.push(text1);
			});
			
			subGroup.push(tmpGroup);
		});
		
		return;
	}
	
	var groups = contentn[0].split(/\:|\|/);
	groups.forEach(function(group, index) {
		var itemGroup = group.split(' '),
			tmpDict = {};
		
		itemGroup = nameFilter.calcBytes(nameFilter.removeBlankInArray(itemGroup));
		itemGroup.forEach(function(item, itemIndex) {
			tmpDict[subGroup[index][itemIndex]] = item;
		});
		
		result[headerGroup[index]] = tmpDict;
	});
	
	var result = JSON.stringify(result);
	if(argv.debug) logger.info(result);
	io.sockets.send(result);
});
