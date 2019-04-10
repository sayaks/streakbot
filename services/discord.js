const db = require('../db')
const giphy = require('./giphy')
const constants = require('../constants')
let client = null

exports.init = discordClient => {
  client = discordClient
}

assignTopStreakRoles = () => {
  // assign/remove top streak role
  client.guilds.forEach(guild => {
    const highscores = db.getTopStreaks(guild.id)
    if(highscores.length === 0) return

    if (guild && guild.available) {
      guild.members.forEach(user => {
        const roleid = db.getRole(guild.id, 'top')
        if (!roleid) { return }
        user.removeRole(roleid).then(() => {
          if(db.userHasHighscore(guild.id, user.id)) {
            user.addRole(roleid, 'Has a top streak at the end of the day')
          }
        })
      })  
    }
  })
}

removeActiveStreakRoles = () => {
  client.guilds.forEach(guild => {
    if (guild && guild.available) {
      db.checkStreaks(client.users)
  
      for(let user of db.getUsers()) {
        if(db.getUserActiveStreaks(user.userID).filter(streak => {streak.guildID === guild.id}).length === 0) {
          const guildMember = guild.members.find(u => u.id === user.userID)
          const roleid = db.getRole(guild.id, 'top')
          if (!roleid) { return }
          if(guildMember) guildMember.removeRole(roleid, 'No active streaks')
        }
      }
    }  
  })
}

exports.broadcastNewDay = () => {
  console.log(`It's a new day!`)
  const channel = client.channels.find(c => c.name === 'announcements')

  giphy.getMedia('morning', media => {
    channel.send('Today is a brand new day! Make sure to keep up all your active streaks!', {
       files: [{
          attachment: media,
          name: 'giphy.gif'
       }]
    })
  
    removeActiveStreakRoles()

    setTimeout(() => {
      broadcastTopStreaks()
      broadcastAllActiveStreaks()
      assignTopStreakRoles()
    }, 5000)
  })
}

exports.broadcastWarning = hoursRemaining => {
  console.log(`Broadcasting ${hoursRemaining} hours remaining`)
  const channel = client.channels.find(c => c.name === 'announcements')

  giphy.getMedia('countdown', media => {
    channel.send(`Only ${hoursRemaining} hours to go until the day ends. Make sure to continue your streaks!`, {
      files: [{
          attachment: media,
          name: 'giphy.gif'
      }]
    })
  })
}

broadcastTopStreaks = () => {
  client.guilds.forEach(guild => {
    const highscores = db.getTopStreaks(guild.id)
    if(highscores.length === 0) return
  
    const channel = client.channels.find(c => c.name === 'announcements')
    channel.send('🏆 Here are the current highest streaks:')
  
    let topStreaks = []
  
    for(let highscore of highscores) {
      let user = client.users.find(u => u.id === highscore.userID)
      if(!db.getMentionSettingForUser(highscore.userID)) user = user.username
      topStreaks.push(`Top streak in *${highscore.channelName}* is ${user} with ${highscore.streakLevel} ${highscore.streakLevel === 1 ? 'day' : 'days'}!`)
    }
  
    channel.send(topStreaks.join('\n') + '\nTip: you can turn off mentions using !togglementions')  
  })
}

broadcastAllActiveStreaks = () => {
  client.guilds.foreach(guild => {
    const channel = guild.channels.find(c => c.name === "announcements")
    channel.send(`🔥 Here are all the active streaks:\n` + exports.buildActiveStreaksMessage(guild.id))  
  })
}

// TODO Fix calls for this
exports.buildActiveStreaksMessage = (guildID) => {
  const streaks = db.getActiveStreaks(guildID)
  if(streaks.length === 0) return
  
  return streaks.map(channelStreaks => {
    let sortedChannelStreaks = channelStreaks.sort((a, b) => {
      if(a.streakLevel === b.streakLevel) {
        const userA = client.users.find(u => u.id === a.userID).username
        const userB = client.users.find(u => u.id === b.userID).username
        return userA.localeCompare(userB)
      }
      return b.streakLevel - a.streakLevel
    })

    let userStreaks = []
    for(let channelStreak of sortedChannelStreaks) {
      const user = client.users.find(u => u.id === channelStreak.userID).username
      userStreaks.push(`*${user}* with ${channelStreak.streakLevel} ${channelStreak.streakLevel === 1 ? 'day' : 'days'} in ${channelStreak.channelName}`)
    }
    return userStreaks.join(', ')
  }).join('\n')
}

exports.assignActiveStreakRole = (guild, userID) => {
  if (guild && guild.available) {
    const user = guild.members.find(u => u.id === userID)
    user.addRole(db.getRole(guild.id, 'active'), 'Has a top streak at the end of the day')
  }  
}

exports.getUsername = userID => {
  const user = client.users.find(u => u.id === userID)
  if(user) return user.username
  return null
}

exports.findMessage = async (channelName, messageID) => {
  for (let channel of client.guilds.get(constants.DevStreakGuildID).channels.array()) {
    if(channel.name === channelName) {
      const message = await channel.fetchMessage(messageID).catch(error => {
        console.log(`Couldn't find message ID ${messageID}`)
        return null
      })
      if(!message) return null

      return {
        messageID,
        content: message.content,
        attachments: message.attachments.array().map(attachment => {
          return attachment.url
        })
      }
    }
  }
}
