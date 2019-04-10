# Streakbot
A bot for DevStreak to track and manage streaks. Built with discord.js.

## Setup & testing
Giving out the bot's login secret is dangerous so you'll need to make your own bot and add it to your own server to test it.

1. Follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html) on how to setup your own bot
2. Create a file called ".env" and make the contents `BOT_SECRET=yourbotsecret`
3. Run `npm install -g nodemon` (nodemon auto restarts the app if you make any changes)
4. Run `npm start` to start testing
5. If you want to play with gifs you need to get a [Giphy API key](https://developers.giphy.com) and add `GIPHY_KEY=yourgiphykey` to the .env file

Follow [this guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links) to learn how to add a bot to your own server.

### Server configuration
In order to use the bot properly in your own server there are 3 steps that you do:
1. Have channels in your server named: `art,design,gameplay,music,level-design,production,writing,testland`. Include any or all of these channels, these are the channels people can build up a streak in. Currently this is hardcoded and you cannot have streak channels with other names. This is mandatory for a working bot.
2. Have a channel named `announcements`, this is the channel the bot will make announcements in. This is also hardcoded and the name cannot be changed. This is optional.
3. Specify an active streak role and top streak role. You can do this with the `!setrole` command. (usage: `!setrole [top/active] [rolename/id]`) 

**example:** If your active streaks role is named `Active Streak`, you would set this by typing `!setrole active Active Streak`. 
You can also give the id of the role instead of its name.