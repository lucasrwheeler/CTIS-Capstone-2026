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

//Connect modules to my root

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


module "rds" {
  source = "./rds"

  project          = var.project
  vpc_id           = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnets
  lambda_cidr_blocks = ["10.0.0.0/16"]

  db_username = var.db_username
  db_password = var.db_password
}

module "lambda" {
  source = "./lambda"
}

module "api" {
  source = "./api"
}

module "iam" {
  source = "./iam"
}

module "frontend" {
  source = "./frontend"
}
