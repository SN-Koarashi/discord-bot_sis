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
  if (message.channel.type != 'text') {
        return;
  }
  if (message.content === '~getid') {
	message.author.send("你的用戶ID: "+message.member.id);
  }
  if (message.content === '~help') {
    message.channel.send("歡迎使用天夜之心Discord簽到系統\n若您還未建立帳戶 輸入 `~create` 建立您的帳戶\n查看簽到天數請輸入 `~check`\n進行簽到請輸入 `~sign`\n\n"+config.version);
  }
  if (message.content === '~check') {
			var id = message.member.id;
			db.query("SELECT date,day FROM discord WHERE dis_id='"+id+"'",[],function(err,rows){
				var obj = JSON.stringify(rows);
				var obj = JSON.parse(obj);
				if(obj[0] == null){
					console.log('[INFO] CheckDB: '+id+' not create a account');
					message.reply('尚未建立帳戶');
					return false;
				}
				else{
					console.log('[INFO] CheckDB: '+id+' check sign in day on '+obj[0].day+' days, last sign in date: '+obj[0].date);
					message.reply('您已經簽到 '+obj[0].day+' 天，上次簽到日期是 '+obj[0].date);
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
					message.reply('你已經建立帳號了');
					return false;
				}
				console.log('[INFO] Success create at:'+id);
				message.reply('帳戶建立成功!');
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
					message.reply('尚未建立帳戶');
					return false;
				}
				else{
					if(obj[0].date == now){
						console.log('[INFO] UpdateDB: '+id+' sign in failed');
						message.reply('今天已經簽到過了');
						return false;
					}
					else{
						db.query("UPDATE discord SET day='"+(obj[0].day*1+1)+"',date='"+now+"' WHERE dis_id='"+id+"'",[],function(err,rows){
							console.log('[INFO] UpdateDB: '+id+' sign in '+(obj[0].day*1+1)+' days successfuly');
							message.reply('簽到成功,您已經簽到 '+(obj[0].day*1+1)+' 天');
							return false;
						});
					}
				}
			});
  }
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
bot.login(config.token);
