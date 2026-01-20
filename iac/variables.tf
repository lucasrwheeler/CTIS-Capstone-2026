variable "project" {
  type = string
  default = "guilford-capstone"
}

variable "vpc_cidr" {
  type = string
  default = "10.0.0.0/16"
}

variable "public_subnet_a" {
  type = string
  default = "10.0.1.0/24"
}

variable "public_subnet_b" {
  type = string
  default = "10.0.2.0/24"
}

variable "private_subnet_a" {
  type = string
  default = "10.0.3.0/24"
}

variable "private_subnet_b" {
  type = string
  default = "10.0.4.0/24"
}

variable "az_a" {
  type = string
  default = "us-east-1a"
}

variable "az_b" {
  type = string
  default = "us-east-1b"
}