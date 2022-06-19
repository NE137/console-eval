const {Client, Intents} = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES]});

var stdin = process.openStdin();
var loggedIn = false;

// Setting following variables will change the defaults of the bot
var sguild = ""; 
var suser = "";
var srole = "";
var token = "";

client.on('ready', onReady);
client.on('destroy', onDestroy);

async function onReady() {
  console.clear();
  console.log(`Logged in as ${client.user.tag}!`);
}

async function onDestroy() {
console.log(`Succesfully disconnected!`);
}

stdin.addListener("data", function(d) {
try {
var str = d.toString().trim().split(' ');
	switch (str[0]) {
		case "help": // Give a list of commands
			sendHelpCommand();
			break;
		case "login": // Assign a token and log in
		//if (str[1] == null) {console.log("Please supply a token. Example: login OTY2MjUy4TcwMzAxMzAwNz32.G7QLQf.wmNh5ie-y_HGGCL5-rE58fqnpK5NyoxCFiNPy4"); break;}
		if (str[1] == null) {client.login(token); loggedIn = true; break;}
		token = d.toString().trim().split(' ').slice(1).join(' ');
		client.login(token);
		loggedIn = true;
			break;
		case "clear": // Clear the console
			console.clear();
			break;
		case "logout": // Destroy the session
			if (!loggedIn) { console.log("You must first log in before you can log out"); break; }
			client.destroy();
			token = "";
			loggedIn = false;
			console.log("Session destroyed");
			break;
		case "exit": // Exit the application
			process.exit(0);
		case "set": // Set variables and unlock commands
		if (!loggedIn) { console.log("You must first log in before you can use this command"); break; }
			switch(str[1]) {
				case "guild":
				sguild = str[2];
				console.log("set > Guild set to " + sguild);
				console.log("- All guild related commands have now been unlocked -");
				break;
				
				case "user":
				if (sguild == "") {console.log("Please use the set guild command first"); break;}
				suser = str[2];
				console.log("set > User set to " + suser);
				console.log("- All user related commands have now been unlocked -");
				break;

				case "role":
				if (sguild == "") {console.log("Please use the set guild command first"); break;}
				srole = str[2];
				console.log("set > Role set to " + srole);
				console.log("- All role related commands have now been unlocked -");
				break;

				default:
					
					console.log(`Selected Guild: ${convertGuildIDtoGuildName(sguild)}\nSelected User: ${convertUserIDtoUserName(suser)}\nSelected Role: ${srole}`);
				break;
			}
			break;
		case "guild":
		if (!loggedIn) { console.log("You must first log in before you can use this command"); break; }
		
			switch(str[1]) {
				case "list":
					var guilds = client.guilds.cache;
					var guildList = [];
					guilds.forEach(function(guild) {
					 guildList.push([guild.name, guild.id, guild.memberCount, convertGuildOwnerIDToTag(guild.id)]);
					});
					console.table(guildList);
					console.log("0 = guild name | 1 = guild id | 2 = member count | 3 = Guild Owner | 4 = Invite Code");
					break;
				case "invites":
					if (sguild == "") {console.log("Please use the set guild command first"); break;}
					client.guilds.cache.get(sguild).invites.fetch().then(() => {
						var invites = client.guilds.cache.get(sguild).invites.cache
						var inviteList = [];
						invites.forEach(function(invite) {
							let expiryDate = new Date(invite.expiresTimestamp).toLocaleString();
							if (expiryDate == "1/1/1970, 01:00:00") {expiryDate = "∞"}
							let uses = (invite.maxUses == 0) ? invite.uses : invite.uses +"/"+invite.maxUses;
						 inviteList.push([convertUserIDtoUserName(invite.inviterId), invite.channel.name, uses, expiryDate, "https://discord.gg/"+invite.code]);
						});
						console.table(inviteList);
						console.log("0 = Inviter | 1 = Channel Name | 2 = Usage Counter | 3 = Expiry date | 4 = Invite Code");
					});
					
					break;
				case "roles":
					if (sguild == "") {console.log("Please use the set guild command first"); break;}
					switch(str[2]) {
					case "list":
						var roles = client.guilds.cache.get(sguild).roles.cache
						var roleList = [];
						roles.forEach(function(role) {
						 roleList.push([role.position, role.name, role.id, role.hoist, role.mentionable, role.managed]);
						});
						roleList.sort(function (x, y) {
							return  y[0] - x[0];
						});
						console.table(roleList);
						console.log("0 = role position | 1 =  role name | 2 = role id | 3 = role hoisted? | 4 = role mentionable? | 5 = role managed?");
						break;
					case "create":
						let croleName = str.slice(3).join(' ');
						client.guilds.cache.get(sguild).roles.create().then(role => {
							role.setName(croleName);
							srole = role.id;
						});
						console.log(`Created a new role: ${croleName}`);
					break;
					case "edit":
						if (!srole) {console.log("You must first set a role to interact with it. Use the command set role [roleid]"); break;}
						switch(str[3]) {
							case "name":
								if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
									let roleName = str.slice(4).join(' ');
									client.guilds.cache.get(sguild).roles.cache.get(srole).setName(roleName);
									console.log(`The name of the role ${srole} has been changed to ${roleName}`);
								} else {
									console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
								}
								break;
							case "permission": // https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
								if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
									client.guilds.cache.get(sguild).roles.cache.get(srole).setPermissions(str[4]);
									console.log(`The permissions of the role ${convertRoleIDtoRoleName(srole)} has been changed to ${str[4]}`);
								} else {
									console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
								}
								break;
							case "position":
								if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
									client.guilds.cache.get(sguild).roles.cache.get(srole).setPosition(str[4]);
									console.log(`The position of the role ${convertRoleIDtoRoleName(srole)} has been changed to ${str[4]}`);
								} else {
									console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
								}
								break;
							case "mentionable":
								if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
									let mentionable = client.guilds.cache.get(sguild).roles.cache.get(srole).mentionable;
									client.guilds.cache.get(sguild).roles.cache.get(srole).setMentionable(!mentionable)
									if (mentionable) {console.log(`The role ${convertRoleIDtoRoleName(srole)} is no longer mentionable`);} else {console.log(`The role ${convertRoleIDtoRoleName(srole)} is now mentionable`);}									
								} else {
									console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
								}
								break;
							case "hoisted":
								if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
									let hoisted = client.guilds.cache.get(sguild).roles.cache.get(srole).hoist;
									client.guilds.cache.get(sguild).roles.cache.get(srole).setHoist(!hoisted)
									if (hoisted) {console.log(`The role ${convertRoleIDtoRoleName(srole)} is no longer hoisted`);} else {console.log(`The role ${convertRoleIDtoRoleName(srole)} is now hoisted`);}									
								} else {
									console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
								}
								break;
							case "color":
								if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
									let roleColor = "#"+str[4].replace("#", "");
									client.guilds.cache.get(sguild).roles.cache.get(srole).setColor(roleColor);
									console.log(`The color of the role ${convertRoleIDtoRoleName(srole)} has been changed to ${roleColor}`);
								} else {
									console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
								}
								break;
							default:
								sendHelpCommand();
						}
					break;
					case "remove":
						if (!srole) {console.log("You must first set a role to interact with it. Use the command set role [roleid]"); break;}
						if (client.guilds.cache.get(sguild).roles.cache.get(srole)) {
							client.guilds.cache.get(sguild).roles.cache.get(srole).delete();
							console.log(`The role with ID ${convertRoleIDtoRoleName(srole)} has been deleted from guild ${convertGuildIDtoGuildName(sguild)}`);
						} else {
							console.log(`No role with ID ${srole} exists in guild ${convertGuildIDtoGuildName(sguild)}`);
						}
						srole = "";
					break;
					default:
						sendHelpCommand();
					}
					break;
				case "members": // Fetch all members
				if (sguild == "") {console.log("Please use the set guild command first"); break;}
					var members = client.guilds.cache.get(sguild).members.cache
					var memberList = [];
					
					members.forEach(function(member) {
						var memberNick = member.nickname;
						let memberStatus = (member.presence == null) ? "offline" : member.presence.status
						if (memberNick == null) memberNick = "";
					 memberList.push([member.user.id, member.user.tag, memberNick, memberStatus, member.user.bot, new Date(member.user.createdTimestamp).toLocaleString(), new Date(member.joinedTimestamp).toLocaleString()])
					});
					memberList.sort(function (x, y) {
						return x[1] == y[1] ? 0 : x[1] > y[1] ? 1 : -1;
					});
					console.table(memberList);
					console.log("0 = member id | 1 = member name | 3 = nickname | 4 = bot? | 5 = Account Creation Date | 6 = Join Date");
					break;
				default:
				sendHelpCommand();
				break;
			}
			break;
		case "user":
		if (!loggedIn) { console.log("You must first log in before you can use this command"); break; }
		if (sguild == "") {console.log("Please use the set guild command first"); break;}
		if (suser == "") {console.log("Please use the set user command first"); break;}
			switch(str[1]) {
				case "role":
					switch(str[2]) {
						case "assign":
							let reqrole = str[3];
							if (reqrole == null) reqrole = srole;
							client.guilds.cache.get(sguild).members.cache.get(suser).roles.add(reqrole);
							console.log(`Assigned role ${convertRoleIDtoRoleName(reqrole)} to ${convertUserIDtoUserName(suser)}`);
							break;
						case "remove":
							let reqremrole = str[3];
							if (reqremrole == null) reqremrole = srole;
							client.guilds.cache.get(sguild).members.cache.get(suser).roles.remove(reqremrole);
							console.log(`Removed role ${convertRoleIDtoRoleName(reqremrole)} from ${convertUserIDtoUserName(suser)}`);
							break;
						default: 
							sendHelpCommand();
					}
					break;
				case "kick":
					let kickReason = str.slice(2).join(' ');
					if (client.guilds.cache.get(sguild).members.cache.get(suser).kickable) {
						client.guilds.cache.get(sguild).members.cache.get(suser).kick(kickReason);
						console.log(`Kicked user ${convertUserIDtoUserName(suser)} from guild ${convertGuildIDtoGuildName(sguild)} for ${kickReason}`);
					} else {
						console.error(`Unable to kick member ${convertUserIDtoUserName(suser)}. No Permission to kick this user`)
					}
					suser = "";
					break;
				case "ban":
					let banReason = str.slice(2).join(' ');
					if (client.guilds.cache.get(sguild).members.cache.get(suser).bannable) {
						client.guilds.cache.get(sguild).members.cache.get(suser).ban(banReason);
						console.log(`Banned user ${convertUserIDtoUserName(suser)} from guild ${convertGuildIDtoGuildName(sguild)} for ${banReason}`);
					} else {
						console.error(`Unable to ban member ${convertUserIDtoUserName(suser)}. No Permission to ban this user`)
					}
					suser = "";
					break;
				case "timeout":
					let timeoutTime = str[2] * 60 * 1000;
					let timeoutReason = str.slice(3).join(' ');
					if (client.guilds.cache.get(sguild).members.cache.get(suser).moderatable) {
							client.guilds.cache.get(sguild).members.cache.get(suser).disableCommunicationUntil(Date.now() + timeoutTime, timeoutReason); 
							if (timeoutTime == 0) {
								console.log(`Removed the timeout from ${convertUserIDtoUserName(suser)} in guild ${convertGuildIDtoGuildName(sguild)}`);
							} else {
								console.log(`Timed user ${convertUserIDtoUserName(suser)} out for ${str[2]} minutes in guild ${convertGuildIDtoGuildName(sguild)} for ${timeoutReason}`);
							}
						} else {
							console.log(`Unable to timeout member ${convertUserIDtoUserName(suser)}. No Permission to timeout this user`);
						}
					break;
				case "nickname":
					let newName = str.slice(2).join(' ');
					if (client.guilds.cache.get(sguild).members.cache.get(suser).moderatable) {
						client.guilds.cache.get(sguild).members.cache.get(suser).setNickname(newName);
						console.log(`Changed nickname of ${convertUserIDtoUserName(suser)} in guild ${convertGuildIDtoGuildName(sguild)} to ${newName}`);
					} else {
						console.error(`Unable to change nickname of ${convertUserIDtoUserName(suser)}. No Permission to rename this user`)
					}
					break;
				case "message":
					let message = str.slice(2).join(' ');
						client.guilds.cache.get(sguild).members.cache.get(suser).send(message).catch("Unable to message this member");
						console.log(`Sent the message '${message}' to ${convertUserIDtoUserName(suser)}`);
					break;
				case "info":
					var member = client.guilds.cache.get(sguild).members.cache.get(suser);
					if (member == null) {
						console.log(`Unable to find user ${convertUserIDtoUserName(suser)}`);
						break;
					} else {
						let memberNickname = member.nickname
						let memberStatus = (member.presence == null) ? "offline" : member.presence.status
						let memberBoostStatus = (member.premiumSinceTimestamp == null) ? false : true
						if (member.nickname == null) memberNickname = "";
						var memberInfo = [
							{key: "Username",value: member.user.tag},{key: "Joined",value: new Date(member.joinedTimestamp).toLocaleString()},
							{key: "Nickname",value: memberNickname},{key: "Status",value: memberStatus},
							{key: "Roles",value: member.roles.cache.map(r => `${r.name}`).join(' | ')},
							{key: "Account Creation Date",value: new Date(member.user.createdTimestamp).toLocaleString()},
							{key: "Bot User",value: member.user.bot},
							{key: "Can this user be kicked/banned?",value: member.bannable},
							{key: "Has boosted?",value: memberBoostStatus}
						];
						
						console.table(memberInfo);
					}
					
					break;
				default:
					sendHelpCommand();
			}
			break;
		case "eval":
			console.log(eval(str.slice(1).join(' ')));
			break;
		default:
			sendHelpCommand();
			break;
	}
} catch (err) {
      console.error(err);
    }
    
  });
  
function sendHelpCommand() {
	var commands = [
    {command: "login [token]",description: "Assign a token to the bot and authenticate with the Discord API"},
    {command: "clear",description: "Clear the console"},
    {command: "logout",description: "Destroy your session"},
	{command: "exit",description: "Close the program"},
    {command: "set guild [guildid]",description: "Set the guild to interact with"},
    {command: "set user [userid]",description: "Set the user to interact with"},
	{command: "set role [roleid]",description: "Set the role to interact with"},
	{command: "──────────────────────────────────────────────", description: "───────────────────────────────────────────────────────────────────"},
	{command: "guild list",description: "List all guilds"},
	{command: "guild invites",description: "List all invites"},
	{command: "guild roles list",description: "List all roles in a guild"},
	{command: "guild roles create [name]",description: "Create a role in the guild"},
	{command: "guild roles edit name [name]",description: "Change the name of a role in a guild"},
	{command: "guild roles edit permission [permissionID]",description: "Set the permission level of a role in a guild"},
	{command: "guild roles edit position [position]",description: "Set the position of a role in a guild"},
	{command: "guild roles edit color [hexcolor]",description: "Change the color of a role in a guild"},
	{command: "guild roles edit mentionable",description: "Toggle the mentionable status of a role in a guild"},
	{command: "guild roles edit hoisted",description: "Toggle the hoisted status of a role in a guild"},
	{command: "guild roles remove [roleid]",description: "Remove a role from a guild"},
	{command: "guild members",description: "List all members in a guild"},
	{command: "──────────────────────────────────────────────", description: "───────────────────────────────────────────────────────────────────"},
	{command: "user role assign [roleid]",description: "Assign a role to a member"},
	{command: "user role remove [roleid]",description: "Remove a role from a member"},
	{command: "user kick [reason]",description: "Kick a member from the guild"},
	{command: "user ban [reason]",description: "Ban a member from the guild"},
	{command: "user timeout [time in minutes] [reason]",description: "Timeout a member from the guild"},
	{command: "user nickname [new name]",description: "Change the nickname of a member in the guild"},
	{command: "user message [message]",description: "Send a private message to the member"},
	{command: "user info",description: "See more information about a member"},
	{command: "──────────────────────────────────────────────", description: "───────────────────────────────────────────────────────────────────"},
	{command: "eval [command]",description: "Evaluate a command"}
];
			console.table(commands);
}
  
function convertRoleIDtoRoleName(roleID) {
	if (sguild == "") return userID;
	if (client.guilds.cache.get(sguild).roles.cache.get(roleID)) {
		return client.guilds.cache.get(sguild).roles.cache.get(roleID).name;	} else {return roleID}
}

function convertUserIDtoUserName(userID) {
	if (sguild == "") return userID;
	if (client.guilds.cache.get(sguild).members.cache.get(userID)) {
	return client.guilds.cache.get(sguild).members.cache.get(userID).user.username; } else {return userID}
} 

function convertGuildOwnerIDToTag(guildID) {
	return client.guilds.cache.get(guildID).members.cache.get(client.guilds.cache.get(guildID).ownerId).user.tag;
}

function convertGuildIDtoGuildName(guildID) {
	if (client.guilds.cache.get(sguild)) {
	return client.guilds.cache.get(sguild).name; } else {return guildID}
}

console.log("─────────────────────────────────────────────────────");
console.log("Welcome to the Discord Console written by Nyx");
console.log("View all available commands with the 'help' command");
console.log("─────────────────────────────────────────────────────");

process.on('uncaughtException', function(err) {
	console.log('Error: ' + err);
  });