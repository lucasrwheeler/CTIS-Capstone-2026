//connect terraform to my AWS
terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# IAM ROLE MUST COME FIRST
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC MODULE
module "vpc" {
  source = "./vpc"

  project           = var.project
  vpc_cidr          = var.vpc_cidr
  public_subnet_a   = var.public_subnet_a
  public_subnet_b   = var.public_subnet_b
  private_subnet_a  = var.private_subnet_a
  private_subnet_b  = var.private_subnet_b
  az_a              = var.az_a
  az_b              = var.az_b
}

# RDS MODULE
module "rds" {
  source = "./rds"

  project            = var.project
  vpc_id             = module.vpc.vpc_id
  private_subnets    = module.vpc.private_subnets
  lambda_cidr_blocks = ["10.0.0.0/16"]

  db_username = var.db_username
  db_password = var.db_password
}

# LAMBDA MODULES
module "eligibility_lambda" {
  source      = "./lambda"
  lambda_name = "eligibility"
  handler     = "index.handler"
  source_path = "${path.root}/../lambda/eligibility"
  role_arn    = aws_iam_role.lambda_exec_role.arn
}

module "degree_audit_lambda" {
  source      = "./lambda"
  lambda_name = "degree_audit"
  handler     = "index.handler"
  source_path = "${path.root}/../lambda/degree-audit"
  role_arn    = aws_iam_role.lambda_exec_role.arn
}

module "plan_lambda" {
  source      = "./lambda"
  lambda_name = "plan"
  handler     = "index.handler"
  source_path = "${path.root}/../lambda/plan"
  role_arn    = aws_iam_role.lambda_exec_role.arn
}

# API GATEWAY MODULE
module "api_gateway" {
  source = "./api_gateway"

  eligibility_lambda_invoke_arn  = module.eligibility_lambda.invoke_arn
  degree_audit_lambda_invoke_arn = module.degree_audit_lambda.invoke_arn
  plan_lambda_invoke_arn         = module.plan_lambda.invoke_arn
}

module "iam" {
  source = "./iam"
}

# module "frontend" {
#   source = "./frontend"
# }
