resource "aws_api_gateway_rest_api" "advising_api" {
  name = "advising-api"
}

resource "aws_api_gateway_resource" "eligibility" {
  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  parent_id   = aws_api_gateway_rest_api.advising_api.root_resource_id
  path_part   = "eligibility"
}

resource "aws_api_gateway_resource" "degree_audit" {
  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  parent_id   = aws_api_gateway_rest_api.advising_api.root_resource_id
  path_part   = "degree_audit"
}

resource "aws_api_gateway_resource" "plan" {
  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  parent_id   = aws_api_gateway_rest_api.advising_api.root_resource_id
  path_part   = "plan"
}

resource "aws_api_gateway_method" "eligibility_post" {
  rest_api_id   = aws_api_gateway_rest_api.advising_api.id
  resource_id   = aws_api_gateway_resource.eligibility.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "degree_audit_post" {
  rest_api_id   = aws_api_gateway_rest_api.advising_api.id
  resource_id   = aws_api_gateway_resource.degree_audit.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "plan_post" {
  rest_api_id   = aws_api_gateway_rest_api.advising_api.id
  resource_id   = aws_api_gateway_resource.plan.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "eligibility_integration" {
  rest_api_id             = aws_api_gateway_rest_api.advising_api.id
  resource_id             = aws_api_gateway_resource.eligibility.id
  http_method             = aws_api_gateway_method.eligibility_post.http_method
  type                    = "AWS_PROXY"
  uri                     = var.eligibility_lambda_invoke_arn
  integration_http_method = "POST"
}

resource "aws_api_gateway_integration" "degree_audit_integration" {
  rest_api_id             = aws_api_gateway_rest_api.advising_api.id
  resource_id             = aws_api_gateway_resource.degree_audit.id
  http_method             = aws_api_gateway_method.degree_audit_post.http_method
  type                    = "AWS_PROXY"
  uri                     = var.degree_audit_lambda_invoke_arn
  integration_http_method = "POST"
}

resource "aws_api_gateway_integration" "plan_integration" {
  rest_api_id             = aws_api_gateway_rest_api.advising_api.id
  resource_id             = aws_api_gateway_resource.plan.id
  http_method             = aws_api_gateway_method.plan_post.http_method
  type                    = "AWS_PROXY"
  uri                     = var.plan_lambda_invoke_arn
  integration_http_method = "POST"
}

resource "aws_api_gateway_method_response" "eligibility_cors" {
  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  resource_id = aws_api_gateway_resource.eligibility.id
  http_method = aws_api_gateway_method.eligibility_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "degree_audit_cors" {
  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  resource_id = aws_api_gateway_resource.degree_audit.id
  http_method = aws_api_gateway_method.degree_audit_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "plan_cors" {
  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  resource_id = aws_api_gateway_resource.plan.id
  http_method = aws_api_gateway_method.plan_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_lambda_permission" "eligibility_permission" {
  statement_id  = "AllowAPIGatewayInvokeEligibility"
  action        = "lambda:InvokeFunction"
  function_name = "eligibility"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.advising_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "degree_audit_permission" {
  statement_id  = "AllowAPIGatewayInvokeDegreeAudit"
  action        = "lambda:InvokeFunction"
  function_name = "degree_audit"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.advising_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "plan_permission" {
  statement_id  = "AllowAPIGatewayInvokePlan"
  action        = "lambda:InvokeFunction"
  function_name = "plan"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.advising_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "advising_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.eligibility_integration,
    aws_api_gateway_integration.degree_audit_integration,
    aws_api_gateway_integration.plan_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.advising_api.id
  stage_name  = "prod"
}