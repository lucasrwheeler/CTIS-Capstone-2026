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
}

module "rds" {
  source = "./rds"
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
