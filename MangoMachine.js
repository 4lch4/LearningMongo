#! /usr/bin/env node

const config = require('./util/config.json')

const Eris = require('eris')
const bot = new Eris.CommandClient(config.discord.token, {}, {
  defaultHelpCommand: false,
  description: 'A test bot.',
  owner: 'Alcha',
  name: 'MangoMachine',
  prefix: config.botPrefix
})

const mongoUrl = 'mongodb://localhost:27017/tron'
const MongoClient = require('mongodb')

bot.registerCommand('insert', (msg, args) => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err
    const user = require('./beans/User.json')

    db.collection('users').insertOne(user, (err, res) => {
      if (err) throw err
      else if (res.result.ok === 1) sendMessage(msg.channel.id, 'User successfully inserted to database!')

      db.close()
    })
  })
})

bot.registerCommand('find', (msg, args) => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err
    const query = { userId: parseInt(msg.author.id) }
    console.log(query)

    db.collection('users').find(query).toArray((err, res) => {
      if (err) throw err

      console.log(res)
    })
  })
})

/**
 * Evaluates and returns the given args value as Javascript.
 * @param {*} args
 */
const evaluate = (msg, args) => {
  try {
    return eval(args.join(' '))
  } catch (err) {
    return err.message
  }
}

/**
* Command Name: Evaluate
* Description : The eval command for Tron that is *only* available to me (Alcha).
* Requested By: Alcha (heh)
*/
bot.registerCommand('evaluate', (msg, args) => {
  if (msg.author.id === config.owner) {
    sendMessage(msg.channel.id, '`' + evaluate(msg, args) + '`', undefined)
  }
}, {
  aliases: ['eval']
})

/**
 * Sends a message to the given channel using the bot constant. The first two
 * fields are required as they say where to send what. The third, file, field,
 * is optional as it can be used for sending files.
 *
 * @param {number} channelId
 * @param {*} message
 * @param {*} file
 */
const sendMessage = (channelId, message, file) => {
  bot.createMessage(channelId, message, file).catch(err => {
    if (err) {
      console.log('There was an error when attempting to send a message:')
      console.log(err)
    }
  })
}

bot.on('ready', () => {
  console.log('Mangos up and running!')
})

bot.connect()
