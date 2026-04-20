resource "aws_cognito_user_pool" "ctis_pool" {
  name = "ctis-portal-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Guilford CTIS Portal - Verify your email"
    email_message        = "Your verification code is {####}"
  }

  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      min_length = 0
      max_length = 50
    }
  }

  schema {
    name                = "professor_name"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      min_length = 0
      max_length = 255
    }
  }
}

resource "aws_cognito_user_pool_client" "ctis_client" {
  name                                 = "ctis-portal-client"
  user_pool_id                         = aws_cognito_user_pool.ctis_pool.id
  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.ctis_pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.ctis_client.id
}

output "cognito_region" {
  value = "us-east-1"
}