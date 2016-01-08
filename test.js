var unpack = require('./unpacker');
var async = require('async');
var fs = require('fs');
var _ = require('underscore');
var moment = require('./moment');
/**
 * 读取文件列表
 */
var walk = function(path, callback) {
	var fileList = [];
	var dirList = fs.readdirSync(path);
	console.log('要处理的股票个数：' + dirList.length + '个');
	dirList.forEach(function(item) {
		if (fs.statSync(path + '/' + item).isFile()) {
			fileList.push( path + '/' + item);
		}
	});

	dirList.forEach(function(item) {
		if (fs.statSync(path + '/' + item).isDirectory()) {
			walk(path + '/' + item);
		}
	});
	//console.log('要处理的股票：' + fileList );
	callback(fileList);
};

exports.startDayMission = function() {
	var path = 'C:/TdxW_HuaTai/vipdoc/sh/lday';
	walk(path, function(fileList) {
		dealDayKline(fileList);
	});
};

/**
 * 日K处理逻辑
 */
var dealDayKline = function(fileList) {
	//var worker = new Worker(60);
	//worker.setTask(fileList);
	async.forEach(fileList, function(item, cb) {
			get60Results(item, cb);// 解析日K文件

		}, function(err){
	    // if any of the saves produced an error, err would equal that error
	});
	// var q = async.queue(function(item, cb) {
	// 	console.log('finished processing item:'+item.item);

	// 	get60Results(item, cb);// 解析日K文件

	// }, 2);
	// q.push(fileList, function (err) {
	// 	    console.log('finished processing item');
	// });
};
/**
 * 工作队列
 */
var Worker = function(type, key) {
	this.type = type;
	var self = this;
	this.q = async.queue(function(item, cb) {
		console.log('finished processing item:'+item.item);
		if (type == 5) {
			get5Results(item.item, cb);// 解析5分钟文件
		} else if (type == 1) {
			pushData(key, item.item.join('|'), cb);// 存储15 30 60分钟k线
		} else if (type == 60) {
			get60Results(item.item, cb);// 解析日K文件
		}
	}, 1);
	this.setTask = function(array) {
		self.q.push(array, function (err) {
		    console.log('finished processing item');
		});
		// for ( var i in array) {
		// 	self.q.push({
		// 		'item' : array[i]
		// 	}, function(err) {
		// 		if (err) {
		// 			console.log(getException(err));
		// 		}
		// 	});
		// 	//console.log(array[i]);
		// }
	};
};
/**
 * 获取日K数据
 */
var get60Results = function(item, cb) {
	var data = fs.readFileSync(item);
	var temp = item.split('/');
	var key = temp[temp.length - 1];
	var preffix = key.substring(0, 2);
	var code = key.substring(2, 8);
	key = 'TDX.KLINE.' + preffix.toLocaleUpperCase() + code + '.DAY';
	var result = unpack.unpackDayKline(data);
	try {
		//console.log(code);
		//setDayDataToRedis(result, key, cb);
		if(code == '600036')
		console.log(result);
	} catch (ee) {
		console.log(ee);
	}
};
Date.prototype.toString = function() {
	var year = this.getFullYear();
	var month = parseFloat(this.getMonth()) + 1;
	if (parseFloat(month) < 10)
		month = '0' + month;
	var day = this.getDate();
	if (parseFloat(day) < 10) {
		day = '0' + day;
	}
	return year + '' + month + '' + day;
}
Date.prototype.add = function(days, pattern) {
	var temp = moment(this).add('days', days)._d;
	temp = temp.toString();
	return pattern.replace(/yyyy/g, temp.substring(0, 4)).replace(/MM/g,
			temp.substring(4, 6)).replace(/dd/g, temp.substring(6, 8));
};
Date.prototype.format = function(pattern) {
	var date = this;
	var year4 = date.getFullYear();
	var year2 = year4.toString().substring(2);
	pattern = pattern.replace(/yyyy/, year4);
	pattern = pattern.replace(/yy/, year2);

	var month = date.getMonth();
	month = month + 1;
	month = pad(month);
	pattern = pattern.replace(/MM/, month);

	var dayOfMonth = date.getDate();
	var dayOfMonth2 = pad(dayOfMonth);
	pattern = pattern.replace(/dd/, dayOfMonth2);
	pattern = pattern.replace(/d/, dayOfMonth);

	var hours = date.getHours();
	var hours2 = pad(hours);
	pattern = pattern.replace(/HH/, hours2);
	pattern = pattern.replace(/H/, hours);

	var minutes = date.getMinutes();
	var minutes2 = pad(minutes);
	pattern = pattern.replace(/mm/, minutes2);
	pattern = pattern.replace(/m/, minutes);

	var seconds = date.getSeconds();
	var seconds2 = pad(seconds);
	pattern = pattern.replace(/ss/, seconds2);
	pattern = pattern.replace(/s/, seconds);

	var milliSeconds = date.getMilliseconds();
	pattern = pattern.replace(/S+/, milliSeconds);
	var day = date.getDay();
	var kHours = hours;
	if (kHours == 0) {
		kHours = 24;
	}
	var kHours2 = pad(kHours);
	pattern = pattern.replace(/kk/, kHours2);
	pattern = pattern.replace(/k/, kHours);
	var KHours = hours;
	if (hours > 11) {
		KHours = hours - 12;
	}
	var KHours2 = pad(KHours);
	pattern = pattern.replace(/KK/, KHours2);
	pattern = pattern.replace(/K/, KHours);
	var hHours = KHours;
	if (hHours == 0) {
		hHours = 12;
	}
	var hHours2 = pad(hHours);
	pattern = pattern.replace(/hh/, hHours2);
	pattern = pattern.replace(/h/, hHours);
	return pattern;
}

exports.startDayMission();
