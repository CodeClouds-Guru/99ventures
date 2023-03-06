const AWS = require('aws-sdk')

class SqsHelper {
    constructor(){
        this.queue_url = process.env.SQS_QUEUE_URL;
        this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    }
    //aws sqs config
    async awsSqsConfig(){
        AWS.config.update({
            region: process.env.AWS_DEFAULT_REGION,
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          });
          
          this.sqs = new AWS.SQS({apiVersion: '2012-11-05'}); 
    }
    //send data
    async sendData(body){
        await this.awsSqsConfig()
        try {
            const { name, author, description } = body
            const params = {
              MessageBody: JSON.stringify(body),
              QueueUrl: this.queue_url
            };
            const data = await this.sqs.sendMessage(params).promise();
            return { success: true, data }
          } catch(error) {
            console.log(" sendData error", error)
            return { success: false, data: null }
          }
    }
    // Receive Data from SQS
    async receiveData() {
    await this.awsSqsConfig()
    try {
      const params = {
        QueueUrl: this.queue_url,
      }
      const data = await this.sqs.receiveMessage(params).promise()
      return { success: true, data }
    } catch(error) {
      return { success: false, data: null }
    }
    }

    // Delete Data from SQS
    async deleteData(receipt) {
        await this.awsSqsConfig()
        try {
        const params = {
            QueueUrl: this.queue_url,
            ReceiptHandle: receipt,
        }
        const data = await this.sqs.deleteMessage(params).promise();
        console.log("deleteData ", data)
        return { success: true, data: "Message Deleted Successfully" }
        } catch(error) {
        return { success: false, data: null }
        }
    }
}
module.exports = SqsHelper