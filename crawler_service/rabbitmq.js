var amqp = require('amqplib')
//var process_task = require('./client.js')

const connection = async (queueName = 'tasks') => {
  try
  {
    var conn = await connect()
    var channel = await createChannel(conn)
    var assertedChannelToQueue = await channelAssertQueue(channel, queueName)
    channel.consume('tasks',process_task, {
      noAck: true
    })
    return channel
  }
  catch(err)
  {
    console.log("\nError setting up rabbitmq connection.")
    console.log(err)
  }
}

function process_task(msg){
  console.log(" [x] Received %s", msg.content.toString());
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

module.exports = connection()