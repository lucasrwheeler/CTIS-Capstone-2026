variable "eligibility_lambda_invoke_arn" { type = string }
variable "degree_audit_lambda_invoke_arn" { type = string }
variable "plan_lambda_invoke_arn" { type = string }
resource "aws_api_gateway_authorizer" "cognito_auth" {
  name            = "CognitoAuth"
  rest_api_id     = aws_api_gateway_rest_api.advising_api.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [var.cognito_user_pool_arn]
  identity_source = "method.request.header.Authorization"
}