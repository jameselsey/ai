# Lex Bot with Bedrock Knowledge Base Demo

This demo creates an Amazon Lex V2 conversational bot integrated with Amazon Bedrock Knowledge Base. The bot can answer customer questions by retrieving information from documents stored in S3 and using Claude 3 Haiku to generate natural responses. It uses S3 Vectors for efficient similarity search and Amazon Titan embeddings for document vectorization.

## How to Run

1. **Deploy the CloudFormation stack**
   ```bash
   aws cloudformation create-stack \
     --stack-name wombat-tools-lex-bot \
     --template-body file://lex-bot-cloudformation.yaml \
     --capabilities CAPABILITY_NAMED_IAM \
     --region ap-southeast-2
   ```
   Wait for the stack to complete (this may take several minutes).

2. **Copy the FAQ document to the S3 bucket**
   ```bash
   # Get the bucket name from stack outputs
   BUCKET_NAME=$(aws cloudformation describe-stacks \
     --stack-name wombat-tools-lex-bot \
     --query 'Stacks[0].Outputs[?OutputKey==`KnowledgeBaseBucketName`].OutputValue' \
     --output text \
     --region ap-southeast-2)
   
   # Upload the FAQ document
   aws s3 cp knowledgebase-faq.md s3://$BUCKET_NAME/
   ```

3. **Sync the Knowledge Base data source**
   ```bash
   # Get the Knowledge Base ID and Data Source ID
   KB_ID=$(aws cloudformation describe-stacks \
     --stack-name wombat-tools-lex-bot \
     --query 'Stacks[0].Outputs[?OutputKey==`KnowledgeBaseId`].OutputValue' \
     --output text \
     --region ap-southeast-2)
   
   DS_ID=$(aws cloudformation describe-stacks \
     --stack-name wombat-tools-lex-bot \
     --query 'Stacks[0].Outputs[?OutputKey==`DataSourceId`].OutputValue' \
     --output text \
     --region ap-southeast-2)
   
   # Start ingestion job
   aws bedrock-agent start-ingestion-job \
     --knowledge-base-id $KB_ID \
     --data-source-id $DS_ID \
     --region ap-southeast-2
   ```
   Wait for the ingestion job to complete (check status in the Bedrock console).

4. **Test the Lex bot**
   - Open the Amazon Lex console in ap-southeast-2
   - Navigate to your bot (default name: wombat-tools-lex)
   - Use the "Test" button to interact with the bot
   - Try questions like:
     - "What are your business hours?"
     - "Do you offer international shipping?"
     - "What is your return policy?"
