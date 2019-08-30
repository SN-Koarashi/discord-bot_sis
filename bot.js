const config = require("./config.json");
const Discord = require('discord.js');
const mysql = require("mysql");

var bot = new Discord.Client();
var db = mysql.createConnection({
    host: config.mysqlHost,
    user: config.mysqlUser,
    password: config.mysqlPass,
    database: config.mysqlDB,
	charset: "utf8_unicode_ci"
});
bot.on('ready', () => {
  console.log("Discord Bot is starting on "+config.version);
});

// Create an event listener for messages
bot.on('message', message => {
  if (message.channel.type != 'text') return;
  if (message.content === '~getid') {
	message.author.send("Your ID: "+message.member.id);
  }
  if (message.content === '~help') {
    message.channel.send("Welcome to our Sign System!\nIf you cannot create account, please type `~create` to do it.\nView your sign in days `~check`\nSign in `~sign`\n\n"+config.version);
  }
  if (message.content === '~check') {
			var id = message.member.id;
			db.query("SELECT date,day FROM discord WHERE dis_id='"+id+"'",[],function(err,rows){
				var obj = JSON.stringify(rows);
				var obj = JSON.parse(obj);
				if(obj[0] == null){
					console.log('[INFO] CheckDB: '+id+' not create a account');
					message.reply('You have not create account.');
					return false;
				}
				else{
					console.log('[INFO] CheckDB: '+id+' check sign in day on '+obj[0].day+' days, last sign in date: '+obj[0].date);
					message.reply('Sign in Information\nSign in Total: '+obj[0].day+' days\nLast Sign in Date: '+obj[0].date);
				}
			});
  }
  if (message.content === '~create') {
			var id = message.member.id;
			var date = new Date();
			var year = date.getFullYear()
			var month = ('0'+(date.getMonth()*1+1)).substr(-2);
			var day = ('0'+(date.getDate()*1-1)).substr(-2);
			var now = year+'-'+month+'-'+day;
			db.query("INSERT INTO discord VALUES(NULL,'"+id+"','0','"+now+"')",[],function(err,rows){
				var msg = JSON.stringify(err);
				if(msg != 'null'){
					var obj = JSON.parse(msg);
					console.log('[WARN] Create faild: '+id+'('+obj.errno+')');
					message.reply('You already have account.');
					return false;
				}
				console.log('[INFO] Success create at:'+id);
				message.reply('Account create successfuly!');
			});
  }
  if (message.content === '~sign') {
			var id = message.member.id;
			var date = new Date();
			var year = date.getFullYear()
			var month = ('0'+(date.getMonth()*1+1)).substr(-2);
			var day = ('0'+date.getDate()).substr(-2);
			var now = year+'-'+month+'-'+day;
			db.query("SELECT date,day FROM discord WHERE dis_id='"+id+"'",[],function(err,rows){
				var obj = JSON.stringify(rows);
				var obj = JSON.parse(obj);
				if(obj[0] == null){
					console.log('[INFO] UpdateDB: '+id+' not create a account');
					message.reply('You have not create account.');
					return false;
				}
				else{
					if(obj[0].date == now){
						console.log('[INFO] UpdateDB: '+id+' sign in failed');
						message.reply('You already have sign in today.');
						return false;
					}
					else{
						db.query("UPDATE discord SET day='"+(obj[0].day*1+1)+"',date='"+now+"' WHERE dis_id='"+id+"'",[],function(err,rows){
							console.log('[INFO] UpdateDB: '+id+' sign in '+(obj[0].day*1+1)+' days successfuly');
							message.reply('Sign in successfuly! You has been signed in '+(obj[0].day*1+1)+' days.');
							return false;
						});
					}
				}
			});
  }
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
bot.login(config.token);
