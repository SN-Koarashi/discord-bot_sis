const config = require("./config.json");
const {Client, Intents} = require('discord.js');
const mysql = require("mysql");

const myIntents = new Intents();
myIntents.add(
	Intents.FLAGS.GUILDS, 
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS
);
const bot = new Client({ intents: myIntents });

const db = mysql.createPool({
	connectionLimit: 10,
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
	database: config.mysql.database,
	charset: "utf8_unicode_ci"
});

bot.on('ready', () => {
  console.log(`Discord Bot Ready! ${config.version}`);
});

// Create an event listener for messages
bot.on('messageCreate', async message => {
  // Escape function if conditional establishment following
  const AccpetTypes = ['GUILD_TEXT','GUILD_NEWS','GUILD_PUBLIC_THREAD','GUILD_PRIVATE_THREAD'];
  if(AccpetTypes.indexOf(message.channel.type) < 0 || !message.content || message.author.bot) return;

  if (message.content === '!help') {
    message.channel.send("Welcome to our Sign System!\nIf you cannot create account, please type `!create` to do it.\nView your sign in days `!check`\nSign in `!sign`\n\n"+config.version);
  }
  if (message.content === '!check') {
		const id = message.member.id;
		try{
			var sql = await query("SELECT date,day FROM discord WHERE dis_id=?",[id]);
		}catch(err){
			console.log(`[ERROR] unexpected error ${err}`);
			return;
		}
		var row = sql[0];

		if(row == null){
			console.log(`[INFO] ${message.author.tag} have not create the account.`);
			message.reply({content: 'You have not create the account.'});
		}
		else{
			console.log(`[INFO] ${message.author.tag} has checked sign in information.`);
			message.reply({content: 'Sign in Information\nSign in Total: '+row.day+' days\nLast Sign in Date: '+row.date});
		}
  }
  if (message.content === '!create') {
		const id = message.member.id;
		let nowdate = getDateFormat();
		
		try{
			var result = await query("INSERT INTO discord VALUES(NULL,?,'0',?)",[id,nowdate]);
		}catch(err){
			console.log(`[ERROR] unexpected error ${err}`);
			return;
		}
		
		if(result.affectedRows){
			console.log(`[INFO] ${message.author.tag} has created the account.`);
			message.reply({content: 'The account has created!'});
		}
		else{
			console.log(`[WARN] ${message.author.tag} cannot create the account.`);
			message.reply({content: 'The account have not create.'});
		}
  }
  if (message.content === '!sign') {
		const id = message.member.id;
		try{
			var sql = await query("SELECT date,day FROM discord WHERE dis_id=?",[id]);
		}catch(err){
			console.log(`[ERROR] unexpected error ${err}`);
			return;
		}
		
		var row = sql[0];
		if(row == null){
			console.log(`[INFO] ${message.author.tag} have not create the account.`);
			message.reply({content: 'You have not create the account.'});
		}
		else{
			let nowdate = getDateFormat();
			if(nowdate == row.date){
				console.log(`[INFO] ${message.author.tag} has already signed in.`);
				message.reply({content: 'You has already signed in!'});
			}
			else{
				try{
					var result = await query("UPDATE discord SET day=?,date=? WHERE dis_id=?",[row.day*1+1,nowdate,id]);
				}catch(err){
					console.log(`[ERROR] unexpected error ${err}`);
					return;
				}
				
				if(result.affectedRows){
					console.log(`[INFO] ${message.author.tag} has signed in successfuly.`);
					message.reply({content: 'You has signed in successfuly!'});
				}
				else{
					console.log(`[WARN] ${message.author.tag} cannot sign in.`);
					message.reply({content: 'Sign in failed!'});
				}
			}
		}
  }
});


function getDateFormat(){
	let date = new Date();
	let year = date.getFullYear()
	let month = ('0'+(date.getMonth()*1+1)).substr(-2);
	let day = ('0'+(date.getDate()*1-1)).substr(-2);
	
	return year+'-'+month+'-'+day;
}
function query( sql, values ) {
  return new Promise(( resolve, reject ) => {
    db.getConnection(function(err, connection) {
      if (err){
        reject(err);
      }
	  else { 
        connection.query(sql, values, ( err, rows) => {
			if (err) 
				reject(err);
			else
				resolve(rows);
			
			connection.release();
        });
      }
    })
  })
};

// Log our bot in using the token from https://discordapp.com/developers/applications/me
bot.login(config.token);
