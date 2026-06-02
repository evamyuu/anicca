$url = "http://localhost:8000/api/v1/whatsapp/webhook"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    "data" = @(
        @{
            "messageType" = "interactive"
            "key" = @{
                "remoteJid" = "5511980991729@s.whatsapp.net"
                "id" = "MSG_INTERACTIVE_123"
            }
            "message" = @{
                "interactiveResponseMessage" = @{
                    "body" = @{
                        "text" = "Sim"
                    }
                    "nativeFlowResponseMessage" = @{
                        "name" = "quick_reply"
                        "paramsJson" = '{"id":"sim"}'
                    }
                }
            }
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
