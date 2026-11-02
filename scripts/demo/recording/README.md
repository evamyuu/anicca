# Gravação automática da demo (≈ 1:25)

Grava em 1080p a demo sem narração: **paciente** (WhatsApp + app da Rosa), **cuidador** (app do Lucas)
e **médica** (painel da Dra. Sandra). Resultado pronto: `docs/demo/anicca-demo.mp4`.

Roteiro: Rosa avisa pelo WhatsApp que tomou o remédio (app dela e tarefas do Lucas atualizam) →
manda foto de uma pinta (Body Map + nota S/O/A/P) → relata febre (protocolo de emergência; Lucas vê na Rotina) →
painel: Alertas → IA clínica "E a pinta?" com Fontes (PubMed) → Ficha Clínica.

## Como regravar (Linux com Xvfb + ffmpeg)

Suba os 3 serviços (o app **precisa** apontar para o servidor de demo):

```bash
node scripts/demo/server.mjs
```

```bash
cd apps/mobile && EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1 npx expo start --web --offline --port 8081
```

```bash
cd apps/web && npx next dev -p 3000
```

Ensaio headless com capturas em `scripts/demo/recording/.shots/`:

```bash
MODE=dry node scripts/demo/recording/run.cjs
```

Gravação (gera `scripts/demo/recording/raw.mp4`; o script reinicia o estado da demo sozinho):

```bash
xvfb-run -a -s "-screen 0 1920x1200x24" bash -c 'MODE=rec node scripts/demo/recording/run.cjs'
```

Acabamento (fade e remoção da dica de link do Chrome no canto inferior esquerdo):

```bash
ffmpeg -i scripts/demo/recording/raw.mp4 -filter_complex "[0]split[a][b];[b]crop=156:26:0:1028[p];[a][p]overlay=0:1054,fade=t=in:st=0:d=0.4" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart -an docs/demo/anicca-demo.mp4
```
