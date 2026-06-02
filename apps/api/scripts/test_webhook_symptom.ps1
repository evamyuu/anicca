$url = "http://localhost:8000/api/v1/whatsapp/webhook"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    "data" = @(
        @{
            "messageType" = "conversation"
            "key" = @{
                "remoteJid" = "5511980991729@s.whatsapp.net"
                "id" = "MSG_SYMPTOM_123"
            }
            "message" = @{
                "conversation" = "Estou com muita dor de cabeca e febre alta de 39 graus."
            }
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
