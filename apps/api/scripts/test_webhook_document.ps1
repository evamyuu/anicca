$url = "http://localhost:8000/api/v1/whatsapp/webhook"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    "data" = @(
        @{
            "messageType" = "document"
            "key" = @{
                "remoteJid" = "5511980991729@s.whatsapp.net"
                "id" = "MSG_DOC_123"
            }
            "body" = @{
                "url" = "https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Document/SVG/ic_fluent_document_24_regular.svg"
            }
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
