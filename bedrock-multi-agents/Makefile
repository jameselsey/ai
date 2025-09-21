deploy:
    aws cloudformation deploy \
      --region ap-southeast-2 \
      --stack-name toolshop-agents \
      --template-file bedrock-toolshop-agents.yml \
      --capabilities CAPABILITY_NAMED_IAM \
      --parameter-overrides AliasName=prod AgentVersion=DRAFT SourceAccount=429276963313