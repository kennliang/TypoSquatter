var amqp = require('amqplib')

const connection = async (queueName = 'tasks') => {
  try
  {
    var conn = await connect()
    var channel = await createChannel(conn)
    var assertedChannelToQueue = await channelAssertQueue(channel, queueName)
    return channel
  }
  catch(err)
  {
    console.log("\nError setting up rabbitmq connection.")
    console.log(err)
  }
}

const connect = async(url = 'amqp://localhost') => {
  try {
    return amqp.connect(url)
  }
  catch(err) {
    throw err;
  }
}

const createChannel = async(conn) => {
  try {
    return await conn.createChannel()
  }
  catch(err) {
    throw err;
  }
}

const channelAssertQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName, {
      durable: true
    })
    return channel
  }
  catch(err){
    throw err;
  }
}

module.exports = connection